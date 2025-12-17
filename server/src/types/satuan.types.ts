// Satuan types
export interface SatuanCreateInput {
    nama: string;
    deskripsi?: string;
}

export interface SatuanUpdateInput {
    nama?: string;
    deskripsi?: string;
}

export interface SatuanResponse {
    id: number;
    nama: string;
    deskripsi: string | null;
    createdAt: Date;
    updatedAt: Date;
}
