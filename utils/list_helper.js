const { formatBlog } = require('../utils/format')

const dummy = () => 1

const favoriteBlog = blogs =>
  blogs.length === 0 ?
    undefined
    :
    formatBlog(blogs.reduce(
      (fav, blog) => blog.likes > fav.likes ? blog : fav)
    )

const mostBlogs = blogs => {
  if (blogs.length === 0)
    return undefined
  const [ first, ...rest ] = blogs
  const stats = [{ author: first.author, blogs: 1 }]
  if (!rest)
    return stats
  rest.forEach(blog => {
    const authorStats = stats.find(stat => stat.author === blog.author)
    if (authorStats)
      authorStats.blogs++
    else
      stats.push({ author: blog.author, blogs: 1 })
  })
  return stats.reduce((most, stat) => stat.blogs > most.blogs ? stat : most)
}

const mostLikes = blogs => {
  if (blogs.length === 0)
    return undefined
  const [ first, ...rest ] = blogs
  const { author, likes } = first
  const stats = [{ author, likes }]
  if (!rest)
    return stats
  rest.forEach(blog => {
    const authorStats = stats.find(stat => stat.author === blog.author)
    if (authorStats)
      authorStats.likes += blog.likes
    else
      stats.push({ author: blog.author, likes: blog.likes })
  })
  return stats.reduce((most, stat) => stat.likes > most.likes ? stat : most)
}

const totalLikes = blogs => blogs.reduce((sum, blog) => sum + blog.likes, 0)

module.exports = { dummy, favoriteBlog, mostBlogs, mostLikes, totalLikes }
