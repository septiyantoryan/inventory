import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Barang, Kategori, Satuan } from '@/types/api';

export interface ImportedBarangData {
    kode: string;
    nama: string;
    kategori: string;
    satuan: string;
    stok: number;
    hargaBeli: number;
    hargaJual: number;
    aktif: boolean;
    barcode?: string;
    deskripsi?: string;
    lokasi?: string;
    minimumStok?: number;
}

export function exportToExcel(data: Barang[], filename: string = 'data-barang') {
    // Prepare data for export
    const exportData = data.map((item, index) => ({
        'No': index + 1,
        'Kode': item.kode,
        'Barcode': item.barcode || '-',
        'Nama Barang': item.nama,
        'Deskripsi': item.deskripsi || '-',
        'Kategori': item.kategori.nama,
        'Satuan': item.satuan.nama,
        'Lokasi Rak': item.lokasi || '-',
        'Stok': item.stok,
        'Harga Beli': item.hargaBeli,
        'Harga Jual': item.hargaJual,
        'Minimum Stok': item.minimumStok || 0,
        'Status': item.aktif ? 'Aktif' : 'Nonaktif',
        'Gambar': item.gambar || '-',
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Barang');

    // Set column widths
    const colWidths = [
        { wch: 5 },  // No
        { wch: 15 }, // Kode
        { wch: 15 }, // Barcode
        { wch: 30 }, // Nama
        { wch: 30 }, // Deskripsi
        { wch: 15 }, // Kategori
        { wch: 10 }, // Satuan
        { wch: 15 }, // Lokasi Rak
        { wch: 10 }, // Stok
        { wch: 15 }, // Harga Beli
        { wch: 15 }, // Harga Jual
        { wch: 12 }, // Min Stok
        { wch: 10 }, // Status
        { wch: 20 }, // Gambar
    ];
    ws['!cols'] = colWidths;

    // Generate file
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPDF(data: Barang[], filename: string = 'data-barang') {
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation

    // Add title
    doc.setFontSize(16);
    doc.text('Data Barang Inventory', 14, 15);

    // Add date
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    // Prepare table data
    const tableData = data.map((item, index) => [
        index + 1,
        item.kode,
        item.barcode || '-',
        item.nama,
        item.kategori.nama,
        item.lokasi || '-',
        `${item.stok} ${item.satuan.nama}`,
        formatRupiah(item.hargaBeli),
        formatRupiah(item.hargaJual),
        item.aktif ? 'Aktif' : 'Nonaktif',
    ]);

    // Generate table
    autoTable(doc, {
        head: [['No', 'Kode', 'Barcode', 'Nama Barang', 'Kategori', 'Lokasi Rak', 'Stok', 'Harga Beli', 'Harga Jual', 'Status']],
        body: tableData,
        startY: 28,
        theme: 'grid',
        margin: { left: 14, right: 14 },
        tableWidth: 'auto',
        headStyles: {
            fillColor: [59, 130, 246], // blue-500
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
        },
        columnStyles: {
            0: { cellWidth: 'auto', halign: 'center' }, // No
            1: { cellWidth: 'auto', halign: 'left' },   // Kode
            2: { cellWidth: 'auto', halign: 'left' },   // Barcode
            3: { cellWidth: 'auto', halign: 'left' },   // Nama
            4: { cellWidth: 'auto', halign: 'left' },   // Kategori
            5: { cellWidth: 'auto', halign: 'left' },   // Lokasi Rak
            6: { cellWidth: 'auto', halign: 'right' },  // Stok
            7: { cellWidth: 'auto', halign: 'right' },  // Harga Beli
            8: { cellWidth: 'auto', halign: 'right' },  // Harga Jual
            9: { cellWidth: 'auto', halign: 'center' }, // Status
        },
        styles: {
            fontSize: 7,
            cellPadding: 1.5,
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250], // gray-50
        },
    });

    // Add footer with page numbers
    const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
            `Halaman ${i} dari ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // Save PDF
    doc.save(`${filename}.pdf`);
}

function formatRupiah(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(num);
}

// Download template Excel untuk import
export function downloadImportTemplate(kategoriList: Kategori[], satuanList: Satuan[]) {
    const templateData = [
        {
            'Kode': 'CONTOH-001',
            'Barcode': '1234567890123',
            'Nama Barang': 'Contoh Nama Barang',
            'Deskripsi': 'Deskripsi opsional',
            'Kategori': kategoriList.length > 0 ? kategoriList[0].nama : 'Makanan',
            'Satuan': satuanList.length > 0 ? satuanList[0].nama : 'pcs',
            'Lokasi Rak': 'A1-01',
            'Stok': 100,
            'Harga Beli': 5000,
            'Harga Jual': 7000,
            'Minimum Stok': 10,
            'Status': 'Aktif',
        }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Import');

    // Add instruction sheet
    const instructions = [
        ['INSTRUKSI IMPORT DATA BARANG'],
        [''],
        ['1. Isi data barang sesuai kolom yang tersedia'],
        ['2. Kolom yang wajib diisi: Kode, Nama Barang, Kategori, Satuan, Stok, Harga Beli, Harga Jual, Status'],
        ['3. Kolom opsional: Barcode, Deskripsi, Lokasi Rak, Minimum Stok'],
        ['4. Kategori dan Satuan harus sesuai dengan yang ada di sistem'],
        ['5. Status harus "Aktif" atau "Nonaktif"'],
        ['6. Hapus baris contoh sebelum import'],
        ['7. Simpan file dan upload melalui tombol Import'],
        [''],
        ['DAFTAR KATEGORI YANG TERSEDIA:'],
        ...kategoriList.map(k => [k.nama]),
        [''],
        ['DAFTAR SATUAN YANG TERSEDIA:'],
        ...satuanList.map(s => [s.nama]),
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instruksi');

    XLSX.writeFile(wb, 'template-import-barang.xlsx');
}

// Parse Excel file untuk import
export async function parseImportFile(file: File): Promise<ImportedBarangData[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

                const parsedData: ImportedBarangData[] = jsonData.map((row) => ({
                    kode: row['Kode']?.toString().trim() || '',
                    nama: row['Nama Barang']?.toString().trim() || '',
                    kategori: row['Kategori']?.toString().trim() || '',
                    satuan: row['Satuan']?.toString().trim() || '',
                    stok: parseFloat(row['Stok'] as string) || 0,
                    hargaBeli: parseFloat(row['Harga Beli'] as string) || 0,
                    hargaJual: parseFloat(row['Harga Jual'] as string) || 0,
                    aktif: row['Status']?.toString().toLowerCase() === 'aktif',
                    barcode: row['Barcode']?.toString().trim() || undefined,
                    deskripsi: row['Deskripsi']?.toString().trim() || undefined,
                    lokasi: row['Lokasi Rak']?.toString().trim() || undefined,
                    minimumStok: row['Minimum Stok'] ? parseFloat(row['Minimum Stok'] as string) : undefined,
                }));

                resolve(parsedData);
            } catch {
                reject(new Error('Gagal membaca file. Pastikan format file sesuai template.'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Gagal membaca file'));
        };

        reader.readAsBinaryString(file);
    });
}

// Validate imported data
export function validateImportData(
    data: ImportedBarangData[],
    kategoriList: Kategori[],
    satuanList: Satuan[]
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    data.forEach((item, index) => {
        const rowNum = index + 2; // +2 because Excel row 1 is header, array is 0-indexed

        if (!item.kode) {
            errors.push(`Baris ${rowNum}: Kode barang wajib diisi`);
        }
        if (!item.nama) {
            errors.push(`Baris ${rowNum}: Nama barang wajib diisi`);
        }
        if (!item.kategori) {
            errors.push(`Baris ${rowNum}: Kategori wajib diisi`);
        } else {
            const kategoriExists = kategoriList.some(k => k.nama.toLowerCase() === item.kategori.toLowerCase());
            if (!kategoriExists) {
                errors.push(`Baris ${rowNum}: Kategori "${item.kategori}" tidak ditemukan`);
            }
        }
        if (!item.satuan) {
            errors.push(`Baris ${rowNum}: Satuan wajib diisi`);
        } else {
            const satuanExists = satuanList.some(s => s.nama.toLowerCase() === item.satuan.toLowerCase());
            if (!satuanExists) {
                errors.push(`Baris ${rowNum}: Satuan "${item.satuan}" tidak ditemukan`);
            }
        }
        if (item.stok < 0) {
            errors.push(`Baris ${rowNum}: Stok tidak boleh negatif`);
        }
        if (item.hargaBeli < 0) {
            errors.push(`Baris ${rowNum}: Harga beli tidak boleh negatif`);
        }
        if (item.hargaJual < 0) {
            errors.push(`Baris ${rowNum}: Harga jual tidak boleh negatif`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}
