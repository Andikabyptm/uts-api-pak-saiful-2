const kategoriRepository = require('../repositories/kategoriRepository');

const getAll = async (req, res, next) => {
  try {
    const data = await kategoriRepository.findAll();
    res.status(200).json({
      status: 'success',
      message: 'Daftar kategori berhasil diambil',
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const data = await kategoriRepository.findById(req.parsedId);
    if (!data) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Kategori tidak ditemukan' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Detail kategori berhasil diambil',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await kategoriRepository.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Kategori berhasil ditambahkan',
      data,
    });
  } catch (err) {
    // 23505 = unique_violation (nama_kategori kembar)
    if (err.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'nama_kategori sudah digunakan',
      });
    }
    next(err);
  }
};

// Hard delete
const remove = async (req, res, next) => {
  try {
    const deleted = await kategoriRepository.delete(req.parsedId);
    if (!deleted) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Kategori tidak ditemukan' });
    }
    res.status(204).end();
  } catch (err) {
    // 23503 = foreign_key_violation (kategori masih dirujuk produk)
    if (err.code === '23503') {
      return res.status(409).json({
        status: 'error',
        message:
          'Kategori tidak dapat dihapus karena masih dipakai oleh produk (termasuk produk yang sudah di-soft delete)',
      });
    }
    next(err);
  }
};

module.exports = { getAll, getById, create, remove };