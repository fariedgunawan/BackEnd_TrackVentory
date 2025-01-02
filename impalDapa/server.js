const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Konfigurasi database
const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '', // Ganti dengan password MySQL Anda
    database: 'trackventory',
};

app.locals.dbConfig = DB_CONFIG;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

const PORT = 3000; // Port server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
