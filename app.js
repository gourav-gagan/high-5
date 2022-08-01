const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const app = express()

let sessionConfig = session({
    secret: "this is a secret",
    store: MongoStore.create({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie : {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
})

const router = require('./router')

app.use(sessionConfig)
app.use(flash())

app.use(express.static('public')) //import our public folder for static files

app.use(express.urlencoded({extended: false})) //tell express to accept html form submits
app.use(express.json()) //tell express to accept json data

app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)

module.exports = app