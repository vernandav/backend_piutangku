const express = require('express');
const router = express.Router();
const Transaksi = require('../model/TransaksiModel');
const verify = require('../config/middleware/jwt')
const Cicilan = require('../model/CicilanModel');
const fs = require('fs');
const path = require('path');

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number);
}
// Ambil semua transaksi milik user
router.get('/', verify, (req, res) => {
    const id = req.user.id;
    const nama = req.user.nama
    Transaksi.getAllByUserDashboard(id, (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal ambil data transaksi' });
        const formatted = result.map(row => ({
            id: row.id,
            tipe: row.tipe,
            nama_lawan: row.nama_lawan,
            tanggal_mulai: row.tanggal_mulai,
            tanggal_jatuh_tempo: row.tanggal_jatuh_tempo,
            target_pelunasan_bulan: row.target_pelunasan_bulan,
            status: row.status,
            total: formatRupiah(row.total),
            jumlah_cicilan: formatRupiah(row.jumlah_cicilan),
            sisa_cicilan: formatRupiah(row.total - row.jumlah_cicilan)
        }));
        Transaksi.countSummaryByUser(id, (err2, summary) => {
            if (err2) return res.status(500).json({ message: 'Gagal ambil data summary' });
            res.json({
                nama: nama,
                summary: summary,
                data: formatted,
            });
        });
    });
});
router.get('/edit/:id', verify, (req, res) => {
    const id = req.params.id;
    Transaksi.getById(id, (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal ambil data transaksi' });
        const formatted = result.map(row => ({
            id: row.id,
            tipe: row.tipe,
            nama_lawan: row.nama_lawan,
            tanggal_mulai: row.tanggal_mulai,
            tanggal_jatuh_tempo: row.tanggal_jatuh_tempo,
            target_pelunasan_bulan: row.target_pelunasan_bulan,
            status: row.status,
            total: formatRupiah(row.total),
            jumlah_cicilan: formatRupiah(row.jumlah_cicilan),
            sisa_cicilan: formatRupiah(row.total - row.jumlah_cicilan)
        }));
        res.json({
                data: formatted,
            });
    });
});

router.get('/riwayat', verify, (req, res) => {
    const id = req.user.id;
    Transaksi.getAllByUser(id, (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal ambil data transaksi' });
        const formatted = result.map(row => ({
            id: row.id,
            tipe: row.tipe,
            nama_lawan: row.nama_lawan,
            tanggal_mulai: row.tanggal_mulai,
            tanggal_jatuh_tempo: row.tanggal_jatuh_tempo,
            target_pelunasan_bulan: row.target_pelunasan_bulan,
            status: row.status,
            total: formatRupiah(row.total),
            jumlah_cicilan: formatRupiah(row.jumlah_cicilan),
            sisa_cicilan: formatRupiah(row.total - row.jumlah_cicilan)
        }));
        res.json({
                data: formatted
        });
    });
});

