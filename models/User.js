const bcrypt = require('bcryptjs')
const validator = require('validator')
const md5 = require('md5')
const usersCollection = require('../db').db().collection("users")

let User = function(data, getAvatar) {
    this.data = data
    this.errors = []
    if (getAvatar == undefined) {getAvatar = false}
    if (getAvatar) {this.getAvatar()}
}

User.prototype.cleanUp = function() {
    if (typeof(this.data.username) != 'string') {this.data.username = ""}
    if (typeof(this.data.email) != 'string') {this.data.email = ""}
    if (typeof(this.data.password) != 'string') {this.data.password = ""}

    // purify unwanted inputs
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}

User.prototype.validate = function() {
    return new Promise(async (resolve, reject) => {

        if (this.data.username == ""){this.errors.push("You must provide a username!")}
        else if (this.data.username.length > 0 && this.data.username.length < 3) {this.errors.push("Username should be atleast 3 characters!")}
        else if (!validator.isAlphanumeric(this.data.username)) {this.errors.push("Username can only contain letters and numbers!")}
        else if (this.data.username.length > 30) {this.errors.push("Username cannot exceed 30 characters!")}
        else {
            let usernameExists = await usersCollection.findOne({username: this.data.username})
            if (usernameExists) {this.errors.push("Username alrady taken.")}
        }
    
        if (!validator.isEmail(this.data.email)){this.errors.push("You must provide a valid email address!")}
        else  {
            let emailExists = await usersCollection.findOne({email: this.data.email})
            if (emailExists) {this.errors.push("That email already being used.")}
        }
    
        if (this.data.password == ""){this.errors.push("You must provide a password!")}
        else if (this.data.password.length > 0 && this.data.password.length < 8) {this.errors.push("Password should be atleast 8 characters!")}
        else if (this.data.password.length > 50) {this.errors.push("Password cannot exceed 50 characters!")}

        resolve()
    })
}

User.prototype.login = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        usersCollection.findOne({username: this.data.username}).then((attemptedUser) => {
            if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
                this.data = attemptedUser
                this.getAvatar()
                resolve("Logged in!")
            } else {
                reject('Invalid Username or Password!')
            }
        }).catch(() => {
            reject("Please try again later...")
        })
    })
}

User.prototype.register = function() {
    return new Promise(async (resolve, reject) => {
        // validate data
        this.cleanUp()
        await this.validate()
        
        //iff no validation error save user data into database
        if (!this.errors.length) {
            //hash user password
            let salt = bcrypt.genSaltSync(10)
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            await usersCollection.insertOne(this.data)
            this.getAvatar()
            resolve()
        } else {
            reject(this.errors)
        }
    })
}

User.prototype.getAvatar = function() {
    this.avatar = `https://robohash.org/${md5(this.data.email)}`
}

module.exports = User