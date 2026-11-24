-- =====================================================================
-- schema.sql : rancangan database UTS Pemrograman API (Toko Online)
-- =====================================================================
-- LANGKAH 1 (jalankan SEKALI, saat terhubung ke database bawaan "postgres"):
--
--     CREATE DATABASE db_uts;
--
-- LANGKAH 2: hubungkan ke database db_uts
--     (pgAdmin : klik kanan db_uts > Query Tool)
--     (psql    : \c db_uts)
--
-- LANGKAH 3: jalankan seluruh isi file ini (dari baris di bawah ini).
-- File ini aman dijalankan ulang karena tabel lama dihapus lebih dulu.
-- =====================================================================

DROP TABLE IF EXISTS produk;
DROP TABLE IF EXISTS kategori;

-- Tabel induk (hard delete)
CREATE TABLE kategori (
    id            SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(50)  NOT NULL UNIQUE,
    deskripsi     VARCHAR(200),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Tabel anak (soft delete lewat kolom deleted_at)
CREATE TABLE produk (
    id           SERIAL PRIMARY KEY,
    kategori_id  INTEGER      NOT NULL,
    kode_produk  VARCHAR(20)  NOT NULL UNIQUE,
    nama_produk  VARCHAR(100) NOT NULL,
    harga        INTEGER      NOT NULL CHECK (harga > 0),
    stok         INTEGER      NOT NULL DEFAULT 0 CHECK (stok >= 0),
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMP    NULL,
    CONSTRAINT fk_produk_kategori
        FOREIGN KEY (kategori_id) REFERENCES kategori (id)
);