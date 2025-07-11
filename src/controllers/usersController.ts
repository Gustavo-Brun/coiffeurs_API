import { FastifyReply } from 'fastify';

import Types from '@/@types/default/users';
import { AuthRequest } from '@/@types/hooks/auth';
import { encrypt } from '@/utils/security';

import AuthController from './authController';
import UsersModel from '@/database/users';

const usersModel = new UsersModel();

export default class UsersController extends AuthController {
  create = async (req: AuthRequest, reply: FastifyReply) => {
    const user = req.body as Types.CreateUserBody;

    try {
      const userExist = await usersModel.getOne(user?.email);

      if (userExist)
        return reply.code(500).send({
          status: 500,
          errorCode: 'USR-CR03',
          errorMessage: 'Já existe uma conta com este email.'
        });

      const serializedUser = {
        name: user.name,
        email: user.email,
        password: encrypt(user.password),
        whatsappNumber: user.whatsappNumber
      };

      const userDb = await usersModel.create(serializedUser);

      if (!userDb) {
        return reply.code(500).send({
          status: 500,
          errorCode: 'USR-CR02',
          errorMessage: 'Erro inesperado ao criar o usuário.'
        });
      }

      const payloadToken = {
        email: userDb.email,
        createdAt: new Date()
      };

      const userToken = await this.gerenateToken(payloadToken);

      return reply.code(201).send({ data: userToken });
    } catch (error) {
      console.log('CREATE_USER ', error);

      return reply.code(500).send({
        status: 500,
        errorCode: 'USR-CR01',
        errorMessage: 'Erro inesperado ao criar o usuário.'
      });
    }
  };
}
