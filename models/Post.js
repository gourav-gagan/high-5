const postsCollection = require('../db').db().collection("posts")
const ObjectId = require('mongoose').Types.ObjectId
const User = require('./User')

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

Post.reusablePostQuery = function(uniqueOperations, visitorId){
    return new Promise(async function(resolve, reject) {
        let aggOperations = uniqueOperations.concat([
            {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
            {$project: {
                title: 1,
                body: 1,
                createdDate: 1,
                authorId: "$author",
                author: {$arrayElemAt: ["$authorDocument", 0]}
            }}
        ])

        let posts = await postsCollection.aggregate(aggOperations).toArray()

        // clean up author property in each post object
        posts = posts.map(function(post) {
            post.isVisitorOwner = post.authorId.equals(visitorId)
            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }

            return post
        })

        resolve(posts)
    })
}

Post.findSinglePostById = function(id, visitorId){
    return new Promise(async function(resolve, reject) {
        if (typeof(id)!="string" || !ObjectId.isValid(id)) {
            reject()
            return
        }
        
        let posts = await Post.reusablePostQuery([
            {$match: {_id: new ObjectId(id)}}
        ], visitorId)

        if (posts.length) {
            resolve(posts[0])
        } else {
            reject()
        }
    })
}

Post.findPostsByAuthorId = function(authorId) {
    return Post.reusablePostQuery([
        {$match: {author: authorId}},
        {$sort: {createdDate: -1}} //for descending order
    ])
}

module.exports = Post