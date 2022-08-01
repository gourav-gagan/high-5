const User = require('../models/User')

exports.login = (req, res) => {
    let user = new User(req.body)
    user.login().then(function(result) {
        req.session.user = {username: user.formData.username}
        req.session.save(function() {
            res.redirect('/')
        })
    }).catch(function(e) {
        req.flash('errors', e) //adds flash abject to req.user and add key:valuee = errors:e
        req.session.save(function() {
            res.redirect('/')
        })
    })

}

exports.logout = function (req, res) {
    req.session.destroy(function() {
        res.redirect('/')
    })
}

exports.register = (req, res) => {
    let user = new User(req.body)
    user.register()
    if (user.errors.length) {
        // res.send(user.errors)
        user.errors.forEach(function(error) {
            req.flash('regErrors', error)
        })
        req.session.save(function() {
            res.redirect('/')
        })
    } else {
        res.send("Thanks for registering.")
    }
}

exports.home = (req, res) => {
    if (req.session.user) {
        res.render('home-dashboard', {username: req.session.user.username})
    } else {
        res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors') })
    }
}