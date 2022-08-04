const express = require('express')
const router = express()
const userController = require("./controllers/userController")
const postController = require("./controllers/postController")

// user related routes
router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

// post realated routes
router.get('/create-post', userController.checkLoginSession, postController.viewCreateScreen)
router.post('/create-post', userController.checkLoginSession, postController.create)

module.exports = router