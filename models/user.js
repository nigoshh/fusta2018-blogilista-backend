const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  adult: Boolean,
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }]
})

userSchema.statics.hashPassword = async ({ username, name, password, adult }) => {
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  return { username, name, passwordHash, adult }
}

const User = mongoose.model('BlogList-User', userSchema)

module.exports = User
