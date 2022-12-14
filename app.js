const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const markdown = require('marked')
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

app.use(function(req, res, next) {
    //make our markdown function available withing ejs templates
    res.locals.filterUserHTML = function (content) {
        return markdown.parse(content)
    }

    // make all error/success flash messages available to all templates
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")

    // make current user id available on the req object
    if (req.session.user) {req.visitorId = req.session.user._id} else {req.visitorId=0}

    // make user session data available from within view templates
    res.locals.user = req.session.user
    next()
})

app.use(express.static('public')) //import our public folder for static files

app.use(express.urlencoded({extended: false})) //tell express to accept html form submits
app.use(express.json()) //tell express to accept json data

app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)

module.exports = app