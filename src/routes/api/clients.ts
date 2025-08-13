import { FastifyInstance } from 'fastify';

import ClientsController from '@/controllers/clientsController';

const clientsController = new ClientsController();

export default async (app: FastifyInstance) => {
  app.post('/create', clientsController.create);
  app.patch('/edit/:clientId', clientsController.edit);
  app.get('/list', clientsController.getAll);
};
