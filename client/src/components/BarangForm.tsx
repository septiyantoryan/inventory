import { useState, useEffect, useRef } from 'react';
import { barangApi, kategoriApi, satuanApi } from '@/lib/api';
import type { Barang, Kategori, Satuan, BarangFormInput } from '@/types/api';
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
import { Plus, Trash2, ArrowLeft, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface BarangFormProps {
    barangId?: number;
    onBack: () => void;
}

export function BarangForm({ barangId, onBack }: BarangFormProps) {
    const [loading, setLoading] = useState(false);
    const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
    const [satuanList, setSatuanList] = useState<Satuan[]>([]);
    const [barang, setBarang] = useState<Barang | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<BarangFormInput>({
        kode: '',
        nama: '',
        deskripsi: '',
        kategoriId: 0,
        satuanId: 0,
        hargaBeli: 0,
        hargaJual: 0,
        minimumStok: 0,
        stok: 0,
        barcode: '',
        lokasi: '',
        gambar: '',
        aktif: true,
        konversiSatuan: [],
    });

    // Format number to IDR format with Rp prefix (e.g., 400000 -> Rp 400.000)
    const formatNumber = (value: number): string => {
        if (!value && value !== 0) return '';
        const formatted = new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
        return `Rp ${formatted}`;
    };

    // Parse formatted string back to number
    const parseFormattedNumber = (value: string): number => {
        if (!value) return 0;
        // Remove "Rp", dots (thousand separators) and replace comma with dot
        const cleanValue = value.replace(/Rp\s?/g, '').replace(/\./g, '').replace(',', '.');
        return parseFloat(cleanValue) || 0;
    };

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG');
            return;
        }

        // Validate file size (1MB)
        if (file.size > 1048576) {
            toast.error('Ukuran file terlalu besar. Maksimal 1MB');
            return;
        }

        setSelectedFile(file);
        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    // Remove selected file
    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Upload file to server
    const uploadFile = async (file: File): Promise<string | null> => {
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
                method: 'POST',
                body: formDataUpload,
            });

            const result = await response.json();
            if (result.success) {
                return result.data.filename;
            } else {
                toast.error(result.message || 'Gagal upload gambar');
                return null;
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Gagal upload gambar');
            return null;
        }
    };

    useEffect(() => {
        const loadDataWrapper = async () => {
            await loadData();
        };
        loadDataWrapper();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [barangId]);

    // Set preview from existing gambar
    useEffect(() => {
        if (formData.gambar && !selectedFile) {
            setPreviewUrl(`${import.meta.env.VITE_API_BASE_URL}/uploads/${formData.gambar}`);
        }
    }, [formData.gambar, selectedFile]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [kategori, satuan] = await Promise.all([
                kategoriApi.getAll(),
                satuanApi.getAll(),
            ]);
            setKategoriList(kategori);
            setSatuanList(satuan);

            if (barangId) {
                const barangData = await barangApi.getById(barangId);
                setBarang(barangData);
                setFormData({
                    kode: barangData.kode,
                    nama: barangData.nama,
                    deskripsi: barangData.deskripsi || '',
                    kategoriId: barangData.kategoriId,
                    satuanId: barangData.satuanId,
                    hargaBeli: barangData.hargaBeli,
                    hargaJual: barangData.hargaJual,
                    minimumStok: barangData.minimumStok,
                    stok: barangData.stok,
                    barcode: barangData.barcode || '',
                    lokasi: barangData.lokasi || '',
                    gambar: barangData.gambar || '',
                    aktif: barangData.aktif,
                    konversiSatuan: barangData.konversiSatuan?.map(k => ({
                        satuanDariId: k.satuanDariId,
                        satuanKeId: k.satuanKeId,
                        jumlahKonversi: k.jumlahKonversi,
                        hargaBeli: k.hargaBeli || undefined,
                        hargaJual: k.hargaJual || undefined,
                    })) || [],
                });
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.kode || !formData.nama) {
            toast.warning('Mohon isi field yang wajib');
            return;
        }

        try {
            setLoading(true);

            // Upload file if selected
            let uploadedFilename = formData.gambar;
            if (selectedFile) {
                const filename = await uploadFile(selectedFile);
                if (filename) {
                    uploadedFilename = filename;
                }
            }

            // Update formData with uploaded filename
            const dataToSave = {
                ...formData,
                gambar: uploadedFilename,
            };

            if (barang) {
                await barangApi.update(barang.id, dataToSave);
                toast.success('Barang berhasil diperbarui');
            } else {
                await barangApi.create(dataToSave);
                toast.success('Barang berhasil ditambahkan');
            }
            onBack();
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
        const item: Record<string, number | undefined> = newK[idx];
        item[field] = value;
        setFormData({ ...formData, konversiSatuan: newK });
    };

    if (loading && !formData.nama) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">
                        {barang ? 'Edit Barang' : 'Tambah Barang Baru'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Single Card */}
                <Card>
                    <CardContent className="space-y-6">
                        {/* Informasi Dasar */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Informasi Dasar</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="kode">Kode Barang <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="kode"
                                        value={formData.kode}
                                        onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                                        placeholder="Masukkan kode barang"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="barcode">Barcode</Label>
                                    <Input
                                        id="barcode"
                                        value={formData.barcode}
                                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                        placeholder="Masukkan barcode"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nama">Nama Barang <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="nama"
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                        placeholder="Masukkan nama barang"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="kategori">Kategori <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={formData.kategoriId > 0 ? formData.kategoriId.toString() : undefined}
                                        onValueChange={(value) => setFormData({ ...formData, kategoriId: parseInt(value) })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kategoriList.map((k) => (
                                                <SelectItem key={k.id} value={k.id.toString()}>
                                                    {k.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="satuan">Satuan Dasar <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={formData.satuanId > 0 ? formData.satuanId.toString() : undefined}
                                        onValueChange={(value) => setFormData({ ...formData, satuanId: parseInt(value) })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih satuan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {satuanList.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    {s.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lokasi">Lokasi Rak</Label>
                                    <Input
                                        id="lokasi"
                                        value={formData.lokasi}
                                        onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                                        placeholder="Masukkan lokasi rak"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="deskripsi">Deskripsi</Label>
                                    <Input
                                        id="deskripsi"
                                        value={formData.deskripsi}
                                        onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                        placeholder="Masukkan deskripsi barang"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gambar">Gambar</Label>
                                    <div className="space-y-2">
                                        <Input
                                            ref={fileInputRef}
                                            id="gambar"
                                            type="file"
                                            accept=".jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                            className="cursor-pointer"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Format: JPG, JPEG, PNG. Maksimal 1MB
                                        </p>
                                        {previewUrl && (
                                            <div className="relative inline-block">
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="h-20 w-20 object-cover rounded border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                    onClick={handleRemoveFile}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Harga & Stok */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Harga & Stok</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hargaBeli">Harga Beli</Label>
                                    <Input
                                        id="hargaBeli"
                                        type="text"
                                        value={formData.hargaBeli ? formatNumber(formData.hargaBeli) : ''}
                                        onChange={(e) => setFormData({ ...formData, hargaBeli: parseFormattedNumber(e.target.value) })}
                                        placeholder="Rp 0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hargaJual">Harga Jual</Label>
                                    <Input
                                        id="hargaJual"
                                        type="text"
                                        value={formData.hargaJual ? formatNumber(formData.hargaJual) : ''}
                                        onChange={(e) => setFormData({ ...formData, hargaJual: parseFormattedNumber(e.target.value) })}
                                        placeholder="Rp 0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stok">Stok Awal</Label>
                                    <Input
                                        id="stok"
                                        type="text"
                                        value={formData.stok ? formatNumber(formData.stok) : ''}
                                        onChange={(e) => setFormData({ ...formData, stok: parseFormattedNumber(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="minimumStok">Minimum Stok</Label>
                                    <Input
                                        id="minimumStok"
                                        type="text"
                                        value={formData.minimumStok ? formatNumber(formData.minimumStok) : ''}
                                        onChange={(e) => setFormData({ ...formData, minimumStok: parseFormattedNumber(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Konversi Satuan */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-semibold text-lg">Konversi Satuan</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addKonversi}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah
                                </Button>
                            </div>

                            {formData.konversiSatuan?.map((konversi, idx) => (
                                <Card key={idx} className="border-2">
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium">Konversi #{idx + 1}</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeKonversi(idx)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Dari Satuan</Label>
                                                <Select
                                                    value={konversi.satuanDariId > 0 ? konversi.satuanDariId.toString() : undefined}
                                                    onValueChange={(v) => updateKonversi(idx, 'satuanDariId', parseInt(v))}
                                                >
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder="Pilih satuan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {satuanList.map((s) => (
                                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                                {s.nama}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Ke Satuan</Label>
                                                <Select
                                                    value={konversi.satuanKeId > 0 ? konversi.satuanKeId.toString() : undefined}
                                                    onValueChange={(v) => updateKonversi(idx, 'satuanKeId', parseInt(v))}
                                                >
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder="Pilih satuan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {satuanList.map((s) => (
                                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                                {s.nama}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Jumlah Konversi</Label>
                                                <Input
                                                    type="text"
                                                    value={formatNumber(konversi.jumlahKonversi)}
                                                    onChange={(e) => updateKonversi(idx, 'jumlahKonversi', parseFormattedNumber(e.target.value) || 1)}
                                                    placeholder="1"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Harga Beli</Label>
                                                <Input
                                                    type="text"
                                                    value={konversi.hargaBeli ? formatNumber(konversi.hargaBeli) : ''}
                                                    onChange={(e) => updateKonversi(idx, 'hargaBeli', e.target.value ? parseFormattedNumber(e.target.value) : undefined)}
                                                    placeholder="Rp 0"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Harga Jual</Label>
                                                <Input
                                                    type="text"
                                                    value={konversi.hargaJual ? formatNumber(konversi.hargaJual) : ''}
                                                    onChange={(e) => updateKonversi(idx, 'hargaJual', e.target.value ? parseFormattedNumber(e.target.value) : undefined)}
                                                    placeholder="Rp 0"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 sticky bottom-0 bg-background">
                    <Button type="button" variant="outline" onClick={onBack}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Menyimpan...' : barang ? 'Perbarui' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
