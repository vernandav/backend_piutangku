const express = require('express');
const router = express.Router();
const User = require('../model/UserModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// Registrasi user baru
router.post('/register', async (req, res) => {
    try {
    const { username, email, password } = req.body;
    console.log('Register attempt:', { username, email, password });

    if (!username || !email || !password) {
        console.log('Register gagal: data tidak lengkap');
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const hashing = await bcrypt.hash(password, 10)

    const userData = {
        nama_lengkap: username,
        email,
        password_hash: hashing
    };

    User.regis(userData, (err, result) => {
        if (err) {
            console.log('Gagal melakukan registrasi:', err);
            return res.status(500).json({ error: err });
        }
        res.json({ message: 'User registered' });
    });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: err });
    }
    
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });

    if (!email || !password) {
        console.log('Login gagal: data tidak lengkap');
        return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    User.getByEmail(email, async (err, result) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        if (result.length === 0) {
            console.log('Login gagal: email/password tidak cocok');
            return res.status(401).json({ message: 'Login failed email anda tidak cocok' });
        }

        const user = result[0]
        const match = await bcrypt.compare(password, user.password_hash)
        if(!match) return res.status(401).json({message: 'password salah'})

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                nama: user.nama_lengkap
            }, process.env.JWT_SECRET,
                {expiresIn: '1h'}
        )

        console.log('Login berhasil:', result[0]);
        res.json({ message: 'Login success', user: token, id:user.id, nama: user.nama_lengkap });
    });
});


module.exports = router;
