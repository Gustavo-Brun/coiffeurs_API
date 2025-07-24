import fastify from 'fastify';
import cors from '@fastify/cors';

import routes from './routes/api';
import pingRoot from './utils/ping';

const app = fastify();

const corsOptions = {
  origin: process.env.ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
};

app.register(cors, corsOptions);

app.register(routes);

app.listen({ host: '0.0.0.0', port: 4433 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

pingRoot();
