const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const { formatBlog } = require('../utils/format')

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('user', { blogs: 0 })
  res.json(blogs.map(formatBlog))
})

blogsRouter.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('user', { blogs: 0 })
    if (blog)
      res.json(formatBlog(blog))
    else
      res.status(404).end()
  } catch (e) {
    res.status(400).json({ error: 'malformatted id' })
  }
})

blogsRouter.post('/', async (req, res) => {
  try {
    const { token } = req
    if (!token)
      return res.status(401).json({ error: 'token missing' })
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id)
      return res.status(401).json({ error: 'invalid token' })
    const { title, author, url, likes } = req.body
    let error = ''
    if (!title)
      error += 'title missing'
    if (!url)
      error = append(error, 'url missing')
    if (error)
      return res.status(400).json({ error })
    const user = await User.findById(decodedToken.id)
    const blog = { title, author, url, likes: likes || 0, user: user._id }
    const blogDoc = new Blog(blog)
    await blogDoc.save()
    await blogDoc.populate('user', { blogs: 0 }).execPopulate()
    const savedBlog = blogDoc.toObject()
    user.blogs.push(savedBlog._id)
    await user.save()
    res.status(201).json(formatBlog(savedBlog))
  } catch(e) {
    if (e.name === 'JsonWebTokenError')
      res.status(401).json({ error: e.message })
    else {
      console.log(e)
      res.status(500).json({ error: '500 server error' })
    }
  }
})

blogsRouter.post('/:id/comments', async (req, res) => {
  try {
    const id = req.params.id
    const blog = await Blog.findById(id)
    if (!blog)
      return res.status(404).send({ error: 'that blog was removed' })
    blog.comments.push(req.body.comment)
    const updatedBlog = await Blog
      .findByIdAndUpdate(id, blog, { new: true })
    if (updatedBlog)
      res.status(201).json(updatedBlog.comments)
    else
      res.status(404).send({ error: 'that blog was removed' })
  } catch(e) {
    if (e.name === 'CastError')
      res.status(400).json({ error: 'malformatted id' })
    else {
      console.log(e)
      res.status(500).json({ error: '500 server error' })
    }
  }
})

blogsRouter.put('/:id', async (req, res) => {
  try {
    const { title, author, url, likes } = req.body
    const id = req.params.id
    let error = ''
    if (!title)
      error += 'title missing'
    if (!url)
      error = append(error, 'url missing')
    if (!likes)
      error = append(error, 'likes missing')
    if (error)
      return res.status(400).json({ error })
    const blog = { title, author, url, likes }
    const updatedBlog = await Blog
      .findByIdAndUpdate(id, blog, { new: true }).populate('user', { blogs: 0 })
    if (updatedBlog)
      res.json(formatBlog(updatedBlog))
    else
      res.status(404).send({ error: `"${title}" was deleted` })
  } catch (e) {
    if (e.name === 'CastError')
      res.status(400).json({ error: 'malformatted id' })
    else {
      console.log(e)
      res.status(500).json({ error: '500 server error' })
    }
  }
})

blogsRouter.delete('/:id', async (req, res) => {
  try {
    const { token } = req
    if (!token)
      return res.status(401).json({ error: 'token missing' })
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id)
      return res.status(401).json({ error: 'invalid token (no id)' })
    const blog = await Blog.findById(req.params.id)
    if (!blog)
      return res.status(404).end()
    if (!blog.user || blog.user.toString() === decodedToken.id.toString()) {
      const removedBlog = await Blog.findByIdAndRemove(req.params.id)
      if (removedBlog)
        res.status(204).end()
      else
        res.status(404).end()
    } else
      res.status(401).json({ error: 'invalid token (unauthorized user)' })
  } catch (e) {
    if (e.name === 'CastError')
      res.status(400).json({ error: 'malformatted id' })
    else if (e.name === 'JsonWebTokenError')
      res.status(401).json({ error: e.message })
    else {
      console.log(e)
      res.status(500).json({ error: '500 server error' })
    }
  }
})

const append = (str1, str2) => str1 ? (str1+', '+str2) : str2

module.exports = blogsRouter
