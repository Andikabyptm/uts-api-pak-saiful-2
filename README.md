# UTS Pemrograman API — REST API Toko Online

REST API dua resource berelasi one-to-many (**kategori** → banyak **produk**) memakai Express.js dan PostgreSQL.
Tabel induk (`kategori`) memakai **hard delete**, tabel anak (`produk`) memakai **soft delete**.

- Kelompok : `[isi nama kelompok]`
- Anggota  : `[isi nama dan NIM]`

## 1. Cara menjalankan server

1. Install dependensi: `npm install`
2. Pada database bawaan `postgres`, jalankan `CREATE DATABASE db_uts;`
3. Pada database `db_uts`, jalankan isi `sql/schema.sql`, lalu `sql/seed.sql` (pgAdmin Query Tool, tombol F5).
4. Salin `.env.example` menjadi `.env`, lalu isi `DB_PASSWORD` sesuai PostgreSQL Anda.
5. Jalankan server: `npm start` (berjalan di `http://localhost:3000`).
6. Pengujian: import `uts.postman_collection.json` ke Postman, buat Environment berisi `baseUrl`
   (`http://localhost:3000`), `kategoriId`, `produkId`, `kategoriSementaraId`. Jalankan Folder 1 lalu Folder 2
   lewat Collection Runner.

## 2. Rancangan tabel dan relasi

Relasi: satu `kategori` memiliki banyak `produk` (`produk.kategori_id` → `kategori.id`).

**kategori (induk)**

| Kolom         | Tipe dan constraint                  |
| ------------- | ------------------------------------ |
| id            | SERIAL PRIMARY KEY                   |
| nama_kategori | VARCHAR(50) NOT NULL UNIQUE          |
| deskripsi     | VARCHAR(200), boleh kosong           |
| created_at    | TIMESTAMP NOT NULL DEFAULT NOW()     |

**produk (anak)**

| Kolom       | Tipe dan constraint                                  |
| ----------- | ---------------------------------------------------- |
| id          | SERIAL PRIMARY KEY                                   |
| kategori_id | INTEGER NOT NULL, FOREIGN KEY ke kategori(id)        |
| kode_produk | VARCHAR(20) NOT NULL UNIQUE                          |
| nama_produk | VARCHAR(100) NOT NULL                                |
| harga       | INTEGER NOT NULL CHECK (harga > 0)                   |
| stok        | INTEGER NOT NULL DEFAULT 0 CHECK (stok >= 0)         |
| created_at  | TIMESTAMP NOT NULL DEFAULT NOW()                     |
| deleted_at  | TIMESTAMP NULL (NULL berarti aktif)                  |

## 3. Daftar endpoint

| Method | URL                         | Fungsi                                   | Status                  |
| ------ | --------------------------- | ---------------------------------------- | ----------------------- |
| GET    | `/api/kategori`             | Daftar semua kategori                    | 200                     |
| GET    | `/api/kategori/:id`         | Detail satu kategori                     | 200, 400, 404           |
| POST   | `/api/kategori`             | Tambah kategori                          | 201, 400, 409           |
| DELETE | `/api/kategori/:id`         | Hard delete kategori                     | 204, 400, 404, 409      |
| GET    | `/api/produk`               | Daftar produk aktif + `count`            | 200                     |
| GET    | `/api/produk/:id`           | Detail produk aktif                      | 200, 400, 404           |
| GET    | `/api/kategori/:id/produk`  | Produk aktif milik satu kategori         | 200, 400, 404           |
| POST   | `/api/produk`               | Tambah produk                            | 201, 400, 409, 422      |
| PUT    | `/api/produk/:id`           | Ganti seluruh data (semua field wajib)   | 200, 400, 404, 409, 422 |
| PATCH  | `/api/produk/:id`           | Ubah sebagian field                      | 200, 400, 404, 409, 422 |
| DELETE | `/api/produk/:id`           | Soft delete                              | 204, 400, 404           |
| PATCH  | `/api/produk/:id/restore`   | Pulihkan produk yang di-soft delete      | 200, 400, 404           |
| DELETE | `/api/produk/:id/permanent` | Nilai tambah: hard delete produk yang sudah di-soft delete (aktif → 409) | 204, 400, 404, 409 |
| GET    | `/api/produk?kategori_id=1` | Nilai tambah: filter berdasarkan kategori | 200, 400               |

