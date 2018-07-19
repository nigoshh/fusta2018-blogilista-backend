const mongoose = require('mongoose')

const Schema = mongoose.Schema
const blogSchema = new Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  comments: Array,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogList-User' }
})

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
