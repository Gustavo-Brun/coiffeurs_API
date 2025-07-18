import { $Enums, PrismaClient, QueueEntry } from '@prisma/client';
import Types from '@/@types/default/queues';

const prisma = new PrismaClient();
class QueuesModel {
  create = async (providerId: number) => {
    return await prisma.queues.create({
      data: {
        providerId
      }
    });
  };

  getOne = async (providerId: number) => {
    return await prisma.queues.findUnique({
      where: {
        providerId
      },
      include: {
        entries: {
          include: {
            client: true
          }
        }
      }
    });
  };

  getByid = async (id: string) => {
    return await prisma.queues.findUnique({
      where: {
        id
      },
      include: {
        entries: true
      }
    });
  };

  addEntry = async (queueId: string, clientId: number, note?: string) => {
    const latestEntry = await prisma.queueEntry.findFirst({
      where: {
        queueId,
        status: 'WAITING'
      },
      orderBy: {
        order: 'desc'
      },
      select: {
        order: true
      }
    });

    const nextOrder = latestEntry ? latestEntry.order + 1 : 1;

    return await prisma.queueEntry.create({
      data: {
        clientId,
        queueId,
        note,
        order: nextOrder
      }
    });
  };

  getEntryById = async (entryId: number) => {
    return await prisma.queueEntry.findUnique({
      where: {
        id: entryId
      },
      include: {
        client: true
      }
    });
  };

  editEntryOrder = async (entryId: number, direction: 'UP' | 'DOWN') => {
    return prisma
      .$transaction(async (tx) => {
        const entryA = await tx.queueEntry.findUnique({
          where: { id: entryId }
        });

        if (!entryA) {
          throw new Error(
            `Fila com ID ${entryId} nao encontrada. Se o problema persistir, entre em contato com o suporte.`
          );
        }

        const currentOrderA = entryA.order;
        const queueId = entryA.queueId;

        let targetOrderB: number;
        if (direction === 'UP') {
          targetOrderB = currentOrderA - 1;
        } else {
          // direction === 'DOWN'
          targetOrderB = currentOrderA + 1;
        }

        if (direction === 'UP' && currentOrderA === 1) {
          throw new Error('Não é possível mover para frente: O cliente já está no início da fila.');
        }

        const entryB = await tx.queueEntry.findFirst({
          where: {
            queueId: queueId,
            order: targetOrderB
          }
        });

        if (!entryB) {
          throw new Error('Não é possível mover para trás: O cliente já esta no fim da fila. ');
        }

        const currentOrderB = entryB.order;

        await tx.queueEntry.update({
          where: {
            id: entryA.id,
            queueId: queueId
          },
          data: {
            order: -1
          }
        });

        await tx.queueEntry.update({
          where: {
            id: entryB.id,
            queueId: queueId
          },
          data: {
            order: currentOrderA
          }
        });

        const updatedEntryA = await tx.queueEntry.update({
          where: {
            id: entryA.id,
            queueId: queueId
          },
          data: {
            order: currentOrderB
          }
        });

        return { entry: { id: entryA.id, oldOrder: currentOrderA, newOrder: updatedEntryA.order } };
      })
      .catch((error: Error) => {
        console.error(error);

        return { errorMessage: error.message };
      });
  };

  getClientLastEntry = async (providerId: number, clientId: number) => {
    const queue = await prisma.queues.findUnique({
      where: {
        providerId
      },
      select: {
        id: true
      }
    });

    if (!queue) {
      return null;
    }

    const lastClientEntry = await prisma.queueEntry.findFirst({
      where: {
        queueId: queue.id,
        clientId: clientId
      },
      orderBy: {
        joinedAt: 'desc'
      },
      select: {
        joinedAt: true
      }
    });

    return lastClientEntry;
  };

  finishCycle = async (entryId: number) => {
    return prisma
      .$transaction(async (tx) => {
        const entryToComplete = await tx.queueEntry.findUnique({
          where: {
            id: entryId
          }
        });

        if (!entryToComplete) {
          throw new Error(
            `Agendamento com ID ${entryId} nao encontrado. Se o problema persistir, entre em contato com o suporte.`
          );
        }

        const queueId = entryToComplete.queueId;
        const originalOrder = entryToComplete.order;

        const updatedCompletedEntry = await tx.queueEntry.update({
          where: {
            id: entryToComplete.id
          },
          data: {
            status: 'COMPLETED',
            order: -1
          }
        });

        await tx.queueEntry.updateMany({
          where: {
            queueId: queueId,
            order: {
              gt: originalOrder
            }
          },
          data: {
            order: {
              decrement: 1
            }
          }
        });

        if (updatedCompletedEntry.status !== 'COMPLETED') {
          throw new Error(
            'Nao foi possivel concluir o ciclo. Se o problema persistir, entre em contato com o suporte.'
          );
        }

        return {
          entry: {
            id: updatedCompletedEntry.id,
            status: updatedCompletedEntry.status,
            order: updatedCompletedEntry.order
          }
        };
      })
      .catch((error: Error) => {
        console.log(error);

        return { errorMessage: error.message };
      });
  };

  cancelCycle = async (entryId: number) => {
    return prisma
      .$transaction(async (tx) => {
        const entryToCancel = await tx.queueEntry.findUnique({
          where: {
            id: entryId
          }
        });

        if (!entryToCancel) {
          throw new Error(
            `Agendamento com ID ${entryId} nao encontrado. Se o problema persistir, entre em contato com o suporte.`
          );
        }

        const queueId = entryToCancel.queueId;
        const originalOrder = entryToCancel.order;

        const updatedCanceledEntry = await tx.queueEntry.update({
          where: {
            id: entryToCancel.id
          },
          data: {
            status: 'REMOVED',
            order: -2
          }
        });

        await tx.queueEntry.updateMany({
          where: {
            queueId: queueId,
            order: {
              gt: originalOrder
            }
          },
          data: {
            order: {
              decrement: 1
            }
          }
        });

        if (updatedCanceledEntry.status !== 'REMOVED') {
          throw new Error(
            'Nao foi possivel cancelar o ciclo. Se o problema persistir, entre em contato com o suporte.'
          );
        }

        return {
          entry: {
            id: updatedCanceledEntry.id,
            status: updatedCanceledEntry.status,
            order: updatedCanceledEntry.order
          }
        };
      })
      .catch((error: Error) => {
        console.log(error);

        return { errorMessage: error.message };
      });
  };
}

export default QueuesModel;
