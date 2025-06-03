const db = require('../config/db');
const Cicilan = {
    getByTransaksi: (transaksiId, callback) => {
        db.query(
        'SELECT * FROM cicilan WHERE transaksi_id = ? ORDER BY tanggal_bayar desc',
        [transaksiId], callback
        );
    },

    add: (data, callback) => {
        db.query('INSERT INTO cicilan SET ?', [data], callback);
    },
    getById: (id, callback) => {
    db.query('SELECT * FROM cicilan WHERE id = ?', [id], callback);
    },
    delete: (id, callback) => {
    db.query('delete FROM cicilan WHERE id = ?', [id], callback);
    },
    getByTransaksi: (transaksiId, callback) => {
        const sql = 'SELECT * FROM cicilan WHERE transaksi_id = ?';
        db.query(sql, [transaksiId], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
};

module.exports = Cicilan;
