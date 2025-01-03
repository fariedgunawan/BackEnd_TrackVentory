const express = require('express');
const {
    getProducts,
    addProduct,
    editProduct,
    deleteProduct,
    getProductsByCategory,
    getUserProductStatsIn,
    getUserProductTotal,
    getUserProductStatsOut,
    searchProductByName
} = require('../controllers/productController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/', getProducts);
router.post('/add', addProduct);
router.put('/:id', editProduct);
router.delete('/:id', deleteProduct);
router.get('/filter', getProductsByCategory);
router.get('/user/stock-in',getUserProductStatsIn);
router.get('/user/stock-out',getUserProductStatsOut);
router.get('/user/total-product',getUserProductTotal);
router.get('/search', searchProductByName);
module.exports = router;    
