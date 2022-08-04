const postsCollection = require('../db').db().collection("posts")
const ObjectId = require('mongoose').Types.ObjectId

let Post = function(data, userid) {
    this.data = data
    this.errors = []
    this.data.userID = userid
}

Post.prototype.cleanUp = function() {
    if (typeof(this.data.title)!="string") {this.data.title = ""}
    if (typeof(this.data.body)!="string") {this.data.body = ""}

    // get rid of unwanted inputs
    this.data = {
        title: this.data.title.trim(), // trim to ignore empty spaces start and end of title
        body: this.data.body.trim(),
        createdDate: new Date(),
        author: ObjectId(this.data.userID)
    }
}

Post.prototype.validate = function() {
    if (this.data.title=="") {this.errors.push("You must provide a Title")}
    if (this.data.body=="") {this.errors.push("You must provide some post content.")}
}

Post.prototype.create = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (!this.errors.length) {
            //save post in database
            postsCollection.insertOne(this.data).then(() => {
                resolve()
            }).catch(() => {
                this.errors.push("Please try again later...")
                reject(this.errors)
            })
        }
        else {
            reject(this.errors)
        }
    })
}

module.exports = Post