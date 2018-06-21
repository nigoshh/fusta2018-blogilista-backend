const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { formatBlog } = require('../utils/format')
const { blogsInDb, getAuth, initialBlogs, initialUsers, newBlog, newUser,
  nonExistingBlogId, nonExistingUserId, usersInDb } = require('./test_helper')

describe('retrieving blogs from database', async () => {

  beforeAll(async () => {
    await Blog.remove({})
    const blogObjects = initialBlogs.map(b => new Blog(b))
    const promiseArray = blogObjects.map(b => b.save())
    await Promise.all(promiseArray)
  })

  test('all blogs are returned as json by GET', async () => {
    const blogsInDatabase = await blogsInDb()
    const res = await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(res.body).toEqual(blogsInDatabase)
  })

  test('individual blogs are returned as json by GET', async () => {
    const blogsInDatabase = await blogsInDb()
    const aBlog = blogsInDatabase[0]
    const res = await api.get(`/api/blogs/${aBlog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(res.body).toEqual(aBlog)
  })

  test('404 is returned by GET with nonexisting valid id', async () => {
    const validNonexistingId = await nonExistingBlogId()
    await api.get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('400 is returned by GET with invalid id', async () =>
    await api.get('/api/blogs/5')
      .expect(400)
  )
})

describe('addition of a new blog', async () => {

  beforeAll(async () => {
    await User.remove({})
    const user = await User.hashPassword(newUser)
    await new User(user).save()
  })

  test('POST succeeds (201) with valid data and token', async () => {
    const blogsBeforeOp = await blogsInDb()
    const blog = { ...newBlog }
    const { auth } = await getAuth()
    const res = await api
      .post('/api/blogs').set('Authorization', auth).send(blog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    blog.id = res.body.id
    blog.user = res.body.user
    expect(res.body).toEqual(blog)
    const blogsAfterOp = await blogsInDb()
    expect(blogsAfterOp.length).toBe(blogsBeforeOp.length + 1)
    expect(blogsBeforeOp).not.toContainEqual(blog)
    expect(blogsAfterOp).toContainEqual(blog)
    await Blog.findByIdAndRemove(blog.id)
  })

  test('if likes is undefined, it gets a default value of zero', async () => {
    const blogsBeforeOp = await blogsInDb()
    const blog = {
      title: newBlog.title,
      author: newBlog.author,
      url: newBlog.url
    }
    const { auth } = await getAuth()
    const res = await api
      .post('/api/blogs').set('Authorization', auth).send(blog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    blog.id = res.body.id
    blog.user = res.body.user
    blog.likes = 0
    expect(res.body).toEqual(blog)
    const blogsAfterOp = await blogsInDb()
    expect(blogsAfterOp.length).toBe(blogsBeforeOp.length + 1)
    expect(blogsBeforeOp).not.toContainEqual(blog)
    expect(blogsAfterOp).toContainEqual(blog)
    await Blog.findByIdAndRemove(blog.id)
  })

  test('POST fails (400) if title or url are undefined', async () => {
    const blogsBeforeOp = await blogsInDb()
    const blogBadReqs = [{ author: newBlog.author, likes: newBlog.likes }]
    blogBadReqs.push({ ...blogBadReqs[0], title: newBlog.title })
    blogBadReqs.push({ ...blogBadReqs[0], url: newBlog.url })
    const { auth } = await getAuth()
    for (let blogBadReq of blogBadReqs) {
      await api.post('/api/blogs').set('Authorization', auth).send(blogBadReq)
        .expect(400)
    }
    const blogsAfterOp = await blogsInDb()
    expect(blogsAfterOp).toEqual(blogsBeforeOp)
  })
})

describe('updating a blog', async () => {

  test('PUT with valid data updates (200) blog that was already in database', async () => {
    let blogToUpdate = await new Blog(newBlog).save()
    blogToUpdate = formatBlog(blogToUpdate)
    const blogsBeforeOp = await blogsInDb()
    expect(blogsBeforeOp).toContainEqual(blogToUpdate)
    blogToUpdate.likes++
    const res = await api.put(`/api/blogs/${blogToUpdate.id}`).send(blogToUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(res.body).toEqual(blogToUpdate)
    const blogsAfterOp = await blogsInDb()
    expect(blogsBeforeOp).not.toContainEqual(blogToUpdate)
    expect(blogsAfterOp).toContainEqual(blogToUpdate)
    expect(blogsAfterOp.length).toBe(blogsBeforeOp.length)
    await Blog.findByIdAndRemove(blogToUpdate.id)
  })

  test('PUT with valid data creates (201) blog that wasn\'t in database', async () => {
    const validNonexistingId = await nonExistingBlogId()
    const blogToUpdate = { ...newBlog, id: validNonexistingId }
    const blogsBeforeOp = await blogsInDb()
    expect(blogsBeforeOp).not.toContainEqual(blogToUpdate)
    const res = await api.put(`/api/blogs/${blogToUpdate.id}`).send(blogToUpdate)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    blogToUpdate.id = res.body.id
    expect(res.body).toEqual(blogToUpdate)
    const blogsAfterOp = await blogsInDb()
    expect(blogsBeforeOp).not.toContainEqual(blogToUpdate)
    expect(blogsAfterOp).toContainEqual(blogToUpdate)
    expect(blogsAfterOp.length).toBe(blogsBeforeOp.length + 1)
    await Blog.findByIdAndRemove(blogToUpdate.id)
  })

  test('400 is returned by PUT with valid data but invalid id', async () => {
    const blogsBeforeOp = await blogsInDb()
    await api.put('/api/blogs/5').send({ ...newBlog, id: 5 })
      .expect(400)
    const blogsAfterOp = await blogsInDb()
    expect(blogsAfterOp).toEqual(blogsBeforeOp)
  })

  test('400 is returned by PUT with invalid data', async () => {
    let blogToUpdate = await new Blog(newBlog).save()
    blogToUpdate = formatBlog(blogToUpdate)
    const blogsBeforeOp = await blogsInDb()
    expect(blogsBeforeOp).toContainEqual(blogToUpdate)
    blogToUpdate.likes++
    const blogBadReqs = [{ author: blogToUpdate.author, id: blogToUpdate.id }]
    blogBadReqs.push({ ...blogBadReqs[0], title: blogToUpdate.title })
    blogBadReqs.push({ ...blogBadReqs[0], url: blogToUpdate.url })
    blogBadReqs.push({ ...blogBadReqs[0], likes: blogToUpdate.likes })
    blogBadReqs.push({ ...blogBadReqs[1], url: blogToUpdate.url })
    blogBadReqs.push({ ...blogBadReqs[1], likes: blogToUpdate.likes })
    blogBadReqs.push({ ...blogBadReqs[2], likes: blogToUpdate.likes })
    for (let blogBadReq of blogBadReqs) {
      await api.put(`/api/blogs/${blogBadReq.id}`).send(blogBadReq)
        .expect(400)
    }
    const blogsAfterOp = await blogsInDb()
    expect(blogsAfterOp).toEqual(blogsBeforeOp)
    await Blog.findByIdAndRemove(blogToUpdate.id)
  })
})

describe('deletion of a blog', async () => {

  beforeAll(async () => {
    await User.remove({})
    const user = await User.hashPassword(newUser)
    await new User(user).save()
  })

  test('DELETE succeeds (204) with correct token if blog was in database', async () => {
    const { auth, id } = await getAuth()
    const blog = { ...newBlog, user: id }
    let addedBlog = await new Blog(blog).save()
    addedBlog = formatBlog(addedBlog)
    const blogsBeforeOp = await blogsInDb()
    expect(blogsBeforeOp).toContainEqual(addedBlog)
    await api.delete(`/api/blogs/${addedBlog.id}`).set('Authorization', auth)
      .expect(204)
    const blogsAfterOp = await blogsInDb()
    expect(blogsAfterOp).not.toContainEqual(addedBlog)
    expect(blogsAfterOp.length).toBe(blogsBeforeOp.length - 1)
  })

  test('DELETE returns 404 if blog wasn\'t in database', async () => {
    const blogsBeforeOp = await blogsInDb()
    const validNonexistingId = await nonExistingBlogId()
    const { auth } = await getAuth()
    await api
      .delete(`/api/blogs/${validNonexistingId}`).set('Authorization', auth)
      .expect(404)
    const blogsAfterOp = await blogsInDb()
    expect(blogsAfterOp).toEqual(blogsBeforeOp)
  })

  test('400 is returned by DELETE with invalid id', async () => {
    const blogsBeforeOp = await blogsInDb()
    const { auth } = await getAuth()
    await api.delete('/api/blogs/5').set('Authorization', auth)
      .expect(400)
    const blogsAfterOp = await blogsInDb()
    expect(blogsAfterOp).toEqual(blogsBeforeOp)
  })
})

describe('retrieving users from database and login', async () => {

  beforeAll(async () => {
    await User.remove({})
    const users = await Promise.all(initialUsers.map(u => User.hashPassword(u)))
    await Promise.all(users.map(u => new User(u).save()))
  })

  test('all users are returned as json by GET', async () => {
    const usersInDatabase = await usersInDb()
    const res = await api.get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(res.body).toEqual(usersInDatabase)
  })

  test('login succeeds with correct username and password', async () => {
    const { username, password } = initialUsers[0]
    const res = await api.post('/api/login').send({ username, password })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(res.body.name).toBe(initialUsers[0].name)
    expect(res.body.token).toBeDefined()
  })

  test('login fails (401) with wrong credentials', async () => {
    const { username } = initialUsers[0]
    const { password } = initialUsers[1]
    const wrongCreds = [{ username, password }]
    wrongCreds.push({ username: 'fake', password: 'fake' })
    for (let wrongCred of wrongCreds) {
      const res = await api.post('/api/login').send(wrongCred)
        .expect(401)
        .expect('Content-Type', /application\/json/)
      expect(res.body.token).toBeUndefined()
    }
  })
})

describe('creating a new user', async () => {

  beforeAll(async () => {
    await User.remove({})
    const user = await User.hashPassword(newUser)
    await new User(user).save()
  })

  test('POST succeeds with unique username and valid password', async () => {
    const usersBeforeOp = await usersInDb()
    const username = 'Jekill'
    expect(usersBeforeOp.map(u => u.username)).not.toContain(username)
    const user = { ...newUser, username }
    const res = await api.post('/api/users').send(user)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    user.id = res.body.id
    user.blogs = res.body.blogs
    delete user.password
    expect(res.body).toEqual(user)
    const usersAfterOp = await usersInDb()
    expect(usersAfterOp.length).toBe(usersBeforeOp.length + 1)
    expect(usersBeforeOp).not.toContainEqual(user)
    expect(usersAfterOp).toContainEqual(user)
    await User.findByIdAndRemove(user.id)
  })

  test('POST: if adult is undefined, it is assigned value true', async () => {
    const usersBeforeOp = await usersInDb()
    const username = 'adult'
    expect(usersBeforeOp.map(u => u.username)).not.toContain(username)
    const { name, password } = newUser
    const user = { username, name, password }
    const res = await api.post('/api/users').send(user)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    expect(res.body.adult).toBe(true)
    user.adult = true
    user.id = res.body.id
    user.blogs = res.body.blogs
    delete user.password
    expect(res.body).toEqual(user)
    const usersAfterOp = await usersInDb()
    expect(usersAfterOp.length).toBe(usersBeforeOp.length + 1)
    expect(usersBeforeOp).not.toContainEqual(user)
    expect(usersAfterOp).toContainEqual(user)
    await User.findByIdAndRemove(user.id)
  })

  test('POST fails (400) with error message if username is already taken', async () => {
    const usersBeforeOp = await usersInDb()
    let { username, name, password, adult } = newUser
    expect(usersBeforeOp.map(u => u.username)).toContain(username)
    name += 'mod'
    password += 'ified'
    adult = !adult
    const user = { username, name, password, adult }
    const res = await api.post('/api/users').send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    expect(res.body.error).toContain('username must be unique')
    const usersAfterOp = await usersInDb()
    expect(usersAfterOp).toEqual(usersBeforeOp)
  })

  test('POST fails (400) with error message if password is too short', async () => {
    const usersBeforeOp = await usersInDb()
    const { name, adult } = newUser
    const username = 'pw'
    expect(usersBeforeOp.map(u => u.username)).not.toContain(username)
    const user = { username, name, password: '2c', adult }
    const res = await api.post('/api/users').send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    expect(res.body.error).toContain('password must be at least 3 characters long')
    const usersAfterOp = await usersInDb()
    expect(usersAfterOp).toEqual(usersBeforeOp)
  })
})

afterAll(() => server.close())