// Tambah transaksi baru kolom untuk jumlah cicilan ditiadakan saja dalam form
router.post('/store', verify,(req, res) => {
    const {
        tipe,
        nama_lawan,
        total,
        tanggal_mulai,
        target_pelunasan_bulan,
        metode_cicilan,
        tanggal_jatuh_tempo,
        status} = req.body;
    let jumlah_cicilan = 0
    if (
        !tipe || !nama_lawan || !total || !tanggal_mulai ||
        !metode_cicilan || !tanggal_jatuh_tempo
    ) {
        return res.status(400).json({ message: 'Field wajib lengkap' });
    }
    const allowedTipe = ['utang', 'piutang'];
    const allowedMetode = ['per_bulan', 'per_minggu', 'manual'];
    const allowedStatus = ['aktif', 'lunas'];
    if (!allowedTipe.includes(tipe)) {
        return res.status(400).json({ message: 'Tipe tidak valid' });
    }
    if (!allowedMetode.includes(metode_cicilan)) {
        return res.status(400).json({ message: 'Metode cicilan tidak valid' });
    }
    if (status && !allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'Status tidak valid' });
    }
    const data = {
        user_id: req.user.id,
        tipe,
        nama_lawan,
        total,
        tanggal_mulai,
        target_pelunasan_bulan: target_pelunasan_bulan || null,
        metode_cicilan,
        jumlah_cicilan,
        tanggal_jatuh_tempo,
        status: status || 'aktif'
    };
    Transaksi.create(data, (err, result) => {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ message: 'Gagal simpan transaksi', error: err });
        }
        res.status(201).json({ message: 'Transaksi berhasil ditambahkan', id: result.insertId });
    });
});
//jumlah cicilan dan status tidak usah dimasukan ke form karena sudah otomatis 
router.patch('/update/:id', verify,(req, res) => {
    let id = req.params.id
    const {
        tipe,
        nama_lawan,
        total,
        tanggal_mulai,
        target_pelunasan_bulan,
        metode_cicilan,
        tanggal_jatuh_tempo, 
        } = req.body;
    if (
        !tipe || !nama_lawan || !total || !tanggal_mulai ||
        !metode_cicilan || !tanggal_jatuh_tempo
    ) {
        return res.status(400).json({ message: 'Field wajib lengkap' });
    }
    const allowedTipe = ['utang', 'piutang'];
    const allowedMetode = ['per_bulan', 'per_minggu', 'manual'];
    if (!allowedTipe.includes(tipe)) {
        return res.status(400).json({ message: 'Tipe tidak valid' });
    }
    if (!allowedMetode.includes(metode_cicilan)) {
        return res.status(400).json({ message: 'Metode cicilan tidak valid' });
    }
    
    const data = {
        user_id: req.user.id,
        tipe,
        nama_lawan,
        total,
        tanggal_mulai,
        target_pelunasan_bulan: target_pelunasan_bulan || null,
        metode_cicilan,
        tanggal_jatuh_tempo,
    };
    Transaksi.update(id, data, (err, result) => {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ message: 'Gagal simpan transaksi', error: err });
        }
        res.status(201).json({ message: 'Transaksi berhasil ditambahkan'});
    });
});

// Ambil detail transaksi sudah ambil data cicilan juga
router.get('/detail/:id', (req, res) => {
    const transaksiId = req.params.id;
    Transaksi.getById(transaksiId, (err, transaksiResult) => {
        if (err || transaksiResult.length === 0) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
        }
         const formatted = transaksiResult.map(row => ({
            id: row.id,
            tipe: row.tipe,
            nama_lawan: row.nama_lawan,
            tanggal_mulai: row.tanggal_mulai,
            tanggal_jatuh_tempo: row.tanggal_jatuh_tempo,
            target_pelunasan_bulan: row.target_pelunasan_bulan,
            status: row.status,
            total: formatRupiah(row.total),
            jumlah_cicilan: formatRupiah(row.jumlah_cicilan),
            sisa_cicilan: formatRupiah(row.total - row.jumlah_cicilan)
        }));
        Cicilan.getByTransaksi(transaksiId, (err, cicilanResult) => {
            if (err) {
                return res.status(500).json({ message: 'Gagal mengambil cicilan' });
            }
            const formattedCicilan = cicilanResult.map(row => ({
            id: row.id,
            transaksi_id: row.transaksi_id,
            jumlah: formatRupiah(row.jumlah),
            tanggal_bayar: row.tanggal_bayar,
            bukti_transfer_url: row.bukti_transfer_url
        }));
            res.json({
                transaksi: formatted[0],
                cicilan: formattedCicilan
            });
        });
    });
});

// Update status transaksi
router.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    Cicilan.getByTransaksi(id, (err, cicilanList) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal mengambil data cicilan' });
        }
        cicilanList.forEach(cicilan => {
            if (cicilan.bukti_transfer_url) {
                const filePath = path.join(__dirname, '../uploads', cicilan.bukti_transfer_url);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.warn(`Gagal hapus file: ${filePath}`, err.message);
                    }
                });
            }
        });
        Transaksi.delete(id, (err) => {
            if (err) return res.status(500).json({ message: 'Gagal hapus transaksi dari database' });
            res.json({ message: 'Transaksi dan gambar terkait berhasil dihapus' });
        });
    });
});


module.exports = router;
