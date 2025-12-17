// API Types for Frontend
export interface Kategori {
    id: number;
    nama: string;
    deskripsi: string | null;
}

export interface Satuan {
    id: number;
    nama: string;
    deskripsi: string | null;
}

export interface KonversiSatuan {
    id: number;
    barangId: number;
    satuanDariId: number;
    satuanKeId: number;
    jumlahKonversi: number;
    hargaBeli: number | null;
    hargaJual: number | null;
    satuanDari: Satuan;
    satuanKe: Satuan;
}

export interface Barang {
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
    createdAt: string;
    updatedAt: string;
    kategori: {
        id: number;
        nama: string;
    };
    satuan: {
        id: number;
        nama: string;
    };
    konversiSatuan: KonversiSatuan[];
    stokDalamSatuan?: Record<string, number>;
}

export interface BarangFormInput {
    kode: string;
    nama: string;
    deskripsi?: string;
    kategoriId: number;
    satuanId: number;
    hargaBeli: number;
    hargaJual: number;
    minimumStok: number;
    stok: number;
    lokasi?: string;
    barcode?: string;
    gambar?: string;
    aktif: boolean;
    konversiSatuan?: Array<{
        satuanDariId: number;
        satuanKeId: number;
        jumlahKonversi: number;
        hargaBeli?: number;
        hargaJual?: number;
    }>;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
