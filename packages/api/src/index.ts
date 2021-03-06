import * as dotenv from 'dotenv';
dotenv.config();
import logger from './logger';
import app from './app';

import monitoring from './cron/monitoring-request';

const port = app.get('port');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
);

monitoring();
