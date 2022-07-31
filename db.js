const dotenv = require('dotenv')
dotenv.config()
const mongodb = require('mongodb')
const mongoose = require('mongoose')

const connectionString = process.env.CONNECTIONSTRING
port = process.env.PORT

mongoose.connect(connectionString, (err) => {
    if (err) throw err
        module.exports = mongoose.connection.db
        const app = require('./app')
        app.listen(port)
    })