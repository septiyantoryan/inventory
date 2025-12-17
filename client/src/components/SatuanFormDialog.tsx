import { useState, useEffect } from 'react';
import { satuanApi } from '@/lib/api';
import type { Satuan } from '@/types/api';
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

interface SatuanFormDialogProps {
    open: boolean;
    satuan: Satuan | null;
    onClose: (refresh: boolean) => void;
}

interface SatuanFormData {
    nama: string;
    deskripsi: string;
}

export function SatuanFormDialog({ open, satuan, onClose }: SatuanFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<SatuanFormData>({
        nama: '',
        deskripsi: '',
    });

    useEffect(() => {
        if (satuan) {
            setFormData({
                nama: satuan.nama,
                deskripsi: satuan.deskripsi || '',
            });
        } else {
            setFormData({
                nama: '',
                deskripsi: '',
            });
        }
    }, [satuan, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nama.trim()) {
            alert('Nama satuan wajib diisi');
            return;
        }

        try {
            setLoading(true);

            if (satuan) {
                await satuanApi.update(satuan.id, formData);
                alert('Satuan berhasil diupdate');
            } else {
                await satuanApi.create(formData);
                alert('Satuan berhasil ditambahkan');
            }

            onClose(true);
        } catch (error) {
            console.error('Failed to save:', error);
            alert(error instanceof Error ? error.message : 'Gagal menyimpan satuan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => onClose(false)}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{satuan ? 'Edit Satuan' : 'Tambah Satuan Baru'}</DialogTitle>
                    <DialogDescription>
                        {satuan
                            ? 'Ubah informasi satuan'
                            : 'Tambahkan satuan baru (pcs, box, dus, pack, dll)'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nama">
                            Nama Satuan <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nama"
                            value={formData.nama}
                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                            placeholder="contoh: pcs, box, dus, pack"
                            required
                        />
                        <p className="text-xs text-gray-500">
                            Gunakan nama pendek seperti: pcs, box, dus, pack, lusin, dll
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
                            placeholder="Deskripsi satuan (opsional)"
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
                            {loading ? 'Menyimpan...' : satuan ? 'Update' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
