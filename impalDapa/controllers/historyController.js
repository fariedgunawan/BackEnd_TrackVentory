const createPool = require('../models/db');

// Controller untuk mendapatkan semua data history
exports.getHistory = async (req, res) => {
    const userId = req.user.id; // Mendapatkan user ID dari middleware autentikasi
    const pool = createPool(req.app.locals.dbConfig);

    try {
        const [history] = await pool.query(
            `SELECT h.product_name, h.stock_change, h.description, h.action_date
            FROM history h
            WHERE h.user_id = ?
            ORDER BY h.action_date DESC`,
            [userId]
        );

        if (history.length === 0) {
            return res.status(404).json({ message: 'No history found' });
        }

        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};

exports.printHistoryPDF = async (req, res) => {
    const userId = req.user.id; // Mendapatkan user ID dari middleware autentikasi
    const pool = createPool(req.app.locals.dbConfig);

    try {
        console.log('User ID:', userId); // Debugging log
        const [history] = await pool.query(
            `SELECT h.product_name, h.stock_change, h.description, h.action_date
            FROM history h
            WHERE h.user_id = ?
            ORDER BY h.action_date DESC`,
            [userId]
        );

        if (history.length === 0) {
            console.log('No history found for user:', userId); // Debugging log
            return res.status(404).json({ message: 'No history found' });
        }

        console.log('History retrieved:', history); // Debugging log

        // Membuat PDF
        const doc = new PDFDocument();
        const filename = `history_${userId}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        doc.pipe(res);

        // Header PDF
        doc.fontSize(20).text('User History', { align: 'center' });
        doc.moveDown();

        // Isi tabel
        history.forEach((item, index) => {
            doc.fontSize(12).text(
                `${index + 1}. Product: ${item.product_name}\n   Stock Change: ${item.stock_change}\n   Description: ${item.description}\n   Action Date: ${new Date(item.action_date).toLocaleString()}`
            );
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error('Error in printHistoryPDF:', error); // Log error
        res.status(500).json({ error: error.message });
    } finally {
        pool.end();
    }
};

