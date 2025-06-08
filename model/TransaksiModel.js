const db = require('../config/db');

const Transaksi = {
    getAllByUser: (userId, callback) => {
        db.query(
        `SELECT 
            id, tipe, nama_lawan, tanggal_mulai, tanggal_jatuh_tempo,
            target_pelunasan_bulan, total, status, jumlah_cicilan,
            (total - jumlah_cicilan) AS sisa_cicilan
        FROM transaksi
        where user_id = ? order by id desc`,
        [userId], callback
        );
    },
    getAllByUserDashboard: (userId, callback) => {
        db.query(
        `SELECT 
            id, tipe, nama_lawan, tanggal_mulai, tanggal_jatuh_tempo,
            target_pelunasan_bulan, total, status, jumlah_cicilan,
            (total - jumlah_cicilan) AS sisa_cicilan
        FROM transaksi
        where user_id = ? order by id desc limit 4`,
        [userId], callback
        );
    },
     countSummaryByUser: (user_id, callback) => {
        const query = `
            SELECT
                COUNT(CASE WHEN tipe = 'utang' THEN 1 END) AS jumlah_utang,
                COUNT(CASE WHEN tipe = 'piutang' THEN 1 END) AS jumlah_piutang,
                COUNT(CASE WHEN status = 'lunas' THEN 1 END) AS jumlah_lunas,
                COUNT(CASE WHEN status = 'aktif' THEN 1 END) AS jumlah_aktif
            FROM transaksi
            WHERE user_id = ?
        `;
        db.query(query, [user_id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },
    getById: (id, callback) => {
    db.query(`
        SELECT 
            id, tipe, nama_lawan, tanggal_mulai, tanggal_jatuh_tempo,
            target_pelunasan_bulan, total, status, metode_cicilan,jumlah_cicilan,
            (total - jumlah_cicilan) AS sisa_cicilan
        FROM transaksi
        where id = ?
    `, [id], callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO transaksi SET ?', data, callback);
    },

    update: (id, data, callback) => {
        db.query('UPDATE transaksi set ? WHERE id = ?', [data, id], callback);
    },
    delete: (id, callback) => {
        db.query('delete from transaksi WHERE id = ?', [id], callback);
    },

};

module.exports = Transaksi;
