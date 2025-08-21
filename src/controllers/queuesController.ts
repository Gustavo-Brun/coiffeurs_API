import { FastifyReply } from 'fastify';

import QueuesTypes from '@/@types/default/queues';
import { AuthorizationData, AuthRequest } from '@/@types/hooks/auth';

import ClientsModel from '@/database/clients';
import QueuesModel from '@/database/queues';

const clientsModel = new ClientsModel();
const queuesModel = new QueuesModel();

export default class QueuesController {
  addToQueue = async (
    req: AuthRequest,
    reply: FastifyReply,
    client?: { providerId: number; clientId: number; note?: string }
  ) => {
    try {
      if (client) {
        const queue = await queuesModel.getOne(client.providerId);

        if (!queue) return null;

        const clientAdded = await queuesModel.addEntry(queue.id, client.clientId, client.note);

        if (!clientAdded) return null;

        return clientAdded;
      }

      const { providerId } = req.auth as AuthorizationData;
      const { clientId, note } = req.body as { clientId: number; note?: string };

      const clientExists = await clientsModel.getById(clientId);

      if (!clientExists) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'QUE-AQ04',
          errorMessage: 'Erro inesperado ao adicionar o cliente na fila.'
        });
      }

      const queue = await queuesModel.getOne(providerId);

      if (!queue) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'QUE-AQ03',
          errorMessage: 'Erro inesperado ao adicionar o cliente na fila.'
        });
      }

      if (queue.entries.find((i) => i.clientId === clientExists.id && i.status === 'WAITING')) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'QUE-AQ05',
          errorMessage: 'Este cliente já esta na fila.'
        });
      }

      const clientAdded = await queuesModel.addEntry(queue.id, clientExists.id, note);

      if (!clientAdded) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'QUE-AQ02',
          errorMessage: 'Erro inesperado ao adicionar o cliente na fila.'
        });
      }

      return reply.code(200).send({ data: { clientAdded: clientAdded } });
    } catch (error) {
      console.log(error);

      return reply.code(500).send({
        status: 500,
        errorCode: 'QUE-AQ01',
        errorMessage: 'Erro inesperado ao adicionar o cliente na fila.'
      });
    }
  };

  listQueue = async (req: AuthRequest, reply: FastifyReply) => {
    try {
      const { providerId } = req.auth as AuthorizationData;
      const { date, startDate, endDate } = req.query as {
        date?: string;
        startDate?: string;
        endDate?: string;
      };

      const queue = await queuesModel.getOne(providerId);

      if (!queue) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'QUE-LQ02',
          errorMessage: 'Erro inesperado ao listar a fila.'
        });
      }

      const orderedEntries = queue.entries.sort((a, b) => a.order - b.order);

      if (date) {
        const entriesByDate = orderedEntries.filter(
          (i) => i.joinedAt.toISOString().split('T')[0] === date
        );

        const payload = { ...queue, entries: entriesByDate };

        return reply.code(200).send({ data: payload });
      }

      if (startDate && endDate) {
        const entriesByDate = orderedEntries.filter(
          (i) =>
            i.joinedAt.toISOString().split('T')[0] >= startDate &&
            i.joinedAt.toISOString().split('T')[0] <= endDate
        );

        const payload = { ...queue, entries: entriesByDate };

        return reply.code(200).send({ data: payload });
      }

      const payload = { ...queue, entries: orderedEntries };

      return reply.code(200).send({ data: payload });
    } catch (error) {
      console.log(error);

      return reply.code(500).send({
        status: 500,
        errorCode: 'QUE-LQ01',
        errorMessage: 'Erro inesperado ao listar a fila.'
      });
    }
  };

  editOrder = async (req: AuthRequest, reply: FastifyReply) => {
    try {
      const { queueId, clientId, direction } = req.body as QueuesTypes.EditQueueEntryOrderBody;

      const queue = await queuesModel.getByid(queueId);

      if (!queue) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'QUE-EO03',
          errorMessage: 'Erro inesperado ao editar a ordem da fila.'
        });
      }

      const entry = queue.entries.find((i) => i.clientId === clientId);

      if (!entry) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'QUE-EO02',
          errorMessage: 'Erro inesperado ao editar a ordem da fila.'
        });
      }

      const editedEntry = await queuesModel.editEntryOrder(entry.id, direction);

      return reply.code(200).send({ data: editedEntry });
    } catch (error) {
      console.log(error);

      return reply.code(500).send({
        status: 500,
        errorCode: 'QUE-EO01',
        errorMessage: 'Erro inesperado ao editar a ordem da fila.'
      });
    }
  };

  finishCycle = async (req: AuthRequest, reply: FastifyReply) => {
    try {
      const { entryId, entryPrice } = req.body as QueuesTypes.FinishQueueEntryCycleBody;

      const entry = await queuesModel.getEntryById(entryId);

      if (!entry) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'QUE-FC02',
          errorMessage: 'Erro inesperado ao finalizar o ciclo.'
        });
      }

      const data = await queuesModel.finishCycle(entry.id, entryPrice);

      return reply.code(200).send({ data });
    } catch (error) {
      console.log(error);

      return reply.code(500).send({
        status: 500,
        errorCode: 'QUE-FC01',
        errorMessage: 'Erro inesperado ao finalizar o ciclo.'
      });
    }
  };

  cancelCycle = async (req: AuthRequest, reply: FastifyReply) => {
    try {
      const { entryId } = req.body as { entryId: number };

      const entry = await queuesModel.getEntryById(entryId);

      if (!entry) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'QUE-CC02',
          errorMessage: 'Erro inesperado ao cancelar o ciclo.'
        });
      }

      const data = await queuesModel.cancelCycle(entry.id);

      return reply.code(200).send({ data });
    } catch (error) {
      console.log(error);

      return reply.code(500).send({
        status: 500,
        errorCode: 'QUE-CC01',
        errorMessage: 'Erro inesperado ao cancelar o ciclo.'
      });
    }
  };
}
