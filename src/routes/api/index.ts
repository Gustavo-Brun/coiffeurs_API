import { FastifyInstance } from 'fastify';
import frb from 'fastify-raw-body';

import jwtAuth from '@/hooks/jwtAuth';

import clients from './clients';
import queues from './queues';

import ProviderController from '@/controllers/providersController';
import AuthController from '@/controllers/authController';

const providerController = new ProviderController();
const authController = new AuthController();

const authenticated = async (app: FastifyInstance) => {
  app.addHook('preHandler', jwtAuth);

  app.register(clients, { prefix: 'clients' });
  app.register(queues, { prefix: 'queues' });
};

export default async function Routes(app: FastifyInstance) {
  app.register(frb, {
    field: 'rawBody', // change the default request.rawBody property name
    global: false, // add the rawBody to every request. **Default true**
    encoding: 'utf8', // set it to false to set rawBody as a Buffer **Default utf8**
    runFirst: true, // get the body before any preParsing hook change/uncompress it. **Default false**
    routes: [] // array of routes, **`global`** will be ignored, wildcard routes not supported
  });

  app.register(authenticated);

  app.post('/provider/signup', providerController.create);
  app.post('/provider/login', authController.login);

  app.get('/', async () => {
    return { status: 'ok' };
  });
}
