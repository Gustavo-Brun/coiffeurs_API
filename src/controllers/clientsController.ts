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

  edit = async (req: AuthRequest, reply: FastifyReply) => {
    const { clientId } = req.params as { clientId: string };
    const { name, whatsappNumber } = req.body as Partial<Types.CreateClientBody>;

    try {
      const client = await clientsModel.getById(Number(clientId));

      if (!client) {
        return reply.code(404).send({
          status: 404,
          errorCode: 'CLI-ED03',
          errorMessage: 'Cliente nao encontrado.'
        });
      }

      const serializedClient = {
        name,
        whatsappNumber
      };

      const clientDb = await clientsModel.edit(client.id, serializedClient);

      if (!clientDb) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'CLI-ED02',
          errorMessage: 'Erro inesperado ao editar o cliente.'
        });
      }

      return reply.code(200).send({ data: clientDb });
    } catch (error) {
      console.log('EDIT_CLIENT ', error);

      return reply.code(500).send({
        status: 500,
        errorCode: 'CLI-ED01',
        errorMessage: 'Erro inesperado ao editar o cliente.'
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
