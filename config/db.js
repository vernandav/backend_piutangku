let mysql = require("mysql");
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pencatatan',
});

connection.connect(function(error){
    if(!error){
        console.log('Connection Success');
    } else {
        console.log(error);
    }
});

module.exports = connection;