import prisma from '../lib/prisma';

async function main() {
    console.log('🌱 Mulai seeding database...');

    // 1. Buat Satuan
    console.log('📦 Membuat satuan...');
    const pcs = await prisma.satuan.upsert({
        where: { nama: 'pcs' },
        update: {},
        create: {
            nama: 'pcs',
            deskripsi: 'Pieces / Satuan terkecil',
        },
    });

    const box = await prisma.satuan.upsert({
        where: { nama: 'box' },
        update: {},
        create: {
            nama: 'box',
            deskripsi: 'Box',
        },
    });

    const dus = await prisma.satuan.upsert({
        where: { nama: 'dus' },
        update: {},
        create: {
            nama: 'dus',
            deskripsi: 'Dus / Karton',
        },
    });

    const pack = await prisma.satuan.upsert({
        where: { nama: 'pack' },
        update: {},
        create: {
            nama: 'pack',
            deskripsi: 'Pack',
        },
    });

    const renteng = await prisma.satuan.upsert({
        where: { nama: 'renteng' },
        update: {},
        create: {
            nama: 'renteng',
            deskripsi: 'Renteng',
        },
    });

    console.log('✅ Satuan berhasil dibuat');

    // 2. Buat Kategori
    console.log('🏷️  Membuat kategori...');
    const makanan = await prisma.kategori.upsert({
        where: { id: 1 },
        update: {},
        create: {
            nama: 'Makanan',
            deskripsi: 'Produk makanan',
        },
    });

    const minuman = await prisma.kategori.upsert({
        where: { id: 2 },
        update: {},
        create: {
            nama: 'Minuman',
            deskripsi: 'Produk minuman',
        },
    });

    const rokok = await prisma.kategori.upsert({
        where: { id: 3 },
        update: {},
        create: {
            nama: 'Rokok',
            deskripsi: 'Produk rokok',
        },
    });

    console.log('✅ Kategori berhasil dibuat');

    // 3. Buat Barang dengan konversi satuan
    console.log('📦 Membuat barang...');

    // Contoh 1: Indomie - 1 dus = 8 box = 10 pcs
    await prisma.barang.upsert({
        where: { kode: 'INDOMIE-001' },
        update: {},
        create: {
            kode: 'INDOMIE-001',
            nama: 'Indomie Goreng',
            deskripsi: 'Mie instan rasa goreng',
            kategoriId: makanan.id,
            satuanId: pcs.id,
            hargaBeli: 2500,
            hargaJual: 3000,
            minimumStok: 100,
            stok: 800, // 10 dus
            lokasi: 'Rak A1',
            barcode: '8991234567890',
            aktif: true,
            konversiSatuan: {
                create: [
                    {
                        satuanDariId: dus.id,
                        satuanKeId: box.id,
                        jumlahKonversi: 8, // 1 dus = 8 box
                    },
                    {
                        satuanDariId: box.id,
                        satuanKeId: pcs.id,
                        jumlahKonversi: 10, // 1 box = 10 pcs
                    },
                ],
            },
        },
    });

    // Contoh 2: Aqua - 1 dus = 4 pack = 6 pcs
    await prisma.barang.upsert({
        where: { kode: 'AQUA-600ML' },
        update: {},
        create: {
            kode: 'AQUA-600ML',
            nama: 'Aqua 600ml',
            deskripsi: 'Air mineral Aqua 600ml',
            kategoriId: minuman.id,
            satuanId: pcs.id,
            hargaBeli: 3000,
            hargaJual: 3500,
            minimumStok: 50,
            stok: 240, // 10 dus
            lokasi: 'Rak B1',
            barcode: '8993675123456',
            aktif: true,
            konversiSatuan: {
                create: [
                    {
                        satuanDariId: dus.id,
                        satuanKeId: pack.id,
                        jumlahKonversi: 4, // 1 dus = 4 pack
                    },
                    {
                        satuanDariId: pack.id,
                        satuanKeId: pcs.id,
                        jumlahKonversi: 6, // 1 pack = 6 pcs
                    },
                ],
            },
        },
    });

    // Contoh 3: Sampoerna - 1 pack = 2 renteng = 10 pcs
    await prisma.barang.upsert({
        where: { kode: 'SAMPOERNA-MILD' },
        update: {},
        create: {
            kode: 'SAMPOERNA-MILD',
            nama: 'Sampoerna Mild',
            deskripsi: 'Rokok Sampoerna Mild 16 batang',
            kategoriId: rokok.id,
            satuanId: pcs.id,
            hargaBeli: 28000,
            hargaJual: 30000,
            minimumStok: 20,
            stok: 200, // 10 pack
            lokasi: 'Rak C1',
            barcode: '8991234000123',
            aktif: true,
            konversiSatuan: {
                create: [
                    {
                        satuanDariId: pack.id,
                        satuanKeId: renteng.id,
                        jumlahKonversi: 2, // 1 pack = 2 renteng
                    },
                    {
                        satuanDariId: renteng.id,
                        satuanKeId: pcs.id,
                        jumlahKonversi: 10, // 1 renteng = 10 pcs
                    },
                ],
            },
        },
    });

    console.log('✅ Barang berhasil dibuat');

    // 4. Buat riwayat stok awal
    console.log('📊 Membuat riwayat stok...');
    const barangList = await prisma.barang.findMany();

    for (const brg of barangList) {
        await prisma.riwayatStok.create({
            data: {
                barangId: brg.id,
                jenisTransaksi: 'masuk',
                jumlah: brg.stok,
                stokSebelum: 0,
                stokSesudah: brg.stok,
                keterangan: 'Stok awal',
                referensi: 'SEED-001',
            },
        });
    }

    console.log('✅ Riwayat stok berhasil dibuat');
    console.log('\n🎉 Seeding selesai!');
    console.log('\nData yang dibuat:');
    console.log('- 5 Satuan (pcs, box, dus, pack, renteng)');
    console.log('- 3 Kategori (Makanan, Minuman, Rokok)');
    console.log('- 3 Barang dengan konversi satuan');
    console.log('- Riwayat stok awal');
}

main()
    .catch((e) => {
        console.error('❌ Error saat seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
