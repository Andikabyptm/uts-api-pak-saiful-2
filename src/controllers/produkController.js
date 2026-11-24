const produkRepository = require('../repositories/produkRepository');
const kategoriRepository = require('../repositories/kategoriRepository');

const notFound = (res, message = 'Produk tidak ditemukan') =>
  res.status(404).json({ status: 'error', message });

// Menerjemahkan error PostgreSQL pada INSERT/UPDATE. Error lain diteruskan ke handler pusat.
const handleWriteError = (err, res, next) => {
  // 23505 = unique_violation -> kode_produk sudah dipakai
  if (err.code === '23505') {
    return res.status(409).json({
      status: 'error',
      message:
        'kode_produk sudah digunakan oleh produk lain (termasuk produk yang sudah di-soft delete)',
    });
  }
  // 23503 = foreign_key_violation -> kategori_id tidak ada
  if (err.code === '23503') {
    return res.status(422).json({
      status: 'error',
      message: 'kategori_id tidak ditemukan di tabel kategori',
    });
  }
  return next(err);
};

const getAll = async (req, res, next) => {
  try {
    const data = await produkRepository.findAllActive(req.filter);
    res.status(200).json({
      status: 'success',
      message: 'Daftar produk berhasil diambil',
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const data = await produkRepository.findActiveById(req.parsedId);
    if (!data) return notFound(res);
    res.status(200).json({
      status: 'success',
      message: 'Detail produk berhasil diambil',
      data,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/kategori/:id/produk  (kategori tidak ada -> 404, kategori kosong -> 200 + data [])
const getByKategori = async (req, res, next) => {
  try {
    const kategori = await kategoriRepository.findById(req.parsedId);
    if (!kategori) return notFound(res, 'Kategori tidak ditemukan');

    const data = await produkRepository.findActiveByKategoriId(req.parsedId);
    res.status(200).json({
      status: 'success',
      message: 'Daftar produk pada kategori berhasil diambil',
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await produkRepository.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Produk berhasil ditambahkan',
      data,
    });
  } catch (err) {
    handleWriteError(err, res, next);
  }
};

// PUT: ganti seluruh data
const replace = async (req, res, next) => {
  try {
    const data = await produkRepository.replace(req.parsedId, req.body);
    if (!data) return notFound(res);
    res.status(200).json({
      status: 'success',
      message: 'Produk berhasil diganti',
      data,
    });
  } catch (err) {
    handleWriteError(err, res, next);
  }
};

// PATCH: ubah sebagian field
const patch = async (req, res, next) => {
  try {
    const data = await produkRepository.patch(req.parsedId, req.body);
    if (!data) return notFound(res);
    res.status(200).json({
      status: 'success',
      message: 'Produk berhasil diubah',
      data,
    });
  } catch (err) {
    handleWriteError(err, res, next);
  }
};

// DELETE: soft delete
const remove = async (req, res, next) => {
  try {
    const deleted = await produkRepository.softDelete(req.parsedId);
    if (!deleted) return notFound(res);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// PATCH /:id/restore
const restore = async (req, res, next) => {
  try {
    const data = await produkRepository.restore(req.parsedId);
    if (!data) {
      return notFound(res, 'Produk tidak ditemukan atau tidak sedang dihapus');
    }
    res.status(200).json({
      status: 'success',
      message: 'Produk berhasil dipulihkan',
      data,
    });
  } catch (err) {
    next(err);
  }
};

// Nilai tambah: DELETE /:id/permanent (hard delete, hanya untuk produk yang sudah di-soft delete)
const removePermanent = async (req, res, next) => {
  try {
    const deleted = await produkRepository.deletePermanent(req.parsedId);
    if (deleted) return res.status(204).end();

    const existing = await produkRepository.findAnyById(req.parsedId);
    if (!existing) return notFound(res);

    return res.status(409).json({
      status: 'error',
      message:
        'Produk masih aktif. Lakukan soft delete (DELETE /api/produk/:id) terlebih dahulu',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  getByKategori,
  create,
  replace,
  patch,
  remove,
  restore,
  removePermanent,
};