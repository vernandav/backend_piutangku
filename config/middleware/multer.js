const multer = require('multer')
const path = require('path');
const fs = require('fs')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Format file tidak diperbolehkan! Hanya gambar (JPEG, PNG, WEBP).'), false);
    }

    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
    fileFilter: fileFilter
});

module.exports = upload