const bcrypt = require('bcryptjs')
const validator = require('validator')
const usersCollection = require('../db').db().collection("users")

let User = function(data) {
    this.formData = data
    this.errors = []
}

User.prototype.cleanUp = function() {
    if (typeof(this.formData.username) != 'string') {this.formData.username = ""}
    if (typeof(this.formData.email) != 'string') {this.formData.email = ""}
    if (typeof(this.formData.password) != 'string') {this.formData.password = ""}

    // purify unwanted inputs
    this.formData = {
        username: this.formData.username.trim().toLowerCase(),
        email: this.formData.email.trim().toLowerCase(),
        password: this.formData.password
    }
}

User.prototype.validate = function() {
    return new Promise(async (resolve, reject) => {

        if (this.formData.username == ""){this.errors.push("You must provide a username!")}
        else if (this.formData.username.length > 0 && this.formData.username.length < 3) {this.errors.push("Username should be atleast 3 characters!")}
        else if (!validator.isAlphanumeric(this.formData.username)) {this.errors.push("Username can only contain letters and numbers!")}
        else if (this.formData.username.length > 30) {this.errors.push("Username cannot exceed 30 characters!")}
        else {
            let usernameExists = await usersCollection.findOne({username: this.formData.username})
            if (usernameExists) {this.errors.push("Username alrady taken.")}
        }
    
        if (!validator.isEmail(this.formData.email)){this.errors.push("You must provide a valid email address!")}
        else  {
            let emailExists = await usersCollection.findOne({email: this.formData.email})
            if (emailExists) {this.errors.push("That email already being used.")}
        }
    
        if (this.formData.password == ""){this.errors.push("You must provide a password!")}
        else if (this.formData.password.length > 0 && this.formData.password.length < 8) {this.errors.push("Password should be atleast 8 characters!")}
        else if (this.formData.password.length > 50) {this.errors.push("Password cannot exceed 50 characters!")}

        resolve()
    })
}

User.prototype.login = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        usersCollection.findOne({username: this.formData.username}).then((attemptedUser) => {
            if (attemptedUser && bcrypt.compareSync(this.formData.password, attemptedUser.password)) {
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
            this.formData.password = bcrypt.hashSync(this.formData.password, salt)
            await usersCollection.insertOne(this.formData)
            resolve()
        } else {
            reject(this.errors)
        }
    })
}

module.exports = User