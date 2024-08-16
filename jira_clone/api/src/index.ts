import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import 'module-alias/register';
import 'reflect-metadata';

import createDatabaseConnection from 'database/createConnection';
import { RouteNotFoundError } from 'errors';
import { authenticateUser } from 'middleware/authentication';
import { handleError } from 'middleware/errors';
import { addRespondToResponse } from 'middleware/response';

import { AddressInfo } from 'net';
import { attachPrivateRoutes, attachPublicRoutes } from './routes';

const establishDatabaseConnection = async (): Promise<void> => {
  try {
    await createDatabaseConnection();
  } catch (error) {
    console.log(error);
  }
};

const initializeExpress = (): void => {
  const app = express();

  app.use(cors());
  app.use(express.json({}));
  app.use(express.urlencoded({ extended: true }));

  app.use(addRespondToResponse);

  attachPublicRoutes(app);

  app.use('/', authenticateUser);

  attachPrivateRoutes(app);

  app.use((req, _res, next) => next(new RouteNotFoundError(req.originalUrl)));
  app.use(handleError);

  const server = app.listen(process.env.PORT || 3000, function() {
    console.log(`Express server listening on port ${(server.address() as AddressInfo).port}`);
  });
};

const initializeApp = async (): Promise<void> => {
  await establishDatabaseConnection();
  console.log('Connected to DB successfully');
  initializeExpress();
};

initializeApp();
