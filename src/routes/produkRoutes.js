const express = require('express');
const produkController = require('../controllers/produkController');
const parseId = require('../middlewares/parseId');
const {
  validateProduk,
  validateProdukPatch,
  validateProdukFilter,
} = require('../middlewares/validateProduk');

const router = express.Router();

router.get('/', validateProdukFilter, produkController.getAll);
router.get('/:id', parseId, produkController.getById);
router.post('/', validateProduk, produkController.create);
router.put('/:id', parseId, validateProduk, produkController.replace);
router.patch('/:id/restore', parseId, produkController.restore);
router.patch('/:id', parseId, validateProdukPatch, produkController.patch);
router.delete('/:id/permanent', parseId, produkController.removePermanent);
router.delete('/:id', parseId, produkController.remove);

module.exports = router;