import { useState, useEffect, useRef } from 'react';
import { barangApi, kategoriApi, satuanApi } from '@/lib/api';
import type { Barang, Kategori, Satuan, BarangFormInput } from '@/types/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Pencil, Trash2, Search, Package, ChevronLeft, ChevronRight, FileDown, Upload } from 'lucide-react';
import { exportToExcel, exportToPDF, downloadImportTemplate, parseImportFile, validateImportData, ImportedBarangData } from '@/lib/export';
import { useConfirmDialog, useInfoDialog } from '@/hooks/useDialog';
import { toast } from 'sonner';

interface BarangListProps {
    onEdit: (id: number) => void;
    onCreate: () => void;
}

export function BarangList({ onEdit, onCreate }: BarangListProps) {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
    const [satuanList, setSatuanList] = useState<Satuan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedKategori, setSelectedKategori] = useState<string>('all');
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dialog hooks
    const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();
    const { showInfo, InfoDialogComponent } = useInfoDialog();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const loadData = async () => {
        try {
            setLoading(true);
            const [barang, kategori, satuan] = await Promise.all([
                barangApi.getAll(),
                kategoriApi.getAll(),
                satuanApi.getAll(),
            ]);
            setBarangList(barang);
            setKategoriList(kategori);
            setSatuanList(satuan);
        } catch (error) {
            console.error('Failed to load data:', error);
            alert('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: number) => {
        showConfirm(
            'Hapus Barang',
            'Apakah Anda yakin ingin menghapus barang ini?',
            async () => {
                try {
                    await barangApi.delete(id);
                    toast.success('Barang berhasil dihapus');
                    loadData();
                } catch (error) {
                    console.error('Failed to delete:', error);
                    toast.error('Gagal menghapus barang');
                }
            },
            {
                confirmText: 'Hapus',
                variant: 'destructive'
            }
        );
    };

    const handleDownloadTemplate = () => {
        downloadImportTemplate(kategoriList, satuanList);
    };

    const handleTriggerImport = () => {
        fileInputRef.current?.click();
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset input value so same file can be imported again
        event.target.value = '';

        try {
            setImporting(true);

            console.log('Parsing file:', file.name);
            // Parse file
            const importedData = await parseImportFile(file);
            console.log('Parsed data:', importedData);

            if (importedData.length === 0) {
                toast.warning('File tidak berisi data');
                setImporting(false);
                return;
            }

            // Validate data
            console.log('Validating data...');
            const validation = validateImportData(importedData, kategoriList, satuanList);
            console.log('Validation result:', validation);

            if (!validation.valid) {
                showInfo(
                    'Kesalahan Data',
                    'Terdapat kesalahan dalam data yang diimport:',
                    validation.errors
                );
                setImporting(false);
                return;
            }

            // Confirm import
            showConfirm(
                'Konfirmasi Import',
                `Akan mengimport ${importedData.length} barang.\n\nLanjutkan?`,
                async () => {
                    await performImport(importedData);
                },
                {
                    onCancel: () => {
                        setImporting(false);
                    }
                }
            );

        } catch (error) {
            console.error('Import error:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal membaca file');
        } finally {
            setImporting(false);
        }
    };

    const performImport = async (importedData: ImportedBarangData[]) => {
        try {
            // Import data
            let successCount = 0;
            let errorCount = 0;
            const errors: string[] = [];

            console.log('Starting import...');
            for (let i = 0; i < importedData.length; i++) {
                const item = importedData[i];
                console.log(`Importing item ${i + 1}/${importedData.length}:`, item);

                try {
                    // Find kategori and satuan IDs
                    const kategori = kategoriList.find(
                        k => k.nama.toLowerCase() === item.kategori.toLowerCase()
                    );
                    const satuan = satuanList.find(
                        s => s.nama.toLowerCase() === item.satuan.toLowerCase()
                    );

                    console.log('Found kategori:', kategori);
                    console.log('Found satuan:', satuan);

                    if (!kategori || !satuan) {
                        errorCount++;
                        errors.push(`${item.kode}: Kategori atau satuan tidak ditemukan`);
                        continue;
                    }

                    // Create barang payload
                    const payload: BarangFormInput = {
                        kode: item.kode,
                        nama: item.nama,
                        deskripsi: item.deskripsi,
                        kategoriId: kategori.id,
                        satuanId: satuan.id,
                        stok: item.stok,
                        hargaBeli: item.hargaBeli,
                        hargaJual: item.hargaJual,
                        minimumStok: item.minimumStok ?? 0,
                        barcode: item.barcode,
                        lokasi: item.lokasi,
                        aktif: item.aktif,
                        konversiSatuan: [],
                    };

                    console.log('Creating barang with payload:', payload);
                    const result = await barangApi.create(payload);
                    console.log('Created barang:', result);

                    successCount++;
                } catch (error) {
                    console.error(`Error importing ${item.kode}:`, error);
                    errorCount++;
                    errors.push(`${item.kode}: ${error instanceof Error ? error.message : 'Gagal import'}`);
                }
            }

            console.log('Import completed. Success:', successCount, 'Failed:', errorCount);

            // Show result
            if (errors.length > 0) {
                const resultMessage = `Berhasil: ${successCount}\nGagal: ${errorCount}`;
                const errorList = errors.slice(0, 5);
                if (errors.length > 5) {
                    errorList.push(`... dan ${errors.length - 5} error lainnya`);
                }
                showInfo('Import Selesai', resultMessage, errorList);
            } else {
                toast.success(`Import berhasil! ${successCount} barang ditambahkan`);
            }

            // Reload data
            if (successCount > 0) {
                await loadData();
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal import data');
        } finally {
            setImporting(false);
        }
    };

    // Filter barang
    const filteredBarang = barangList.filter((item) => {
        const matchSearch = search === '' ||
            item.nama.toLowerCase().includes(search.toLowerCase()) ||
            item.kode.toLowerCase().includes(search.toLowerCase());

        const matchKategori = selectedKategori === 'all' ||
            item.kategoriId.toString() === selectedKategori;

        return matchSearch && matchKategori;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredBarang.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBarang = filteredBarang.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedKategori]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Package className="h-6 w-6" />
                                Manajemen Barang
                            </CardTitle>
                        </div>
                        <div className="flex gap-2">
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleImport}
                                className="hidden"
                            />

                            {/* Import Button */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" disabled={importing}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        {importing ? 'Importing...' : 'Import'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleDownloadTemplate}>
                                        Download Template Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleTriggerImport}>
                                        Upload File Excel
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Export Button */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <FileDown className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => exportToExcel(filteredBarang, 'data-barang')}>
                                        Export ke Excel (.xlsx)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => exportToPDF(filteredBarang, 'data-barang')}>
                                        Export ke PDF
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button onClick={onCreate}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Barang
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Cari barang"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedKategori} onValueChange={setSelectedKategori}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {kategoriList.map((kat) => (
                                    <SelectItem key={kat.id} value={kat.id.toString()}>
                                        {kat.nama}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]">No</TableHead>
                                    <TableHead className="w-[80px]">Gambar</TableHead>
                                    <TableHead className="w-[100px]">Kode</TableHead>
                                    <TableHead>Nama Barang</TableHead>
                                    <TableHead className="w-[120px]">Barcode</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead className="text-right">Stok</TableHead>
                                    <TableHead className="text-right">Harga Beli</TableHead>
                                    <TableHead className="text-right">Harga Jual</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentBarang.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                                            Tidak ada data barang
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentBarang.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                            <TableCell>
                                                {item.gambar ? (
                                                    <img
                                                        src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${item.gambar}`}
                                                        alt={item.nama}
                                                        className="h-12 w-12 object-cover rounded border"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 bg-gray-100 rounded border flex items-center justify-center text-gray-400 text-xs">
                                                        No img
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{item.kode}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{item.nama}</div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-gray-600">
                                                {item.barcode || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.kategori.nama}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="font-medium">
                                                    {item.stok.toLocaleString()} {item.satuan.nama}
                                                </div>
                                                {item.stokDalamSatuan && Object.keys(item.stokDalamSatuan).length > 0 && (
                                                    <div className="text-sm text-gray-500">
                                                        {Object.entries(item.stokDalamSatuan)
                                                            .map(([satuan, qty]) => `${qty} ${satuan}`)
                                                            .join(' + ')}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatRupiah(item.hargaBeli)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatRupiah(item.hargaJual)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.aktif ? 'default' : 'secondary'}>
                                                    {item.aktif ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onEdit(item.id)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Tampilkan</span>
                            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                <SelectTrigger className="w-[70px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-gray-600">
                                dari {filteredBarang.length} barang
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                                Halaman {currentPage} dari {totalPages || 1}
                            </span>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <ChevronLeft className="h-4 w-4 -ml-2" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {/* Page numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((page) => {
                                        // Show first page, last page, current page, and pages around current
                                        return (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        );
                                    })
                                    .map((page, index, array) => {
                                        // Add ellipsis if there's a gap
                                        const prevPage = array[index - 1];
                                        const showEllipsis = prevPage && page - prevPage > 1;

                                        return (
                                            <div key={page} className="flex gap-1">
                                                {showEllipsis && (
                                                    <span className="px-2 py-1 text-sm text-gray-400">...</span>
                                                )}
                                                <Button
                                                    variant={currentPage === page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handlePageChange(page)}
                                                    className="min-w-[36px]"
                                                >
                                                    {page}
                                                </Button>
                                            </div>
                                        );
                                    })}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                    <ChevronRight className="h-4 w-4 -ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-4 text-sm text-gray-600">
                        Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredBarang.length)} dari {filteredBarang.length} barang
                        {filteredBarang.length < barangList.length && ` (difilter dari ${barangList.length} total)`}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog Components */}
            <ConfirmDialogComponent />
            <InfoDialogComponent />
        </div>
    );
}
