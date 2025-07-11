import { FastifyReply } from 'fastify';
import { jwtDecrypt } from 'jose';

import * as Types from '@/@types/hooks/auth';
import whitelist from '@/routes/whitelist';
import UsersModel from '@/database/users';

const auth = async (request: Types.AuthRequest, reply: FastifyReply) => {
  const usersModel = new UsersModel();

  const { authorization } = request.headers as Types.ReqHeaders;

  if (!authorization) {
    return reply.code(401).send({
      status: 401,
      errorCode: 'AUT-403',
      errorMessage: 'Authorization header unavailable'
    });
  }

  try {
    const saltKey = process.env.JWE_SALT_KEY as string;
    const secret = new TextEncoder().encode(saltKey);

    const serializedAuthorization = authorization.substring(7);

    const { payload } = await jwtDecrypt(serializedAuthorization, secret);

    const authData = payload as unknown as Types.AuthorizationData;

    const user = await usersModel.getOne(authData.email);

    if (!user) {
      return reply.code(401).send({
        status: 401,
        errorCode: 'AUT-402',
        errorMessage: 'Authorization header is not valid'
      });
    }

    if (whitelist.filter((route) => request.routeOptions.url?.startsWith(route)).length) {
      request.auth = authData;
      return;
    }

    // - SUBSCRIPTION
    // if (
    //   getUser?.subscriptionStatus != 'TRIALING' &&
    //   getUser?.subscriptionStatus != 'ACTIVE'
    // ) {
    //   throw new Error('401 not authorized');
    // }

    // - ROLE
    // if (request.routeOptions.url?.startsWith('/management') && authData.role != 'management') {
    //   throw new Error('401 not authorized');
    // }

    request.auth = authData;
  } catch (e) {
    console.log(e);

    return reply.code(401).send({
      status: 401,
      errorCode: 'AUT-401',
      errorMessage: 'Authorization header is not valid'
    });
  }
};

export default auth;
