const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const fail = (res, errors) =>
  res.status(400).json({ status: 'error', message: 'Validasi gagal', errors });

// Dipakai untuk POST /api/kategori
const validateKategori = (req, res, next) => {
  const body = req.body;
  if (!isPlainObject(body)) {
    return fail(res, ['Body harus berupa objek JSON']);
  }

  const errors = [];
  const { nama_kategori, deskripsi } = body;

  if (typeof nama_kategori !== 'string' || nama_kategori.trim() === '') {
    errors.push('nama_kategori wajib diisi dan tidak boleh kosong');
  } else if (nama_kategori.trim().length > 50) {
    errors.push('nama_kategori maksimal 50 karakter');
  }

  if (deskripsi !== undefined && deskripsi !== null) {
    if (typeof deskripsi !== 'string') {
      errors.push('deskripsi harus berupa teks');
    } else if (deskripsi.trim().length > 200) {
      errors.push('deskripsi maksimal 200 karakter');
    }
  }

  if (errors.length > 0) return fail(res, errors);

  // Teruskan hanya field yang dikenal, sudah dirapikan (trim)
  req.body = {
    nama_kategori: nama_kategori.trim(),
    deskripsi:
      typeof deskripsi === 'string' && deskripsi.trim() !== ''
        ? deskripsi.trim()
        : null,
  };
  next();
};

module.exports = { validateKategori };