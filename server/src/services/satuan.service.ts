import prisma from '../lib/prisma';
import type { SatuanCreateInput, SatuanUpdateInput } from '../types/satuan.types';

export class SatuanService {
    async findAll() {
        return await prisma.satuan.findMany({
            orderBy: {
                nama: 'asc',
            },
        });
    }

    async findById(id: number) {
        return await prisma.satuan.findUnique({
            where: { id },
        });
    }

    async create(data: SatuanCreateInput) {
        return await prisma.satuan.create({
            data,
        });
    }

    async update(id: number, data: SatuanUpdateInput) {
        return await prisma.satuan.update({
            where: { id },
            data,
        });
    }

    async delete(id: number) {
        return await prisma.satuan.delete({
            where: { id },
        });
    }
}

export const satuanService = new SatuanService();
