-- =====================================================================
-- seed.sql : data awal (3 kategori, 6 produk)
-- Jalankan SETELAH schema.sql, pada database db_uts.
-- =====================================================================

INSERT INTO kategori (nama_kategori, deskripsi) VALUES
    ('Elektronik',        'Perangkat elektronik dan aksesorisnya'),
    ('Fashion',           'Pakaian, sepatu, dan aksesoris'),
    ('Makanan & Minuman', 'Makanan ringan dan minuman kemasan');

INSERT INTO produk (kategori_id, kode_produk, nama_produk, harga, stok) VALUES
    ((SELECT id FROM kategori WHERE nama_kategori = 'Elektronik'),        'ELK-001', 'Headset Bluetooth',   250000, 40),
    ((SELECT id FROM kategori WHERE nama_kategori = 'Elektronik'),        'ELK-002', 'Power Bank 10000mAh', 180000, 25),
    ((SELECT id FROM kategori WHERE nama_kategori = 'Fashion'),           'FSH-001', 'Kaos Polos Hitam',     75000, 100),
    ((SELECT id FROM kategori WHERE nama_kategori = 'Fashion'),           'FSH-002', 'Topi Baseball',        60000, 50),
    ((SELECT id FROM kategori WHERE nama_kategori = 'Makanan & Minuman'), 'MKN-001', 'Keripik Singkong',     15000, 200),
    ((SELECT id FROM kategori WHERE nama_kategori = 'Makanan & Minuman'), 'MKN-002', 'Teh Botol 450ml',       5000, 300);