Contoh body `POST /api/kategori`:
```json
{ "nama_kategori": "Buku", "deskripsi": "Buku bacaan dan alat tulis" }
```

Contoh body `POST /api/produk` dan `PUT /api/produk/:id` (kelima field wajib):
```json
{ "kategori_id": 1, "kode_produk": "ELK-003", "nama_produk": "Mouse Wireless", "harga": 120000, "stok": 30 }
```

Contoh body `PATCH /api/produk/:id` (minimal satu field):
```json
{ "stok": 40 }
```

Format respons: sukses `{ "status": "success", "message": "...", "data": ... }` (daftar menambah `count`);
gagal `{ "status": "error", "message": "...", "errors": [...] }` (`errors` hanya untuk validasi).
Soft delete dan hard delete yang sukses membalas `204` tanpa body.

Arti kode status: `400` validasi/id/JSON salah; `404` data tidak ada atau sudah di-soft delete;
`409` pelanggaran UNIQUE (23505) atau kategori masih dipakai produk (23503);
`422` `kategori_id` tidak ada di tabel kategori (23503 pada INSERT/UPDATE produk).

## 4. Keputusan desain

### 4.1 Alasan memilih PUT dan PATCH

- **PUT** menggantikan seluruh data produk, sehingga kelima field **wajib** dikirim. Bila ada yang kurang, API menjawab
  `400` dan tidak diam-diam mengubah field yang tidak dikirim menjadi nilai bawaan atau `NULL`.
- **PATCH** hanya mengubah field yang dikirim. Cocok untuk perubahan kecil, misalnya hanya `stok`, tanpa mengirim ulang
  field lain. Body kosong `{}` ditolak `400` karena tidak ada perubahan yang diminta.

### 4.2 Perilaku soft delete terhadap UNIQUE dan foreign key

- **UNIQUE.** Soft delete hanya mengisi `deleted_at`; barisnya tetap ada di tabel. Karena itu `kode_produk` milik baris
  yang sudah di-soft delete **tetap memicu `409`** bila dipakai lagi. Alasannya: `restore` selalu aman dan tidak bentrok
  dengan produk baru yang memakai kode sama, riwayat yang merujuk kode lama tidak ambigu, dan cukup memakai constraint
  UNIQUE biasa. Konsekuensinya, kode yang sudah dihapus tidak bisa dipakai ulang kecuali produknya di-restore atau
  dihapus permanen lewat `DELETE /api/produk/:id/permanent`.
- **Foreign key.** Baris yang di-soft delete tetap merujuk kategorinya. Maka `DELETE /api/kategori/:id` tetap ditolak
  `409` selama masih ada produk dengan `kategori_id` tersebut, **termasuk produk yang sudah di-soft delete**. Untuk
  menghapus kategori, produk-produknya harus dihapus permanen lebih dulu. Ini menjaga integritas referensial dan restore
  tetap mungkin.

### 4.3 Alasan hard delete pada tabel induk

`kategori` adalah data master yang jumlahnya sedikit dan tidak perlu dipulihkan. Menghapusnya permanen membuat
`nama_kategori` dapat dipakai lagi dan tabel tetap bersih. Foreign key sudah menjadi pengaman: kategori yang masih dipakai
produk tidak akan terhapus (`409`), sehingga hard delete hanya berlaku untuk kategori yang memang tidak dipakai. Sebaliknya
`produk` adalah data katalog yang bisa terhubung ke riwayat dan perlu dapat dipulihkan, sehingga memakai soft delete.