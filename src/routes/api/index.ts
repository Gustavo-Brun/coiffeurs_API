import { FastifyInstance } from 'fastify';
import frb from 'fastify-raw-body';

import jwtAuth from '@/hooks/jwtAuth';

// import management from './management';
// import animals from './animals';

import UsersController from '@/controllers/usersController';
import AuthController from '@/controllers/authController';

const usersController = new UsersController();
const authController = new AuthController();

const authenticated = async (app: FastifyInstance) => {
  app.addHook('preHandler', jwtAuth);

  // app.register(management, { prefix: 'management' });
  // app.register(animals, { prefix: 'animals' });
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

  app.post('/users/signup', usersController.create);
  app.post('/users/login', authController.login);

  app.get('/', async () => {
    return { status: 'ok' };
  });
}
