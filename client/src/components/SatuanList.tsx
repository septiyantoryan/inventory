import { useState, useEffect } from 'react';
import { satuanApi } from '@/lib/api';
import type { Satuan } from '@/types/api';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { SatuanFormDialog } from './SatuanFormDialog';

export function SatuanList() {
    const [satuans, setSatuans] = useState<Satuan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedSatuan, setSelectedSatuan] = useState<Satuan | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const loadSatuans = async () => {
        try {
            setLoading(true);
            const data = await satuanApi.getAll();
            setSatuans(data);
        } catch (error) {
            console.error('Failed to load satuans:', error);
            alert('Gagal memuat data satuan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSatuans();
    }, []);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const handleAdd = () => {
        setSelectedSatuan(null);
        setDialogOpen(true);
    };

    const handleEdit = (satuan: Satuan) => {
        setSelectedSatuan(satuan);
        setDialogOpen(true);
    };

    const handleDelete = async (satuan: Satuan) => {
        if (!confirm(`Hapus satuan "${satuan.nama}"?\n\nPeringatan: Satuan yang digunakan di barang tidak bisa dihapus.`)) {
            return;
        }

        try {
            await satuanApi.delete(satuan.id);
            alert('Satuan berhasil dihapus');
            loadSatuans();
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('Gagal menghapus satuan. Mungkin satuan masih digunakan di barang.');
        }
    };

    const handleCloseDialog = (refresh: boolean) => {
        setDialogOpen(false);
        setSelectedSatuan(null);
        if (refresh) {
            loadSatuans();
        }
    };

    const filteredSatuans = satuans.filter((satuan) =>
        satuan.nama.toLowerCase().includes(search.toLowerCase()) ||
        (satuan.deskripsi && satuan.deskripsi.toLowerCase().includes(search.toLowerCase()))
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredSatuans.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSatuans = filteredSatuans.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    return (
        <div>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Kelola Satuan</CardTitle>
                            <CardDescription>
                                Manajemen satuan untuk barang (pcs, box, dus, pack, dll)
                            </CardDescription>
                        </div>
                        <Button onClick={handleAdd}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Satuan
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Cari satuan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : filteredSatuans.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {search ? 'Tidak ada satuan yang sesuai pencarian' : 'Belum ada satuan'}
                        </div>
                    ) : (
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Nama</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead className="w-[150px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentSatuans.map((satuan) => (
                                        <TableRow key={satuan.id}>
                                            <TableCell className="font-medium">
                                                {satuan.nama}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {satuan.deskripsi || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(satuan)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(satuan)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!loading && filteredSatuans.length > 0 && (
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
                                    dari {filteredSatuans.length} satuan
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
                                            return (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            );
                                        })
                                        .map((page, index, array) => {
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
                    )}

                    {/* Summary */}
                    <div className="mt-4 text-sm text-gray-600">
                        Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredSatuans.length)} dari {filteredSatuans.length} satuan
                        {filteredSatuans.length < satuans.length && ` (difilter dari ${satuans.length} total)`}
                    </div>
                </CardContent>
            </Card>

            <SatuanFormDialog
                open={dialogOpen}
                satuan={selectedSatuan}
                onClose={handleCloseDialog}
            />
        </div>
    );
}
