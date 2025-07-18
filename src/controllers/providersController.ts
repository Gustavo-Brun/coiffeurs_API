import { FastifyReply } from 'fastify';

import Types from '@/@types/default/providers';
import { AuthRequest } from '@/@types/hooks/auth';

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
}
