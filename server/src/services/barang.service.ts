import prisma from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import type {
    BarangCreateInput,
    BarangUpdateInput,
    BarangFilter,
    UpdateStokInput,
    UpdateStokResponse,
    StokDalamSatuan,
} from '../types/barang.types';

export class BarangService {
    // Helper function to calculate stock in different units
    calculateStockInUnits(stokDasar: Decimal | number, konversiSatuan: any[]): StokDalamSatuan {
        const result: any = {};

        // Sort conversions to build hierarchy
        const sortedKonversi = [...konversiSatuan].sort((a, b) => {
            return Number(b.jumlahKonversi) - Number(a.jumlahKonversi);
        });

        let remainingStock = Number(stokDasar);

        for (const konversi of sortedKonversi) {
            const unitName = konversi.satuanDari.nama;
            const conversionRate = Number(konversi.jumlahKonversi);
            const qty = Math.floor(remainingStock / conversionRate);

            if (qty > 0) {
                result[unitName] = qty;
                remainingStock = remainingStock % conversionRate;
            }
        }

        return result;
    }

    async findAll(filter: BarangFilter = {}) {
        const where: any = {};

        if (filter.kategoriId) {
            where.kategoriId = filter.kategoriId;
        }

        if (filter.aktif !== undefined) {
            where.aktif = filter.aktif;
        }

        if (filter.search) {
            where.OR = [
                { nama: { contains: filter.search } },
                { kode: { contains: filter.search } },
                { barcode: { contains: filter.search } },
            ];
        }

        const data = await prisma.barang.findMany({
            where,
            include: {
                kategori: {
                    select: {
                        id: true,
                        nama: true,
                    },
                },
                satuan: {
                    select: {
                        id: true,
                        nama: true,
                    },
                },
                konversiSatuan: {
                    include: {
                        satuanDari: true,
                        satuanKe: true,
                    },
                    orderBy: {
                        jumlahKonversi: 'desc',
                    },
                },
            },
            orderBy: {
                nama: 'asc',
            },
        });

        // Add calculated stock in different units
        return data.map((item: any) => ({
            ...item,
            stokDalamSatuan: this.calculateStockInUnits(item.stok, item.konversiSatuan),
        }));
    }

    async findById(id: number) {
        const data = await prisma.barang.findUnique({
            where: { id },
            include: {
                kategori: true,
                satuan: true,
                konversiSatuan: {
                    include: {
                        satuanDari: true,
                        satuanKe: true,
                    },
                    orderBy: {
                        jumlahKonversi: 'desc',
                    },
                },
                riwayatStok: {
                    orderBy: {
                        tanggal: 'desc',
                    },
                    take: 10,
                },
            },
        });

        if (!data) {
            return null;
        }

        // Add calculated stock
        return {
            ...data,
            stokDalamSatuan: this.calculateStockInUnits(data.stok, data.konversiSatuan),
        };
    }

    async create(input: BarangCreateInput) {
        const { konversiSatuan, ...barangData } = input;

        return await prisma.barang.create({
            data: {
                ...barangData,
                konversiSatuan: konversiSatuan ? {
                    create: konversiSatuan,
                } : undefined,
            },
            include: {
                kategori: true,
                satuan: true,
                konversiSatuan: {
                    include: {
                        satuanDari: true,
                        satuanKe: true,
                    },
                },
            },
        });
    }

    async update(id: number, input: BarangUpdateInput) {
        const { konversiSatuan, ...barangData } = input;

        return await prisma.barang.update({
            where: { id },
            data: {
                ...barangData,
                konversiSatuan: konversiSatuan ? {
                    deleteMany: {},
                    create: konversiSatuan,
                } : undefined,
            },
            include: {
                kategori: true,
                satuan: true,
                konversiSatuan: {
                    include: {
                        satuanDari: true,
                        satuanKe: true,
                    },
                },
            },
        });
    }

    async delete(id: number) {
        return await prisma.barang.delete({
            where: { id },
        });
    }

    async updateStok(id: number, input: UpdateStokInput): Promise<UpdateStokResponse> {
        const { jenisTransaksi, jumlah, keterangan, referensi } = input;

        // Get current stock
        const barangData = await prisma.barang.findUnique({
            where: { id },
        });

        if (!barangData) {
            throw new Error('Barang tidak ditemukan');
        }

        const stokSebelum = Number(barangData.stok);
        let stokSesudah = stokSebelum;

        // Calculate new stock based on transaction type
        if (jenisTransaksi === 'masuk' || jenisTransaksi === 'retur') {
            stokSesudah = stokSebelum + jumlah;
        } else if (jenisTransaksi === 'keluar') {
            stokSesudah = stokSebelum - jumlah;
        } else if (jenisTransaksi === 'penyesuaian') {
            stokSesudah = jumlah;
        }

        // Validate stock
        if (stokSesudah < 0) {
            throw new Error('Stok tidak mencukupi');
        }

        // Update stock and create history in transaction
        const result = await prisma.$transaction(async (tx: any) => {
            // Update stock
            const updatedBarang = await tx.barang.update({
                where: { id },
                data: {
                    stok: stokSesudah,
                },
            });

            // Create history
            await tx.riwayatStok.create({
                data: {
                    barangId: id,
                    jenisTransaksi,
                    jumlah: jenisTransaksi === 'penyesuaian' ? jumlah : Math.abs(jumlah),
                    stokSebelum,
                    stokSesudah,
                    keterangan,
                    referensi,
                },
            });

            return updatedBarang;
        });

        return {
            stokSebelum,
            stokSesudah,
            barang: result,
        };
    }

    async getRiwayatStok(id: number, limit: number = 50, offset: number = 0) {
        const data = await prisma.riwayatStok.findMany({
            where: { barangId: id },
            orderBy: {
                tanggal: 'desc',
            },
            take: limit,
            skip: offset,
        });

        const total = await prisma.riwayatStok.count({
            where: { barangId: id },
        });

        return {
            data,
            pagination: {
                total,
                limit,
                offset,
            },
        };
    }
}

export const barangService = new BarangService();
