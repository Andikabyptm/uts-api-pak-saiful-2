const MAX_INT = 2147483647; // batas tipe INTEGER PostgreSQL

// Memvalidasi :id di URL. Hasilnya disimpan di req.parsedId (tipe number).
const parseId = (req, res, next) => {
  const raw = req.params.id;

  if (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > MAX_INT) {
    return res.status(400).json({
      status: 'error',
      message: 'ID harus berupa bilangan bulat positif',
    });
  }

  req.parsedId = Number(raw);
  next();
};

module.exports = parseId;