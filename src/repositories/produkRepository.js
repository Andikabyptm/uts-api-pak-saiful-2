const pool = require('../config/db');

const COLUMNS =
  'id, kategori_id, kode_produk, nama_produk, harga, stok, created_at, deleted_at';

// Daftar kolom yang boleh diubah lewat PATCH (whitelist, bukan input pengguna)
const PATCHABLE = ['kategori_id', 'kode_produk', 'nama_produk', 'harga', 'stok'];

class ProdukRepository {
  // Semua produk aktif; kategoriId opsional (filter ?kategori_id=)
  async findAllActive({ kategoriId } = {}) {
    const result = await pool.query(
      `SELECT ${COLUMNS} FROM produk
       WHERE deleted_at IS NULL
         AND ($1::int IS NULL OR kategori_id = $1)
       ORDER BY id`,
      [kategoriId === undefined ? null : kategoriId]
    );
    return result.rows;
  }

  async findActiveByKategoriId(kategoriId) {
    const result = await pool.query(
      `SELECT ${COLUMNS} FROM produk
       WHERE kategori_id = $1 AND deleted_at IS NULL
       ORDER BY id`,
      [kategoriId]
    );
    return result.rows;
  }

  async findActiveById(id) {
    const result = await pool.query(
      `SELECT ${COLUMNS} FROM produk WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Termasuk baris yang sudah di-soft delete (dipakai fitur hapus permanen)
  async findAnyById(id) {
    const result = await pool.query(
      `SELECT ${COLUMNS} FROM produk WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create({ kategori_id, kode_produk, nama_produk, harga, stok }) {
    const result = await pool.query(
      `INSERT INTO produk (kategori_id, kode_produk, nama_produk, harga, stok)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLUMNS}`,
      [kategori_id, kode_produk, nama_produk, harga, stok]
    );
    return result.rows[0];
  }

  // PUT: ganti seluruh field
  async replace(id, { kategori_id, kode_produk, nama_produk, harga, stok }) {
    const result = await pool.query(
      `UPDATE produk
       SET kategori_id = $1, kode_produk = $2, nama_produk = $3, harga = $4, stok = $5
       WHERE id = $6 AND deleted_at IS NULL
       RETURNING ${COLUMNS}`,
      [kategori_id, kode_produk, nama_produk, harga, stok, id]
    );
    return result.rows[0] || null;
  }

  // PATCH: ubah sebagian field. Nama kolom berasal dari whitelist, nilai tetap berparameter.
  async patch(id, fields) {
    const keys = PATCHABLE.filter((key) => fields[key] !== undefined);
    if (keys.length === 0) {
      throw new Error('patch() dipanggil tanpa field yang valid');
    }
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = keys.map((key) => fields[key]);
    values.push(id);

    const result = await pool.query(
      `UPDATE produk
       SET ${setClause}
       WHERE id = $${keys.length + 1} AND deleted_at IS NULL
       RETURNING ${COLUMNS}`,
      values
    );
    return result.rows[0] || null;
  }

  // Soft delete: hanya mengisi deleted_at, baris tetap ada
  async softDelete(id) {
    const result = await pool.query(
      `UPDATE produk SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rowCount > 0;
  }

  // Restore: hanya untuk baris yang sedang terhapus
  async restore(id) {
    const result = await pool.query(
      `UPDATE produk SET deleted_at = NULL
       WHERE id = $1 AND deleted_at IS NOT NULL
       RETURNING ${COLUMNS}`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Nilai tambah: hard delete khusus baris yang sudah di-soft delete
  async deletePermanent(id) {
    const result = await pool.query(
      'DELETE FROM produk WHERE id = $1 AND deleted_at IS NOT NULL',
      [id]
    );
    return result.rowCount > 0;
  }
}

module.exports = new ProdukRepository();