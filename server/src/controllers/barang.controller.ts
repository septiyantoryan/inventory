import type { Context } from 'hono';
import { barangService } from '../services/barang.service';
import { z } from 'zod';

// Validation schemas
const konversiSatuanSchema = z.object({
    satuanDariId: z.number().int().positive(),
    satuanKeId: z.number().int().positive(),
    jumlahKonversi: z.number().positive(),
    hargaBeli: z.number().positive().optional(),
    hargaJual: z.number().positive().optional(),
});

const createBarangSchema = z.object({
    kode: z.string().min(1).max(100),
    nama: z.string().min(1).max(255),
    deskripsi: z.string().optional(),
    kategoriId: z.number().int().positive(),
    satuanId: z.number().int().positive(),
    hargaBeli: z.number().positive(),
    hargaJual: z.number().positive(),
    minimumStok: z.number().min(0).default(0),
    stok: z.number().min(0).default(0),
    lokasi: z.string().max(100).optional(),
    barcode: z.string().max(100).optional(),
    gambar: z.string().max(255).optional(),
    aktif: z.boolean().default(true),
    konversiSatuan: z.array(konversiSatuanSchema).optional(),
});

const updateBarangSchema = createBarangSchema.partial();

const updateStokSchema = z.object({
    jenisTransaksi: z.enum(['masuk', 'keluar', 'penyesuaian', 'retur']),
    jumlah: z.number(),
    keterangan: z.string().optional(),
    referensi: z.string().optional(),
});

export class BarangController {
    async getAll(c: Context) {
        try {
            const { kategoriId, aktif, search } = c.req.query();

            const filter: any = {};

            if (kategoriId) {
                filter.kategoriId = parseInt(kategoriId);
            }

            if (aktif !== undefined) {
                filter.aktif = aktif === 'true';
            }

            if (search) {
                filter.search = search;
            }

            const data = await barangService.findAll(filter);

            return c.json({
                success: true,
                data,
            });
        } catch (error) {
            return c.json({
                success: false,
                message: 'Gagal mengambil data barang',
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
                    message: 'ID barang tidak valid',
                }, 400);
            }

            const data = await barangService.findById(id);

            if (!data) {
                return c.json({
                    success: false,
                    message: 'Barang tidak ditemukan',
                }, 404);
            }

            return c.json({
                success: true,
                data,
            });
        } catch (error) {
            return c.json({
                success: false,
                message: 'Gagal mengambil data barang',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, 500);
        }
    }

    async create(c: Context) {
        try {
            const body = await c.req.json();
            const validatedData = createBarangSchema.parse(body);

            const data = await barangService.create(validatedData);

            return c.json({
                success: true,
                message: 'Barang berhasil dibuat',
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
                message: 'Gagal membuat barang',
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
                    message: 'ID barang tidak valid',
                }, 400);
            }

            const body = await c.req.json();
            const validatedData = updateBarangSchema.parse(body);

            const data = await barangService.update(id, validatedData);

            return c.json({
                success: true,
                message: 'Barang berhasil diupdate',
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
                message: 'Gagal mengupdate barang',
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
                    message: 'ID barang tidak valid',
                }, 400);
            }

            await barangService.delete(id);

            return c.json({
                success: true,
                message: 'Barang berhasil dihapus',
            });
        } catch (error) {
            return c.json({
                success: false,
                message: 'Gagal menghapus barang',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, 500);
        }
    }

    async updateStok(c: Context) {
        try {
            const id = parseInt(c.req.param('id'));

            if (isNaN(id)) {
                return c.json({
                    success: false,
                    message: 'ID barang tidak valid',
                }, 400);
            }

            const body = await c.req.json();
            const validatedData = updateStokSchema.parse(body);

            const result = await barangService.updateStok(id, validatedData);

            return c.json({
                success: true,
                message: 'Stok berhasil diupdate',
                data: result,
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
                message: 'Gagal mengupdate stok',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, 500);
        }
    }

    async getRiwayatStok(c: Context) {
        try {
            const id = parseInt(c.req.param('id'));

            if (isNaN(id)) {
                return c.json({
                    success: false,
                    message: 'ID barang tidak valid',
                }, 400);
            }

            const { limit = '50', offset = '0' } = c.req.query();

            const result = await barangService.getRiwayatStok(
                id,
                parseInt(limit),
                parseInt(offset)
            );

            return c.json({
                success: true,
                ...result,
            });
        } catch (error) {
            return c.json({
                success: false,
                message: 'Gagal mengambil riwayat stok',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, 500);
        }
    }
}

export const barangController = new BarangController();
