const mongodb = require('mongodb')
const mongoose = require('mongoose')

const connectionString = "mongodb+srv://todoAppUser:dbp4ssw0rd@cluster0.hswst.mongodb.net/high5?retryWrites=true&w=majority"

port = 3000

mongoose.connect(connectionString, (err) => {
    if (err) throw err
        module.exports = mongoose.connection.db
        const app = require('./app')
        app.listen(port)
    })

// [depricated]
// mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
//     module.exports = client.db()
//     const app = require('./app')
//     app.listen(3000)
// })