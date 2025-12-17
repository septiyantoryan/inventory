import { useState, useEffect } from 'react';
import { barangApi } from '@/lib/api';
import type { Barang, Kategori, Satuan, BarangFormInput } from '@/types/api';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface BarangFormDialogProps {
    open: boolean;
    barang: Barang | null;
    kategoriList: Kategori[];
    satuanList: Satuan[];
    onClose: (refresh: boolean) => void;
}

export function BarangFormDialog({
    open,
    barang,
    kategoriList,
    satuanList,
    onClose,
}: BarangFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<BarangFormInput>({
        kode: '',
        nama: '',
        kategoriId: 0,
        satuanId: 0,
        hargaBeli: 0,
        hargaJual: 0,
        minimumStok: 0,
        stok: 0,
        aktif: true,
        konversiSatuan: [],
    });

    useEffect(() => {
        if (barang) {
            setFormData({
                kode: barang.kode,
                nama: barang.nama,
                kategoriId: barang.kategoriId,
                satuanId: barang.satuanId,
                hargaBeli: barang.hargaBeli,
                hargaJual: barang.hargaJual,
                minimumStok: barang.minimumStok,
                stok: barang.stok,
                aktif: barang.aktif,
                konversiSatuan: barang.konversiSatuan?.map(k => ({
                    satuanDariId: k.satuanDariId,
                    satuanKeId: k.satuanKeId,
                    jumlahKonversi: k.jumlahKonversi,
                    hargaBeli: k.hargaBeli || undefined,
                    hargaJual: k.hargaJual || undefined,
                })) || [],
            });
        } else {
            setFormData({
                kode: '',
                nama: '',
                kategoriId: 0,
                satuanId: 0,
                hargaBeli: 0,
                hargaJual: 0,
                minimumStok: 0,
                stok: 0,
                aktif: true,
                konversiSatuan: [],
            });
        }
    }, [barang, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.kode || !formData.nama) {
            toast.warning('Mohon isi field yang wajib');
            return;
        }

        try {
            setLoading(true);
            if (barang) {
                await barangApi.update(barang.id, formData);
                toast.success('Barang berhasil diperbarui');
            } else {
                await barangApi.create(formData);
                toast.success('Barang berhasil ditambahkan');
            }
            onClose(true);
        } catch (error) {
            console.error(error);
            toast.error('Gagal menyimpan barang');
        } finally {
            setLoading(false);
        }
    };

    const addKonversi = () => {
        setFormData({
            ...formData,
            konversiSatuan: [
                ...(formData.konversiSatuan || []),
                {
                    satuanDariId: 0,
                    satuanKeId: formData.satuanId,
                    jumlahKonversi: 1,
                },
            ],
        });
    };

    const removeKonversi = (idx: number) => {
        const newK = [...(formData.konversiSatuan || [])];
        newK.splice(idx, 1);
        setFormData({ ...formData, konversiSatuan: newK });
    };

    const updateKonversi = (idx: number, field: string, value: number | undefined) => {
        const newK = [...(formData.konversiSatuan || [])];
        newK[idx] = { ...newK[idx], [field]: value };
        setFormData({ ...formData, konversiSatuan: newK });
    };

    return (
        <Dialog open={open} onOpenChange={() => onClose(false)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{barang ? 'Edit Barang' : 'Tambah Barang'}</DialogTitle>
                    <DialogDescription>Form barang dengan multi harga per satuan</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Kode *</Label>
                            <Input value={formData.kode} onChange={(e) => setFormData({ ...formData, kode: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama *</Label>
                            <Input value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Kategori</Label>
                            <Select value={formData.kategoriId.toString()} onValueChange={(v) => setFormData({ ...formData, kategoriId: parseInt(v) })}>
                                <SelectTrigger className='w-full'><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {kategoriList.map(k => <SelectItem key={k.id} value={k.id.toString()}>{k.nama}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Satuan Dasar *</Label>
                            <Select value={formData.satuanId.toString()} onValueChange={(v) => setFormData({ ...formData, satuanId: parseInt(v) })}>
                                <SelectTrigger className='w-full'><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {satuanList.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.nama}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Harga Beli</Label>
                            <Input type="number" value={formData.hargaBeli} onChange={(e) => setFormData({ ...formData, hargaBeli: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Harga Jual</Label>
                            <Input type="number" value={formData.hargaJual} onChange={(e) => setFormData({ ...formData, hargaJual: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Stok</Label>
                            <Input type="number" value={formData.stok} onChange={(e) => setFormData({ ...formData, stok: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Min Stok</Label>
                            <Input type="number" value={formData.minimumStok} onChange={(e) => setFormData({ ...formData, minimumStok: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Konversi & Multi Harga</h3>
                            <Button type="button" onClick={addKonversi} size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" />Tambah</Button>
                        </div>
                        {formData.konversiSatuan?.map((k, i) => (
                            <Card key={i} className="p-3">
                                <div className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-3 space-y-1">
                                        <Label className="text-xs">Satuan</Label>
                                        <Select value={k.satuanDariId.toString()} onValueChange={(v) => updateKonversi(i, 'satuanDariId', parseInt(v))}>
                                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {satuanList.filter(s => s.id !== formData.satuanId).map(s => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>{s.nama}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-xs">Qty</Label>
                                        <Input className="h-9" type="number" value={k.jumlahKonversi} onChange={(e) => updateKonversi(i, 'jumlahKonversi', parseInt(e.target.value))} />
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                        <Label className="text-xs">Harga Beli</Label>
                                        <Input className="h-9" type="number" value={k.hargaBeli || ''} onChange={(e) => updateKonversi(i, 'hargaBeli', e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Opsional" />
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                        <Label className="text-xs">Harga Jual</Label>
                                        <Input className="h-9" type="number" value={k.hargaJual || ''} onChange={(e) => updateKonversi(i, 'hargaJual', e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Opsional" />
                                    </div>
                                    <div className="col-span-1">
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeKonversi(i)} className="h-9 w-9 p-0">
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onClose(false)}>Batal</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
