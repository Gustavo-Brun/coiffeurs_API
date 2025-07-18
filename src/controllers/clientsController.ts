import { FastifyReply } from 'fastify';

import Types from '@/@types/default/clients';
import { AuthorizationData, AuthRequest } from '@/@types/hooks/auth';

import QueuesController from '@/controllers/queuesController';

import ClientsModel from '@/database/clients';
import QueuesModel from '@/database/queues';

const clientsModel = new ClientsModel();
const queuesModel = new QueuesModel();

export default class ClientsController extends QueuesController {
  create = async (req: AuthRequest, reply: FastifyReply) => {
    const { name, whatsappNumber } = req.body as Types.CreateClientBody;
    const { addToQueue, note } = req.body as { addToQueue?: boolean; note?: string };
    const { providerId } = req.auth as AuthorizationData;

    try {
      const clientExists = await clientsModel.getOne(providerId, name);

      if (clientExists)
        return reply.code(500).send({
          status: 500,
          errorCode: 'CLI-CR03',
          errorMessage: 'Já existe um cliente com este nome.'
        });

      const serializedClient = {
        providerId,
        name,
        whatsappNumber
      };

      const clientDb = await clientsModel.create(serializedClient);

      if (!clientDb) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'CLI-CR02',
          errorMessage: 'Erro inesperado ao registrar o cliente.'
        });
      }

      if (addToQueue) {
        const clientAdded = await this.addToQueue(req, reply, {
          providerId: providerId,
          clientId: clientDb.id,
          note
        });

        return reply.code(201).send({ data: { client: clientDb, queueEntry: clientAdded } });
      }

      return reply.code(201).send({ data: { client: clientDb } });
    } catch (error) {
      console.log('CREATE_CLIENT ', error);

      return reply.code(500).send({
        status: 500,
        errorCode: 'CLI-CR01',
        errorMessage: 'Erro inesperado ao registrar o cliente.'
      });
    }
  };

  getAll = async (req: AuthRequest, reply: FastifyReply) => {
    const { providerId } = req.auth as AuthorizationData;

    try {
      const clients = await clientsModel.getAll(providerId);

      const payload = await Promise.all(
        clients.map(async (client) => {
          const lastEntry = await queuesModel.getClientLastEntry(providerId, client.id);

          return {
            ...client,
            lastEntry: lastEntry?.joinedAt
          };
        })
      );

      return reply.code(200).send({ data: payload });
    } catch (error) {
      console.log('GET_CLIENTS ', error);

      return reply.code(500).send({
        status: 500,
        errorCode: 'CLI-GA01',
        errorMessage: 'Erro inesperado ao buscar os clientes.'
      });
    }
  };
}
