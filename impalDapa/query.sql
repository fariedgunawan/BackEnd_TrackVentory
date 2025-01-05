CREATE DATABASE trackventorybener;

USE trackventorybener;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    quantity INT NOT NULL,
    last_input_date DATE NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert beberapa kategori
INSERT INTO categories (name) VALUES ('Electronics'), ('Clothing'), ('Books');

CREATE TABLE history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT, -- Tidak menggunakan ON DELETE CASCADE agar data tetap ada
    user_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL, -- Menyimpan nama produk untuk pelacakan
    action ENUM('ADD', 'EDIT', 'DELETE') NOT NULL,
    action_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    stock_change INT NOT NULL,
    description VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


ALTER TABLE users
ADD total_stock_in INT DEFAULT 0,
ADD total_product INT DEFAULT 0,
ADD total_stock_out INT DEFAULT 0
