const express = require('express');
const kategoriRoutes = require('./routes/kategoriRoutes');
const produkRoutes = require('./routes/produkRoutes');

const app = express();

app.use(express.json());

app.use('/api/kategori', kategoriRoutes);
app.use('/api/produk', produkRoutes);

// Handler 404: URL yang tidak dikenal
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route tidak ditemukan' });
});

// Error handler terpusat (harus punya 4 parameter)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // JSON rusak dari express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'error',
      message: 'Body request bukan JSON yang valid',
    });
  }

  // Error tak terduga: detail hanya ke console, klien menerima pesan umum
  console.error(err);
  res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan pada server',
  });
});

module.exports = app;