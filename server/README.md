# Inventory Management Server# Inventory Management Server

API Server untuk sistem manajemen inventory barang dengan dukungan **konversi satuan multi-level** menggunakan Bun, Hono, Prisma, dan MySQL.API Server untuk sistem manajemen inventory barang menggunakan Bun, Hono, Prisma, dan MySQL.

## ✨ Fitur Utama## Setup Database

- ✅ CRUD Kategori Barang1. Pastikan MySQL sudah terinstall dan berjalan

- ✅ CRUD Satuan (pcs, box, dus, pack, renteng, dll)2. Buat database baru:

- ✅ CRUD Barang dengan konversi satuan multi-level

- ✅ Manajemen Stok (masuk, keluar, penyesuaian, retur)```sql

- ✅ Riwayat Transaksi StokCREATE DATABASE inventory_db;

- ✅ Konversi otomatis antar satuan```

- ✅ Validasi input dengan Zod

- ✅ Support pencarian dan filter3. Update file `.env` dengan kredensial database Anda:

## 🔄 Sistem Konversi Satuan```env

DATABASE_URL="mysql://username:password@localhost:3306/inventory_db"

Sistem mendukung hierarki satuan yang fleksibel:```

**Contoh 1: Mie Instan**## Instalasi

````

1 dus = 8 boxTo install dependencies:

1 box = 10 pcs

Total: 1 dus = 80 pcs```sh

```bun install

````

**Contoh 2: Air Mineral**

````Dependencies yang terinstal:

1 dus = 4 pack

1 pack = 6 pcs- `@prisma/client` - Prisma ORM Client

Total: 1 dus = 24 pcs- `prisma` - Prisma CLI

```- `zod` - Validasi schema

- `hono` - Web framework

**Contoh 3: Rokok**

```## Prisma Commands

1 pack = 2 renteng

1 renteng = 10 pcs```bash

Total: 1 pack = 20 pcs# Generate Prisma Client

```bun run db:generate



Stok disimpan dalam **satuan dasar** (pcs) dan dapat ditampilkan dalam satuan apapun sesuai konversi.# Push schema ke database (development)

bun run db:push

## 📦 Setup Database

# Create migration

1. Pastikan MySQL sudah terinstall dan berjalanbun run db:migrate

2. Buat database baru:

```sql# Open Prisma Studio (GUI untuk database)

CREATE DATABASE inventory_db;bun run db:studio

````

3. Update file `.env` dengan kredensial database Anda:## Jalankan Server

```env

DATABASE_URL="mysql://username:password@localhost:3306/inventory_db"To run:

```

```sh

## 🚀 Instalasibun run dev

```

To install dependencies:

````shopen http://localhost:3000

bun install

```## API Endpoints



Dependencies yang terinstal:Base URL: `http://localhost:3000`

- `@prisma/client` - Prisma ORM Client

- `prisma` - Prisma CLI### Items (Inventory Barang)

- `zod` - Validasi schema

- `hono` - Web framework#### 1. Get All Items



## 📊 Database Setup```

GET /api/items

```bash```

# 1. Push schema ke database (development)

bun run db:pushResponse:



# 2. Generate Prisma Client```json

