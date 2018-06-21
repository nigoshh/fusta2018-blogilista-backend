const formatBlog = ({ _id, user, title, author, url, likes }) => {
  if (user) {
    if (user.username)
      user = formatUser(user)
    else
      user = user.toString()
  }
  return { id: _id.toString(), user, title, author, url, likes }
}

const formatUser = ({ _id, username, name, adult, blogs }) => {
  if (blogs) {
    if (blogs.find(b => b.url))
      blogs = blogs.map(formatBlog)
    else
      blogs = blogs.map(b => b.toString())
  }
  return { id: _id.toString(), username, name, adult, blogs }
}

module.exports = { formatBlog, formatUser }
