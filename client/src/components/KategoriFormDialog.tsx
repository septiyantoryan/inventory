import { useState, useEffect } from 'react';
import { kategoriApi } from '@/lib/api';
import type { Kategori } from '@/types/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface KategoriFormDialogProps {
    open: boolean;
    kategori: Kategori | null;
    onClose: (refresh: boolean) => void;
}

interface KategoriFormData {
    nama: string;
    deskripsi: string;
}

export function KategoriFormDialog({ open, kategori, onClose }: KategoriFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<KategoriFormData>({
        nama: '',
        deskripsi: '',
    });

    useEffect(() => {
        if (kategori) {
            setFormData({
                nama: kategori.nama,
                deskripsi: kategori.deskripsi || '',
            });
        } else {
            setFormData({
                nama: '',
                deskripsi: '',
            });
        }
    }, [kategori, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nama.trim()) {
            alert('Nama kategori wajib diisi');
            return;
        }

        try {
            setLoading(true);

            if (kategori) {
                await kategoriApi.update(kategori.id, formData);
                alert('Kategori berhasil diupdate');
            } else {
                await kategoriApi.create(formData);
                alert('Kategori berhasil ditambahkan');
            }

            onClose(true);
        } catch (error) {
            console.error('Failed to save:', error);
            alert(error instanceof Error ? error.message : 'Gagal menyimpan kategori');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => onClose(false)}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{kategori ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
                    <DialogDescription>
                        {kategori
                            ? 'Ubah informasi kategori'
                            : 'Tambahkan kategori produk baru'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nama">
                            Nama Kategori <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nama"
                            value={formData.nama}
                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                            placeholder="contoh: Makanan, Minuman, Elektronik"
                            required
                        />
                        <p className="text-xs text-gray-500">
                            Berikan nama kategori yang jelas dan mudah dikenali
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deskripsi">Deskripsi</Label>
                        <Input
                            id="deskripsi"
                            value={formData.deskripsi}
                            onChange={(e) =>
                                setFormData({ ...formData, deskripsi: e.target.value })
                            }
                            placeholder="Deskripsi kategori (opsional)"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onClose(false)}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Menyimpan...' : kategori ? 'Update' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
