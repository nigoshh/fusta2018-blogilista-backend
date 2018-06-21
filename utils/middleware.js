const error = (req, res) => res.status(404).send({ error: 'unknown endpoint' })

const logger = (req, res, next) => {
  if (process.env.NODE_ENV === 'test')
    return next()
  console.log('Method:', req.method)
  console.log('Path:  ', req.path)
  console.log('Body:  ', req.body)
  console.log('---')
  next()
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer '))
    req.token = authorization.substring(7)
  else
    req.token = null
  next()
}

module.exports = { error, logger, tokenExtractor }
