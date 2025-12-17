// Kategori types
export interface KategoriCreateInput {
    nama: string;
    deskripsi?: string;
}

export interface KategoriUpdateInput {
    nama?: string;
    deskripsi?: string;
}

export interface KategoriResponse {
    id: number;
    nama: string;
    deskripsi: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface KategoriWithCount extends KategoriResponse {
    _count: {
        barang: number;
    };
}

export interface KategoriWithBarang extends KategoriResponse {
    barang: Array<{
        id: number;
        kode: string;
        nama: string;
        stok: number;
        satuanDasar: {
            nama: string;
        };
    }>;
}
