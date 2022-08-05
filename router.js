const express = require('express')
const router = express()
const userController = require("./controllers/userController")
const postController = require("./controllers/postController")

// user related routes
router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

// profile related routes
router.get('/profile/:username', userController.ifUserExists, userController.profilePostsScreen)

// post realated routes
router.get('/create-post', userController.checkLoginSession, postController.viewCreateScreen)
router.post('/create-post', userController.checkLoginSession, postController.create)
router.get('/post/:id', postController.viewSinglePost)
router.get('/post/:id/edit', postController.viewEditScreen)
router.post('/post/:id/edit', postController.edit)

module.exports = router