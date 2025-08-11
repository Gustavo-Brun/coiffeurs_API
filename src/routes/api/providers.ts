import { FastifyInstance } from 'fastify';

import ProvidersController from '@/controllers/providersController';

const providersController = new ProvidersController();

export default async (app: FastifyInstance) => {
  app.get('/', providersController.getById);
};
