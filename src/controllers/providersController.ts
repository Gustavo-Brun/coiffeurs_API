import { FastifyReply } from 'fastify';

import Types from '@/@types/default/providers';
import { AuthRequest, AuthorizationData } from '@/@types/hooks/auth';

import { encrypt } from '@/utils/security';

import AuthController from '@/controllers/authController';

import ProvidersModel from '@/database/providers';
import QueuesModel from '@/database/queues';

const providersModel = new ProvidersModel();
const queuesModel = new QueuesModel();

export default class ProvidersController extends AuthController {
  create = async (req: AuthRequest, reply: FastifyReply) => {
    const provider = req.body as Types.CreateProviderBody;

    try {
      const providerExist = await providersModel.getOne(provider?.email);

      if (providerExist)
        return reply.code(500).send({
          status: 500,
          errorCode: 'PRV-CR03',
          errorMessage: 'Já existe uma conta com este email.'
        });

      const serializedprovider = {
        name: provider.name,
        email: provider.email,
        password: encrypt(provider.password),
        whatsappNumber: provider.whatsappNumber
      };

      const providerDb = await providersModel.create(serializedprovider);

      if (!providerDb) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'PRV-CR02',
          errorMessage: 'Erro inesperado ao registrar o provedor.'
        });
      }

      const queue = await queuesModel.create(providerDb.id);

      const payloadToken = {
        providerId: providerDb.id,
        email: providerDb.email,
        createdAt: new Date()
      };

      const providerToken = await this.gerenateToken(payloadToken);

      return reply.code(201).send({ data: { providerToken: providerToken, queueAlive: !!queue } });
    } catch (error) {
      console.log('CREATE_PROVIDER ', error);

      return reply.code(500).send({
        status: 500,
        errorCode: 'PRV-CR01',
        errorMessage: 'Erro inesperado ao registrar o provedor.'
      });
    }
  };

  getById = async (req: AuthRequest, reply: FastifyReply) => {
    const { providerId } = req.auth as AuthorizationData;

    try {
      const provider = await providersModel.getById(providerId);

      if (!provider) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'PRV-GE01',
          errorMessage: 'Erro inesperado ao buscar o provedor.'
        });
      }

      return reply.code(200).send({ data: provider });
    } catch (error) {
      console.log(error);

      return reply.code(500).send({
        status: 500,
        errorCode: 'PRV-GE02',
        errorMessage: 'Erro inesperado ao buscar o provedor.'
      });
    }
  };

  getPublicQueue = async (req: AuthRequest, reply: FastifyReply) => {
    try {
      const { wpp } = req.params as { wpp: string };

      const data = await queuesModel.getByWpp(wpp);

      if (!data || !data.queue) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'QUE-PQ02',
          errorMessage: 'Erro inesperado ao listar a fila do provedor.'
        });
      }

      const orderedEntries = data.queue.entries.sort((a, b) => a.order - b.order);

      const waitingEntries = orderedEntries.filter((entry) => entry.status === 'WAITING');

      const serializedEntries = waitingEntries.map((entry) => {
        return {
          id: entry.id,
          order: entry.order,
          clientId: entry.clientId,
          name: entry.client.name,
          whatsappNumber: entry.client.whatsappNumber
        };
      });

      return reply.code(200).send({ data: { providerName: data.providerName, serializedEntries } });
    } catch (error) {
      console.log(error);

      return reply.code(500).send({
        status: 500,
        errorCode: 'QUE-PQ01',
        errorMessage: 'Erro inesperado ao listar a fila do provedor.'
      });
    }
  };
}
