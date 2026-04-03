import { Router } from 'express';
import type { ResortMap } from '../models.js';

export function createMapRouter(getResortMap: () => ResortMap): Router {
  const router = Router();

  router.get('/', (_request, response) => {
    response.json(getResortMap());
  });

  return router;
}