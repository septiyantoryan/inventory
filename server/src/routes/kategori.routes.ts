import { Hono } from 'hono';
import { kategoriController } from '../controllers/kategori.controller';

const kategoriRoutes = new Hono();

kategoriRoutes.get('/', (c) => kategoriController.getAll(c));
kategoriRoutes.get('/:id', (c) => kategoriController.getById(c));
kategoriRoutes.post('/', (c) => kategoriController.create(c));
kategoriRoutes.put('/:id', (c) => kategoriController.update(c));
kategoriRoutes.delete('/:id', (c) => kategoriController.delete(c));

export default kategoriRoutes;
