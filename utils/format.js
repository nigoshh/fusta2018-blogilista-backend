const formatBlog = ({ _id, user, title, author, url, likes, comments }) => {
  let rest = { title, author, url, likes, comments }
  if (user) {
    if (user.username)
      user = formatUser(user)
    else
      user = user.toString()
    rest.user = user
  }
  return { id: _id.toString(), ...rest }
}

const formatUser = ({ _id, username, name, adult, blogs }) => {
  let rest = { adult, username, name }
  if (blogs) {
    if (blogs.find(b => b.url))
      blogs = blogs.map(formatBlog)
    else
      blogs = blogs.map(b => b.toString())
    rest.blogs = blogs
  }
  return { id: _id.toString(), ...rest }
}

module.exports = { formatBlog, formatUser }
