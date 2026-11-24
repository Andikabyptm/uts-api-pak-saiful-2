const pool = require('../config/db');

const COLUMNS = 'id, nama_kategori, deskripsi, created_at';

class KategoriRepository {
  async findAll() {
    const result = await pool.query(
      `SELECT ${COLUMNS} FROM kategori ORDER BY id`
    );
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      `SELECT ${COLUMNS} FROM kategori WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create({ nama_kategori, deskripsi }) {
    const result = await pool.query(
      `INSERT INTO kategori (nama_kategori, deskripsi)
       VALUES ($1, $2)
       RETURNING ${COLUMNS}`,
      [nama_kategori, deskripsi]
    );
    return result.rows[0];
  }

  // Hard delete: baris dihapus permanen. Mengembalikan true bila ada baris terhapus.
  async delete(id) {
    const result = await pool.query('DELETE FROM kategori WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

module.exports = new KategoriRepository();