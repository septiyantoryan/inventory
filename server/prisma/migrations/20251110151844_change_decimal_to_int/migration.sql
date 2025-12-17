-- CreateTable
CREATE TABLE `kategori` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `deskripsi` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `satuan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(50) NOT NULL,
    `deskripsi` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `satuan_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `konversi_satuan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `barangId` INTEGER NOT NULL,
    `satuanDariId` INTEGER NOT NULL,
    `satuanKeId` INTEGER NOT NULL,
    `jumlahKonversi` INTEGER NOT NULL DEFAULT 1,
    `hargaBeli` INTEGER NULL,
    `hargaJual` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `konversi_satuan_barangId_idx`(`barangId`),
    INDEX `konversi_satuan_satuanDariId_idx`(`satuanDariId`),
    INDEX `konversi_satuan_satuanKeId_idx`(`satuanKeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `barang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(100) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `deskripsi` TEXT NULL,
    `kategoriId` INTEGER NOT NULL,
    `satuanId` INTEGER NOT NULL,
    `hargaBeli` INTEGER NOT NULL DEFAULT 0,
    `hargaJual` INTEGER NOT NULL DEFAULT 0,
    `minimumStok` INTEGER NOT NULL DEFAULT 0,
    `stok` INTEGER NOT NULL DEFAULT 0,
    `lokasi` VARCHAR(100) NULL,
    `barcode` VARCHAR(100) NULL,
    `gambar` VARCHAR(255) NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `barang_kode_key`(`kode`),
    INDEX `barang_kode_idx`(`kode`),
    INDEX `barang_nama_idx`(`nama`),
    INDEX `barang_kategoriId_idx`(`kategoriId`),
    INDEX `barang_satuanId_idx`(`satuanId`),
    INDEX `barang_barcode_idx`(`barcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `riwayat_stok` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `barangId` INTEGER NOT NULL,
    `jenisTransaksi` VARCHAR(50) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `stokSebelum` INTEGER NOT NULL,
    `stokSesudah` INTEGER NOT NULL,
    `keterangan` TEXT NULL,
    `referensi` VARCHAR(100) NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `riwayat_stok_barangId_idx`(`barangId`),
    INDEX `riwayat_stok_jenisTransaksi_idx`(`jenisTransaksi`),
    INDEX `riwayat_stok_tanggal_idx`(`tanggal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `konversi_satuan` ADD CONSTRAINT `konversi_satuan_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `barang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `konversi_satuan` ADD CONSTRAINT `konversi_satuan_satuanDariId_fkey` FOREIGN KEY (`satuanDariId`) REFERENCES `satuan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `konversi_satuan` ADD CONSTRAINT `konversi_satuan_satuanKeId_fkey` FOREIGN KEY (`satuanKeId`) REFERENCES `satuan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `barang` ADD CONSTRAINT `barang_kategoriId_fkey` FOREIGN KEY (`kategoriId`) REFERENCES `kategori`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `barang` ADD CONSTRAINT `barang_satuanId_fkey` FOREIGN KEY (`satuanId`) REFERENCES `satuan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `riwayat_stok` ADD CONSTRAINT `riwayat_stok_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `barang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
