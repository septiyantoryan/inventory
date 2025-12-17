import { Hono } from 'hono';
import { barangController } from '../controllers/barang.controller';

const barangRoutes = new Hono();

barangRoutes.get('/', (c) => barangController.getAll(c));
barangRoutes.get('/:id', (c) => barangController.getById(c));
barangRoutes.post('/', (c) => barangController.create(c));
barangRoutes.put('/:id', (c) => barangController.update(c));
barangRoutes.delete('/:id', (c) => barangController.delete(c));
barangRoutes.post('/:id/stok', (c) => barangController.updateStok(c));
barangRoutes.get('/:id/riwayat', (c) => barangController.getRiwayatStok(c));

export default barangRoutes;
