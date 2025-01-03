const express = require('express');
const {
    getProducts,
    addProduct,
    editProduct,
    deleteProduct,
    getProductsByCategory
} = require('../controllers/productController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/', getProducts);
router.post('/add', addProduct);
router.put('/:id', editProduct);
router.delete('/:id', deleteProduct);
router.get('/filter', getProductsByCategory);
module.exports = router;
