const express = require('express')
const app = express()
const router = require('./router')

app.use(express.static('public')) //import our public folder for static files

app.use(express.urlencoded({extended: false})) //tell express to accept html form submits
app.use(express.json()) //tell express to accept json data

app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)

module.exports = app