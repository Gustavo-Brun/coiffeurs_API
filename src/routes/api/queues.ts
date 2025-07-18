import { FastifyInstance } from 'fastify';

import QueuesController from '@/controllers/queuesController';

const queuesController = new QueuesController();

export default async (app: FastifyInstance) => {
  app.post('/add', queuesController.addToQueue);
  app.get('/list', queuesController.listQueue);
  app.patch('/edit/order', queuesController.editOrder);
  app.patch('/entry/complete', queuesController.finishCycle);
  app.delete('/entry/cancel', queuesController.cancelCycle);
};
