import { Hono } from 'hono';
import { routes as rootRoutes } from './root.js';

export const allRoutes = new Hono().route('', rootRoutes);
