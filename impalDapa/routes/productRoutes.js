const express = require('express');
const {
    getProducts,
    addProduct,
    editProduct,
    deleteProduct,
} = require('../controllers/productController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/', getProducts);
router.post('/add', addProduct);
router.put('/:id', editProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
