const config = require('./utils/config')
const express = require('express')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')
const app = express()

mongoose
  .connect(config.mongoUrl)
  .then(() => console.log('connected to database', config.mongoUrl))
  .catch(error => console.log(error))

app.use(require('cors')())
app.use(require('body-parser').json())
app.use(express.static('build'))

app.use(middleware.logger)
app.use(middleware.tokenExtractor)
app.use('/api/blogs', require('./controllers/blogs'))
app.use('/api/login', require('./controllers/login'))
app.use('/api/users', require('./controllers/users'))
app.use(middleware.error)

const server = require('http').createServer(app)
const PORT = config.port
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
server.on('close', () => mongoose.connection.close())

module.exports = { app, server }
