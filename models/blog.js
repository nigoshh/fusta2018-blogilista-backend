const mongoose = require('mongoose')

const Schema = mongoose.Schema
const blogSchema = new Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogList-User' }
})

blogSchema.statics.format = ({ _id, user, title, author, url, likes }) =>
  ({ id: _id.toString(), user, title, author, url, likes })

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
