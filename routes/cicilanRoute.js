const express = require('express');
const router = express.Router();
const Cicilan = require('../model/CicilanModel');
const fs = require('fs');
const path = require('path');
const upload = require('../config/middleware/multer')
const verify = require('../config/middleware/jwt')


// Tambah cicilan
    router.post('/store/:idTransaksi', verify, upload.single('bukti_transfer_url'), (req, res) => {
        const { jumlah, tanggal_bayar } = req.body;
        const transaksi_id = req.params.idTransaksi;
        if (!jumlah || !tanggal_bayar || !req.file) {
            return res.status(400).json({ message: 'Jumlah, tanggal bayar, dan bukti transfer wajib diisi' });
        }
        const data = {
            jumlah,
            tanggal_bayar,
            transaksi_id,
            bukti_transfer_url: req.file.filename
        };
        Cicilan.add(data, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Gagal tambah cicilan, sudah lunas, atau melebihi batas' });
            }
            res.status(201).json({ message: 'Cicilan berhasil ditambahkan' });
        });
    });

router.delete('/delete/:id', verify,(req, res) => {
    const id = req.params.id;
    Cicilan.getById(id, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil data cicilan' });
        if (rows.length === 0) return res.status(404).json({ message: 'Cicilan tidak ditemukan' });

        const cicilan = rows[0];
        const filePath = path.join(__dirname, '..', 'uploads', cicilan.bukti_transfer_url);

        Cicilan.delete(id, (err2, result) => {
            if (err2) return res.status(500).json({ message: 'Gagal menghapus cicilan' });

            if (cicilan.bukti_transfer_url && fs.existsSync(filePath)) {
                fs.unlink(filePath, (err3) => {
                    if (err3) console.error('Gagal hapus file:', err3);
                });
            }

            res.status(200).json({ message: 'Cicilan dan file berhasil dihapus' });
        });
    });
});

module.exports = router;
