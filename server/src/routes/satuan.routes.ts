import { Hono } from 'hono';
import { satuanController } from '../controllers/satuan.controller';

const satuanRoutes = new Hono();

satuanRoutes.get('/', (c) => satuanController.getAll(c));
satuanRoutes.get('/:id', (c) => satuanController.getById(c));
satuanRoutes.post('/', (c) => satuanController.create(c));
satuanRoutes.put('/:id', (c) => satuanController.update(c));
satuanRoutes.delete('/:id', (c) => satuanController.delete(c));

export default satuanRoutes;
