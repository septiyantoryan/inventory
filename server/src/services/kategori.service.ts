import prisma from '../lib/prisma';
import type { KategoriCreateInput, KategoriUpdateInput } from '../types/kategori.types';

export class KategoriService {
    async findAll() {
        return await prisma.kategori.findMany({
            include: {
                _count: {
                    select: { barang: true },
                },
            },
            orderBy: {
                nama: 'asc',
            },
        });
    }

    async findById(id: number) {
        return await prisma.kategori.findUnique({
            where: { id },
            include: {
                barang: {
                    select: {
                        id: true,
                        kode: true,
                        nama: true,
                        stok: true,
                        satuan: {
                            select: {
                                nama: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async create(data: KategoriCreateInput) {
        return await prisma.kategori.create({
            data,
        });
    }

    async update(id: number, data: KategoriUpdateInput) {
        return await prisma.kategori.update({
            where: { id },
            data,
        });
    }

    async delete(id: number) {
        // Check if kategori has barang
        const kategoriWithBarang = await prisma.kategori.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { barang: true },
                },
            },
        });

        if (kategoriWithBarang && kategoriWithBarang._count.barang > 0) {
            throw new Error(
                `Kategori tidak dapat dihapus karena masih memiliki ${kategoriWithBarang._count.barang} barang`
            );
        }

        return await prisma.kategori.delete({
            where: { id },
        });
    }
}

export const kategoriService = new KategoriService();
