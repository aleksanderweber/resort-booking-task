import express, { type Express } from 'express';
import cors from 'cors';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ResortMap } from './models.js';
import { createMapRouter } from './routes/map.routes.js';
import { createCabanaRouter } from './routes/cabana.routes.js';
import { CabanaBookingService } from './services/cabana-booking.service.js';

interface CreateAppOptions {
  getResortMap: () => ResortMap;
  bookingService: CabanaBookingService;
}

export function createApp(options: CreateAppOptions): Express {
  const app = express();

  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirPath = dirname(currentFilePath);
  const clientDistPath = resolve(currentDirPath, '../../client/dist/client/browser');

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.json({ ok: true });
  });

  app.use('/api/map', createMapRouter(options.getResortMap));
  app.use(
    '/api/cabanas',
    createCabanaRouter({
      bookingService: options.bookingService,
    })
  );

  app.use(express.static(clientDistPath));

  app.get('/{*splat}', (_request, response) => {
    response.sendFile(resolve(clientDistPath, 'index.html'));
  });

  return app;
}