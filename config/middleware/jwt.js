var jwt = require('jsonwebtoken')

function verify(req, res, next){
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if(!token) return res.status(403).json('Tidak ada token')
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
        if(err) return res.status(403).json('Token kadaluarsa')

        req.user = decoded
        next()
    })
}

module.exports = verify