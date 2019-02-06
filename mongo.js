const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1)
}


const password = process.argv[2]

const url =
  `mongodb://admin:${password}@ds125125.mlab.com:25125/fullstack2019-phonebook`

mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: Number
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person);

    })
    mongoose.connection.close()
  })

} else {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })
  person.save().then(res => {
    console.log(person);
    console.log('person saved');
    mongoose.connection.close()
  })
}