bun run db:generate{

  "success": true,

# 3. Seed data awal (optional)  "data": [

bun run db:seed    {

```      "id": 1,

      "name": "Laptop Dell",

### Data Seed Awal      "description": "Laptop untuk kantor",

      "quantity": 10,

Script seed akan membuat:      "price": "15000000.00",

- 5 Satuan: `pcs`, `box`, `dus`, `pack`, `renteng`      "category": "Electronics",

- 3 Kategori: `Makanan`, `Minuman`, `Rokok`      "sku": "LAPTOP-001",

- 3 Barang contoh dengan konversi satuan      "createdAt": "2025-10-28T10:00:00.000Z",

- Riwayat stok awal      "updatedAt": "2025-10-28T10:00:00.000Z"

    }

## 🏃 Jalankan Server  ]

}

To run:```

```sh

bun run dev#### 2. Get Item by ID

````

```

Server akan berjalan di: `http://localhost:3000`GET /api/items/:id

```

## 📚 API Documentation

#### 3. Create New Item

Dokumentasi lengkap API tersedia di: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

````

### EndpointsPOST /api/items

Content-Type: application/json

#### Kategori

- `GET /api/kategori` - Get all kategori{

- `GET /api/kategori/:id` - Get kategori by ID  "name": "Laptop Dell",

- `POST /api/kategori` - Create kategori  "description": "Laptop untuk kantor",

- `PUT /api/kategori/:id` - Update kategori  "quantity": 10,

- `DELETE /api/kategori/:id` - Delete kategori  "price": 15000000,

  "category": "Electronics",

#### Satuan  "sku": "LAPTOP-001"

- `GET /api/satuan` - Get all satuan}

- `GET /api/satuan/:id` - Get satuan by ID```

- `POST /api/satuan` - Create satuan

- `PUT /api/satuan/:id` - Update satuan#### 4. Update Item

- `DELETE /api/satuan/:id` - Delete satuan

````

#### BarangPUT /api/items/:id

- `GET /api/barang` - Get all barang (support filter & search)Content-Type: application/json

- `GET /api/barang/:id` - Get barang by ID

- `POST /api/barang` - Create barang dengan konversi satuan{

- `PUT /api/barang/:id` - Update barang "quantity": 15,

- `DELETE /api/barang/:id` - Delete barang "price": 14500000

- `POST /api/barang/:id/stok` - Update stok (masuk/keluar)}

- `GET /api/barang/:id/riwayat` - Get riwayat stok```

## 💡 Contoh Penggunaan#### 5. Delete Item

### 1. Buat Barang dengan Konversi Satuan```

DELETE /api/items/:id

`bash`

POST /api/barang

Content-Type: application/json## Database Schema

{### Item Model

"kode": "INDOMIE-001",

"nama": "Indomie Goreng",- `id` - Integer, Primary Key, Auto Increment

"deskripsi": "Mie instan rasa goreng",- `name` - String (max 255), Required

"kategoriId": 1,- `description` - Text, Optional

"satuanDasarId": 1,- `quantity` - Integer, Default: 0

"hargaBeli": 2500,- `price` - Decimal(10,2), Required

"hargaJual": 3000,- `category` - String (max 100), Required

"stokMinimum": 100,- `sku` - String (max 100), Unique, Required

"stok": 800,- `createdAt` - DateTime, Auto

"lokasi": "Rak A1",- `updatedAt` - DateTime, Auto

"barcode": "8991234567890",

"aktif": true,## Struktur Folder

"konversiSatuan": [

    {```

      "satuanDariId": 3,server/

      "satuanKeId": 2,├── src/

      "jumlahKonversi": 8│   ├── index.ts          # Entry point

    },│   ├── lib/

    {│   │   └── prisma.ts     # Prisma client instance

      "satuanDariId": 2,│   └── routes/

      "satuanKeId": 1,│       └── items.ts      # CRUD routes untuk items

      "jumlahKonversi": 10├── prisma/

    }│   └── schema.prisma     # Database schema

]├── .env # Environment variables

}└── package.json

````



### 2. Update Stok## Validasi



```bashMenggunakan Zod untuk validasi input:

POST /api/barang/1/stok

Content-Type: application/json- `name`: Required, 1-255 karakter

- `description`: Optional

{- `quantity`: Integer, min 0

  "jenisTransaksi": "masuk",- `price`: Number, harus positif

  "jumlah": 160,- `category`: Required, 1-100 karakter

  "keterangan": "Pembelian dari supplier",- `sku`: Required, 1-100 karakter, unique

  "referensi": "PO-001"
}
```

### 3. Get Barang dengan Stok dalam Berbagai Satuan

```bash
GET /api/barang/1
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "kode": "INDOMIE-001",
    "nama": "Indomie Goreng",
    "stok": "800.00",
    "satuanDasar": {
      "nama": "pcs"
    },
    "konversiSatuan": [...],
    "stokDalamSatuan": {
      "dus": 10,
      "box": 0
    }
  }
}
```

## 🗄️ Database Schema

### Model Utama

#### Kategori
- Mengelompokkan barang

#### Satuan
- Menyimpan satuan (pcs, box, dus, pack, renteng, dll)

#### KonversiSatuan
- Mendefinisikan hubungan antar satuan per barang
- Contoh: 1 dus = 8 box, 1 box = 10 pcs

#### Barang
- Data barang lengkap
- Stok dalam satuan dasar
- Hubungan ke kategori dan satuan

#### RiwayatStok
- Tracking semua pergerakan stok
- Menyimpan stok sebelum dan sesudah transaksi

## 🛠️ Prisma Commands

```bash
# Generate Prisma Client
bun run db:generate

# Push schema ke database (development)
bun run db:push

# Create migration (production)
bun run db:migrate

# Open Prisma Studio (GUI untuk database)
bun run db:studio

# Seed data awal
bun run db:seed
```

## 📁 Struktur Folder

```
server/
├── src/
│   ├── index.ts              # Entry point
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client instance
│   │   └── seed.ts           # Database seeder
│   └── routes/
│       ├── kategori.ts       # CRUD kategori
│       ├── satuan.ts         # CRUD satuan
│       ├── barang.ts         # CRUD barang + stok
│       └── items.ts          # (deprecated)
├── prisma/
│   └── schema.prisma         # Database schema
├── .env                      # Environment variables
├── package.json
├── README.md
└── API_DOCUMENTATION.md      # Dokumentasi API lengkap
```

## 🔍 Query Params & Filters

### Get All Barang

```bash
# Filter by kategori
GET /api/barang?kategoriId=1

# Filter by status aktif
GET /api/barang?aktif=true

# Search by nama, kode, atau barcode
GET /api/barang?search=indomie

# Kombinasi filter
GET /api/barang?kategoriId=1&aktif=true&search=mie
```

### Get Riwayat Stok

```bash
# Default: 50 data terakhir
GET /api/barang/1/riwayat

# Custom limit dan offset
GET /api/barang/1/riwayat?limit=100&offset=50
```

## ⚠️ Error Handling

Semua endpoint mengembalikan response dengan format konsisten:

**Success:**
```json
{
  "success": true,
  "data": {...},
  "message": "Success message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## 🔐 Environment Variables

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/inventory_db"

# Server (optional)
PORT=3000
NODE_ENV=development
```

## 📝 Validasi

Sistem menggunakan Zod untuk validasi:

### Barang
- `kode`: Required, max 100 karakter, unique
- `nama`: Required, max 255 karakter
- `kategoriId`: Required, harus valid
- `satuanDasarId`: Required, harus valid
- `hargaBeli`: Required, harus positif
- `hargaJual`: Required, harus positif
- `stok`: Min 0
- `konversiSatuan`: Array of conversion rules

### Update Stok
- `jenisTransaksi`: Required (masuk/keluar/penyesuaian/retur)
- `jumlah`: Required, number
- `keterangan`: Optional
- `referensi`: Optional

## 🎯 Next Steps

1. ✅ Setup database dan environment variables
2. ✅ Run migrations: `bun run db:push`
3. ✅ Generate Prisma Client: `bun run db:generate`
4. ✅ Seed data awal: `bun run db:seed`
5. ✅ Start server: `bun run dev`
6. ✅ Test API dengan Postman atau curl
7. ⬜ Build frontend (client)
8. ⬜ Deploy ke production

## 📞 Support

Untuk dokumentasi lengkap API, lihat [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
````
