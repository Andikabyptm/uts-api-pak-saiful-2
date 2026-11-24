const express = require('express');
const kategoriController = require('../controllers/kategoriController');
const produkController = require('../controllers/produkController');
const parseId = require('../middlewares/parseId');
const { validateKategori } = require('../middlewares/validateKategori');

const router = express.Router();

router.get('/', kategoriController.getAll);
router.get('/:id/produk', parseId, produkController.getByKategori);
router.get('/:id', parseId, kategoriController.getById);
router.post('/', validateKategori, kategoriController.create);
router.delete('/:id', parseId, kategoriController.remove);

module.exports = router;