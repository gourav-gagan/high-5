const validator = require('validator')
const usersCollection = require('../db').collection("users")

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

    if (this.formData.username == ""){this.errors.push("You must provide a username!")}
    else if (this.formData.username.length > 0 && this.formData.username.length < 3) {this.errors.push("Username should be atleast 3 characters!")}
    else if (!validator.isAlphanumeric(this.formData.username)) {this.errors.push("Username can only contain letters and numbers!")}
    else if (this.formData.username.length > 30) {this.errors.push("Username cannot exceed 30 characters!")}

    if (!validator.isEmail(this.formData.email)){this.errors.push("You must provide a valid email address!")}

    if (this.formData.password == ""){this.errors.push("You must provide a password!")}
    else if (this.formData.password.length > 0 && this.formData.password.length < 8) {this.errors.push("Password should be atleast 8 characters!")}
    else if (this.formData.password.length > 100) {this.errors.push("Password cannot exceed 100 characters!")}

}

User.prototype.login = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        usersCollection.findOne({username: this.formData.username}).then((attemptedUser) => {
            if (attemptedUser && attemptedUser.password == this.formData.password) {
                resolve("Logged in!")
            } else {
                reject('Invalid username/password!')
            }
        }).catch(() => {
            reject("Please try again later...")
        })
    })
}

User.prototype.register = function() {
    // validate data
    this.cleanUp()
    this.validate()
    
    //iff no validation error save user data into database
    if (!this.errors.length) {
        usersCollection.insertOne(this.formData)
    }
    //console.log(usersCollection)
}

module.exports = User