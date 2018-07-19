const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const { formatBlog, formatUser } = require('../utils/format')

const blogsInDb = async () => {
  const blogs = await Blog.find({}).populate('user', { blogs: 0 })
  return JSON.parse(JSON.stringify(blogs.map(formatBlog)))
}

const getAuth = async user => {
  if (!user)
    user = await User.findOne({})
  const { username, _id } = user
  const id = _id.toString()
  const auth = 'Bearer ' + jwt.sign({ username, id: _id }, process.env.SECRET)
  return { id, auth }
}

const getAuthNoId = () =>
  'Bearer ' + jwt.sign({ username: 'juu' }, process.env.SECRET)

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2
  }
]

const initialUsers = [
  {
    username: 'Nonna',
    name: 'Papera',
    password: 'zucchero',
    adult: true
  },
  {
    username: 'Topo',
    name: 'Gigio',
    password: 'caffè',
    adult: false
  },
  {
    username: 'Ame',
    name: 'Lia',
    password: 'latte',
    adult: false
  },
  {
    username: 'Pape',
    name: 'Rino',
    password: 'biscotti',
    adult: false
  },
  {
    username: 'Pippo',
    name: 'Super',
    password: 'cereali',
    adult: true
  },
  {
    username: 'Queen',
    name: 'Dom',
    password: 'fagioli',
    adult: false
  }
]

const newBlog = {
  title: 'Titans',
  author: 'Giant',
  url: 'https://fakefakefake',
  likes: 19
}

const newUser = {
  username: 'root',
  name: 'Supersuper Super',
  password: 'sek',
  adult: false
}

const nonExistingBlogId = async () => {
  const blog = new Blog()
  await blog.save()
  await blog.remove()
  return blog._id.toString()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(formatUser)
}

module.exports = { blogsInDb, getAuth, getAuthNoId, initialBlogs,
  initialUsers, newBlog, newUser, nonExistingBlogId, usersInDb }
