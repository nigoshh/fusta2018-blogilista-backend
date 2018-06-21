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
    if (blog)
      res.json(formatBlog(blog))
    else
      res.status(404).end()
  } catch (e) {
    res.status(400).send({ error: 'malformatted id' })
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
    const savedBlog = await new Blog(blog).save()
    user.blogs.push(savedBlog._id)
    await user.save()
    res.status(201).json(formatBlog(savedBlog))
  } catch(e) {
    if (e.name === 'JsonWebTokenError')
      res.status(401).json({ error: e.message })
    else {
      console.log(e)
      res.status(500).json({ error: e })
    }
  }
})

blogsRouter.put('/:id', async (req, res) => {
  try {
    const { title, author, url, likes } = req.body
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
      .findByIdAndUpdate(req.params.id, blog, { new: true })
    if (updatedBlog)
      res.json(formatBlog(updatedBlog))
    else {
      const savedBlog = await new Blog(blog).save()
      res.status(201).json(formatBlog(savedBlog))
    }
  } catch (e) {
    res.status(400).send({ error: 'malformatted id' })
  }
})

blogsRouter.delete('/:id', async (req, res) => {
  try {
    const { token } = req
    if (!token)
      return res.status(401).json({ error: 'token missing' })
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id)
      return res.status(401).json({ error: 'invalid token' })
    const blog = await Blog.findById(req.params.id)
    if (!blog)
      return res.status(404).end()
    if (blog.user.toString() === decodedToken.id.toString()) {
      const removedBlog = await Blog.findByIdAndRemove(req.params.id)
      if (removedBlog)
        res.status(204).end()
      else
        res.status(404).end()
    } else
      res.status(401).json({ error: 'invalid token' })
  } catch (e) {
    if (e.name === 'CastError')
      res.status(400).send({ error: 'malformatted id' })
    else if (e.name === 'JsonWebTokenError')
      res.status(401).json({ error: e.message })
    else {
      console.log(e)
      res.status(500).json({ error: e })
    }
  }
})

const append = (str1, str2) => str1 ? (str1+', '+str2) : str2

module.exports = blogsRouter
