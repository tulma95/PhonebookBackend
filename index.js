
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(bodyParser.json())

morgan.token('data', (req) => {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.use(cors())

app.get('/info', (req, res) => {
  Person.find({}).then(people => {
    date = new Date()
    res.send(`<p>Puhelinluettelossa on ${people.length} henkilön tiedot</p>
    <p>${date}</p>`)
  })
})

app.get('/api/persons/', (reg, res) => {
  Person.find({}).then(people => {
    res.json(people.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      res.json(person.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.post('/api/persons/', (req, res, next) => {
  const body = req.body

  /*if (persons.some(person => person.name === body.name)) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }*/

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON())
  }).catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'validationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.message.includes('unique')) {
    return response.status(400).json({ error: error.message })
  } else if (error.message.includes('shorter') || error.message.includes('longer')) {
    return response.status(400).json({ error: error.message })
  } else if (error.message.includes('less') || error.message.includes('more than')) {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is runnin on port ${PORT}`);
})