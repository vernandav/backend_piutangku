const db = require('../config/db');

const User = {
    getByEmail: (email, callback) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], callback);
    },

    regis: (data, callback) => {
        db.query('INSERT INTO users SET ?', [data], callback);
    }
};

module.exports = User;
