const mysql = require('mysql2/promise');

const createPool = (config) => {
    return mysql.createPool(config);
};

module.exports = createPool;
