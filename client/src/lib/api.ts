import type { ApiResponse, Barang, Kategori, Satuan, BarangFormInput } from '../types/api';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

// Barang API
export const barangApi = {
    getAll: async (params?: { kategoriId?: number; aktif?: boolean; search?: string }): Promise<Barang[]> => {
        const queryParams = new URLSearchParams();
        if (params?.kategoriId) queryParams.append('kategoriId', params.kategoriId.toString());
        if (params?.aktif !== undefined) queryParams.append('aktif', params.aktif.toString());
        if (params?.search) queryParams.append('search', params.search);

        const response = await fetch(`${API_BASE_URL}/barang?${queryParams}`);
        const data: ApiResponse<Barang[]> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch barang');
        }

        return data.data || [];
    },

    getById: async (id: number): Promise<Barang> => {
        const response = await fetch(`${API_BASE_URL}/barang/${id}`);
        const data: ApiResponse<Barang> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch barang');
        }

        return data.data!;
    },

    create: async (input: BarangFormInput): Promise<Barang> => {
        const response = await fetch(`${API_BASE_URL}/barang`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        });

        const data: ApiResponse<Barang> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to create barang');
        }

        return data.data!;
    },

    update: async (id: number, input: Partial<BarangFormInput>): Promise<Barang> => {
        const response = await fetch(`${API_BASE_URL}/barang/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        });

        const data: ApiResponse<Barang> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to update barang');
        }

        return data.data!;
    },

    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/barang/${id}`, {
            method: 'DELETE',
        });

        const data: ApiResponse<void> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to delete barang');
        }
    },
};

// Kategori API
export const kategoriApi = {
    getAll: async (): Promise<Kategori[]> => {
        const response = await fetch(`${API_BASE_URL}/kategori`);
        const data: ApiResponse<Kategori[]> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch kategori');
        }

        return data.data || [];
    },

    getById: async (id: number): Promise<Kategori> => {
        const response = await fetch(`${API_BASE_URL}/kategori/${id}`);
        const data: ApiResponse<Kategori> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch kategori');
        }

        return data.data!;
    },

    create: async (input: { nama: string; deskripsi?: string }): Promise<Kategori> => {
        const response = await fetch(`${API_BASE_URL}/kategori`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        });

        const data: ApiResponse<Kategori> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to create kategori');
        }

        return data.data!;
    },

    update: async (id: number, input: { nama?: string; deskripsi?: string }): Promise<Kategori> => {
        const response = await fetch(`${API_BASE_URL}/kategori/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        });

        const data: ApiResponse<Kategori> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to update kategori');
        }

        return data.data!;
    },

    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/kategori/${id}`, {
            method: 'DELETE',
        });

        const data: ApiResponse<void> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to delete kategori');
        }
    },
};

// Satuan API
export const satuanApi = {
    getAll: async (): Promise<Satuan[]> => {
        const response = await fetch(`${API_BASE_URL}/satuan`);
        const data: ApiResponse<Satuan[]> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch satuan');
        }

        return data.data || [];
    },

    getById: async (id: number): Promise<Satuan> => {
        const response = await fetch(`${API_BASE_URL}/satuan/${id}`);
        const data: ApiResponse<Satuan> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch satuan');
        }

        return data.data!;
    },

    create: async (input: { nama: string; deskripsi?: string }): Promise<Satuan> => {
        const response = await fetch(`${API_BASE_URL}/satuan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        });

        const data: ApiResponse<Satuan> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to create satuan');
        }

        return data.data!;
    },

    update: async (id: number, input: { nama?: string; deskripsi?: string }): Promise<Satuan> => {
        const response = await fetch(`${API_BASE_URL}/satuan/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        });

        const data: ApiResponse<Satuan> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to update satuan');
        }

        return data.data!;
    },

    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/satuan/${id}`, {
            method: 'DELETE',
        });

        const data: ApiResponse<void> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to delete satuan');
        }
    },
};
