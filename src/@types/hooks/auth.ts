import { FastifyRequest } from 'fastify';

export interface ReqHeaders {
  authorization?: string;
}

export interface AuthorizationData {
  providerId: number;
  email: string;
  createdAt?: string;
}

export interface AuthRequest extends FastifyRequest {
  auth?: AuthorizationData;
}
