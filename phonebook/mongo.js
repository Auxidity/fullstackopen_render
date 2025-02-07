const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url =`mongodb+srv://auxidity:${password}@cluster0.dwrzw.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)
mongoose.connect(url)

if (process.argv.length > 3 && process.argv.length < 5) {
    console.log('You must give name and number arguments')
    process.exit(1)
}

const personSchema = new mongoose.Schema({
  name: String,
  number: String, //While int makes more sense, so far the numbers have been stored as Strings.
})
const Persons = mongoose.model('Persons', personSchema)

if (process.argv.length === 5) {
    const name = process.argv[3]
    const number = process.argv[4]


    const person = new Persons({
      name: name,
      number: number,
    })

    person.save().then(result => {
      console.log(`added ${name} number ${number} to phonebook`)
      mongoose.connection.close()
    })


} else {
    Persons.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })

}

