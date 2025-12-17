import type { Context } from 'hono';
import { satuanService } from '../services/satuan.service';
import { z } from 'zod';

// Validation schemas
const createSatuanSchema = z.object({
    nama: z.string().min(1).max(50),
    deskripsi: z.string().optional(),
});

const updateSatuanSchema = createSatuanSchema.partial();

export class SatuanController {
    async getAll(c: Context) {
        try {
            const data = await satuanService.findAll();

            return c.json({
                success: true,
                data,
            });
        } catch (error) {
            return c.json({
                success: false,
                message: 'Gagal mengambil data satuan',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, 500);
        }
    }

    async getById(c: Context) {
        try {
            const id = parseInt(c.req.param('id'));

            if (isNaN(id)) {
                return c.json({
                    success: false,
                    message: 'ID satuan tidak valid',
                }, 400);
            }

            const data = await satuanService.findById(id);

            if (!data) {
                return c.json({
                    success: false,
                    message: 'Satuan tidak ditemukan',
                }, 404);
            }

            return c.json({
                success: true,
                data,
            });
        } catch (error) {
            return c.json({
                success: false,
                message: 'Gagal mengambil data satuan',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, 500);
        }
    }

    async create(c: Context) {
        try {
            const body = await c.req.json();
            const validatedData = createSatuanSchema.parse(body);

            const data = await satuanService.create(validatedData);

            return c.json({
                success: true,
                message: 'Satuan berhasil dibuat',
                data,
            }, 201);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return c.json({
                    success: false,
                    message: 'Validasi error',
                    errors: error.issues,
                }, 400);
            }

            return c.json({
                success: false,
                message: 'Gagal membuat satuan',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, 500);
        }
    }

    async update(c: Context) {
        try {
            const id = parseInt(c.req.param('id'));

            if (isNaN(id)) {
                return c.json({
                    success: false,
                    message: 'ID satuan tidak valid',
                }, 400);
            }

            const body = await c.req.json();
            const validatedData = updateSatuanSchema.parse(body);

            const data = await satuanService.update(id, validatedData);

            return c.json({
                success: true,
                message: 'Satuan berhasil diupdate',
                data,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return c.json({
                    success: false,
                    message: 'Validasi error',
                    errors: error.issues,
                }, 400);
            }

            return c.json({
                success: false,
                message: 'Gagal mengupdate satuan',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, 500);
        }
    }

    async delete(c: Context) {
        try {
            const id = parseInt(c.req.param('id'));

            if (isNaN(id)) {
                return c.json({
                    success: false,
                    message: 'ID satuan tidak valid',
                }, 400);
            }

            await satuanService.delete(id);

            return c.json({
                success: true,
                message: 'Satuan berhasil dihapus',
            });
        } catch (error) {
            return c.json({
                success: false,
                message: 'Gagal menghapus satuan',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, 500);
        }
    }
}

export const satuanController = new SatuanController();
