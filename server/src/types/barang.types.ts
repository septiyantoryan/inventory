// Barang types
export interface KonversiSatuanInput {
    satuanDariId: number;
    satuanKeId: number;
    jumlahKonversi: number;
    hargaBeli?: number;
    hargaJual?: number;
}

export interface BarangCreateInput {
    kode: string;
    nama: string;
    deskripsi?: string;
    kategoriId: number;
    satuanId: number;
    hargaBeli: number;
    hargaJual: number;
    minimumStok?: number;
    stok?: number;
    lokasi?: string;
    barcode?: string;
    gambar?: string;
    aktif?: boolean;
    konversiSatuan?: KonversiSatuanInput[];
}

export interface BarangUpdateInput {
    kode?: string;
    nama?: string;
    deskripsi?: string;
    kategoriId?: number;
    satuanId?: number;
    hargaBeli?: number;
    hargaJual?: number;
    minimumStok?: number;
    stok?: number;
    lokasi?: string;
    barcode?: string;
    gambar?: string;
    aktif?: boolean;
    konversiSatuan?: KonversiSatuanInput[];
}

export interface BarangFilter {
    kategoriId?: number;
    aktif?: boolean;
    search?: string;
}

export interface UpdateStokInput {
    jenisTransaksi: 'masuk' | 'keluar' | 'penyesuaian' | 'retur';
    jumlah: number;
    keterangan?: string;
    referensi?: string;
}

export interface UpdateStokResponse {
    stokSebelum: number;
    stokSesudah: number;
    barang: any;
}

export interface StokDalamSatuan {
    [satuanNama: string]: number;
}

export interface BarangResponse {
    id: number;
    kode: string;
    nama: string;
    deskripsi: string | null;
    kategoriId: number;
    satuanId: number;
    hargaBeli: number;
    hargaJual: number;
    minimumStok: number;
    stok: number;
    lokasi: string | null;
    barcode: string | null;
    gambar: string | null;
    aktif: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface BarangWithRelations extends BarangResponse {
    kategori: {
        id: number;
        nama: string;
    };
    satuan: {
        id: number;
        nama: string;
    };
    konversiSatuan: Array<{
        id: number;
        barangId: number;
        satuanDariId: number;
        satuanKeId: number;
        jumlahKonversi: number;
        hargaBeli: number | null;
        hargaJual: number | null;
        satuanDari: {
            id: number;
            nama: string;
        };
        satuanKe: {
            id: number;
            nama: string;
        };
    }>;
    stokDalamSatuan?: StokDalamSatuan;
}

export interface RiwayatStokResponse {
    id: number;
    barangId: number;
    jenisTransaksi: string;
    jumlah: number;
    stokSebelum: number;
    stokSesudah: number;
    keterangan: string | null;
    referensi: string | null;
    tanggal: Date;
    createdAt: Date;
}

export interface RiwayatStokPagination {
    data: RiwayatStokResponse[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}
