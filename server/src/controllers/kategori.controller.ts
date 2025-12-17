import type { Context } from 'hono';
import { kategoriService } from '../services/kategori.service';
import { z } from 'zod';

// Validation schemas
const createKategoriSchema = z.object({
    nama: z.string().min(1).max(100),
    deskripsi: z.string().optional(),
});

const updateKategoriSchema = createKategoriSchema.partial();

export class KategoriController {
    async getAll(c: Context) {
        try {
            const data = await kategoriService.findAll();

            return c.json({
                success: true,
                data,
            });
        } catch (error) {
            return c.json({
                success: false,
                message: 'Gagal mengambil data kategori',
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
                    message: 'ID kategori tidak valid',
                }, 400);
            }

            const data = await kategoriService.findById(id);

            if (!data) {
                return c.json({
                    success: false,
                    message: 'Kategori tidak ditemukan',
                }, 404);
            }

            return c.json({
                success: true,
                data,
            });
        } catch (error) {
            return c.json({
                success: false,
                message: 'Gagal mengambil data kategori',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, 500);
        }
    }

    async create(c: Context) {
        try {
            const body = await c.req.json();
            const validatedData = createKategoriSchema.parse(body);

            const data = await kategoriService.create(validatedData);

            return c.json({
                success: true,
                message: 'Kategori berhasil dibuat',
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
                message: 'Gagal membuat kategori',
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
                    message: 'ID kategori tidak valid',
                }, 400);
            }

            const body = await c.req.json();
            const validatedData = updateKategoriSchema.parse(body);

            const data = await kategoriService.update(id, validatedData);

            return c.json({
                success: true,
                message: 'Kategori berhasil diupdate',
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
                message: 'Gagal mengupdate kategori',
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
                    message: 'ID kategori tidak valid',
                }, 400);
            }

            await kategoriService.delete(id);

            return c.json({
                success: true,
                message: 'Kategori berhasil dihapus',
            });
        } catch (error) {
            return c.json({
                success: false,
                message: 'Gagal menghapus kategori',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, 500);
        }
    }
}

export const kategoriController = new KategoriController();
