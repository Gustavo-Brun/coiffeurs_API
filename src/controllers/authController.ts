import { FastifyReply } from 'fastify';

import { EncryptJWT } from 'jose';

import Types from '@/@types/default/auth';
import { AuthRequest } from '@/@types/hooks/auth';
import { decrypt } from '@/utils/security';

import UsersModel from '@/database/users';

const usersModel = new UsersModel();

export default class AuthController {
  gerenateToken = async (payload: any): Promise<string> => {
    const saltKey = process.env.JWE_SALT_KEY as string;
    const secret = new TextEncoder().encode(saltKey);

    return new EncryptJWT(payload)
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .encrypt(secret);
  };

  login = async (req: AuthRequest, reply: FastifyReply) => {
    const body = req.body as Types.LoginBody;

    try {
      const user = await usersModel.getOne(body.email);

      if (user) {
        const validPassword = decrypt(body.password, user.password);
        if (validPassword) {
          const payload = {
            email: body.email,
            createdAt: new Date()
          };

          const userToken = await this.gerenateToken(payload);

          return reply.code(200).send({ data: userToken });
        }
      }

      return reply.code(401).send({
        status: 401,
        errorCode: 'AUT-LO02',
        errorMessage: 'Email ou senha incorretos.'
      });
    } catch (error) {
      console.log('AUTH_LOGIN ', error);
    }

    return reply.code(401).send({
      status: 401,
      errorCode: 'AUT-LO1',
      errorMessage: 'Erro inesperado ao tentar fazer login.'
    });
  };
}
