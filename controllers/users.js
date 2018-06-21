const usersRouter = require('express').Router()
const User = require('../models/user')
const { formatUser } = require('../utils/format')

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs', { user: 0 })
  res.json(users.map(formatUser))
})

usersRouter.post('/', async (req, res) => {
  let error = ''
  try {
    const { username, password } = req.body
    if (!username)
      error = 'username is required'
    else {
      /* this check is redundant because we set a unique index constraint for "username"
      in MongoDB, but this way the user gets all relevant error messages together */
      const existingUser = await User.findOne({ username })
      if (existingUser)
        error = 'username must be unique'
    }
    if (password.length < 3)
      error = append(error, 'password must be at least 3 characters long')
    if (error)
      return res.status(400).json({ error })
    const user = await User.hashPassword(req.body)
    if (user.adult === undefined)
      user.adult = true
    const savedUser = await new User(user).save()
    res.status(201).json(formatUser(savedUser))
  } catch (e) {
    if (e.name === 'MongoError' && e.message.startsWith('E11000')) {
      error = 'username must be unique'
      res.status(400).json({ error })
    }
    else {
      console.log(e)
      error = e
      res.status(500).json({ error })
    }
  }
})

const append = (str1, str2) => str1 ? (str1+', '+str2) : str2

module.exports = usersRouter
