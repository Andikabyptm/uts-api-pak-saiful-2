const MAX_INT = 2147483647; // batas tipe INTEGER PostgreSQL
const FIELDS = ['kategori_id', 'kode_produk', 'nama_produk', 'harga', 'stok'];

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isInt = (value) => typeof value === 'number' && Number.isInteger(value);

const fail = (res, errors) =>
  res.status(400).json({ status: 'error', message: 'Validasi gagal', errors });

const textRule = (name, value, max) => {
  if (typeof value !== 'string' || value.trim() === '') {
    return `${name} wajib diisi dan tidak boleh kosong`;
  }
  if (value.trim().length > max) {
    return `${name} maksimal ${max} karakter`;
  }
  return null;
};

// Satu aturan per field. Mengembalikan pesan error, atau null bila valid.
const rules = {
  kategori_id: (v) =>
    isInt(v) && v >= 1 && v <= MAX_INT
      ? null
      : 'kategori_id harus berupa bilangan bulat >= 1',
  kode_produk: (v) => textRule('kode_produk', v, 20),
  nama_produk: (v) => textRule('nama_produk', v, 100),
  harga: (v) =>
    isInt(v) && v > 0 && v <= MAX_INT
      ? null
      : 'harga harus berupa bilangan bulat > 0',
  stok: (v) =>
    isInt(v) && v >= 0 && v <= MAX_INT
      ? null
      : 'stok harus berupa bilangan bulat >= 0',
};

const normalize = (value) => (typeof value === 'string' ? value.trim() : value);

// POST dan PUT: kelima field wajib ada dan valid
const validateProduk = (req, res, next) => {
  const body = req.body;
  if (!isPlainObject(body)) {
    return fail(res, ['Body harus berupa objek JSON']);
  }

  const errors = [];
  const cleaned = {};

  for (const field of FIELDS) {
    if (body[field] === undefined) {
      errors.push(`${field} wajib diisi`);
      continue;
    }
    const error = rules[field](body[field]);
    if (error) {
      errors.push(error);
    } else {
      cleaned[field] = normalize(body[field]);
    }
  }

  if (errors.length > 0) return fail(res, errors);

  req.body = cleaned;
  next();
};

// PATCH: minimal satu field; field yang dikirim harus valid
const validateProdukPatch = (req, res, next) => {
  const body = req.body;
  if (!isPlainObject(body)) {
    return fail(res, ['Body harus berupa objek JSON']);
  }

  const present = FIELDS.filter((field) => body[field] !== undefined);
  if (present.length === 0) {
    return fail(res, [
      `Minimal satu field harus dikirim (${FIELDS.join(', ')})`,
    ]);
  }

  const errors = [];
  const cleaned = {};

  for (const field of present) {
    const error = rules[field](body[field]);
    if (error) {
      errors.push(error);
    } else {
      cleaned[field] = normalize(body[field]);
    }
  }

  if (errors.length > 0) return fail(res, errors);

  req.body = cleaned;
  next();
};

// Filter opsional GET /api/produk?kategori_id=1  -> hasil di req.filter
const validateProdukFilter = (req, res, next) => {
  const raw = req.query.kategori_id;

  if (raw === undefined) {
    req.filter = {};
    return next();
  }

  if (
    typeof raw !== 'string' ||
    !/^\d+$/.test(raw) ||
    Number(raw) < 1 ||
    Number(raw) > MAX_INT
  ) {
    return fail(res, ['kategori_id harus berupa bilangan bulat >= 1']);
  }

  req.filter = { kategoriId: Number(raw) };
  next();
};

module.exports = { validateProduk, validateProdukPatch, validateProdukFilter };