const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

morgan.token('body' , (request) => {
    if (request.method == 'POST' && request.body) {
        return JSON.stringify(request.body);
    }
    return '';
});

app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(express.json())

const maxId = 1000000; //Upper boundary for unique id's. Used for generateId() and returning an error when maxID is reached.

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const generateId = () => { //Recursion depth becomes an issue with large amount of id's when we're almost full on id's. Since uniqueness of the id's wasn't a requirement but instead self imposed, I won't spend more time creating something more robust. (Which would involve some additional steps after reaching certain recursion depth)
    const generateRandom = () => Math.floor(Math.random() * maxId) + 1; //We right shift by one. Math.random() is generating between 0-1 range, but the value of 1 is excluded from the range. This means that if maxId = 4, the possible range isn't 0-4 but 0-3 instead. We wan't the lower end to start from 1 and upper bound to mirror maxId, so right shifting by 1 is neccesary.
    
    const generateUnique = () => {
        const newId = generateRandom().toString();

        if (persons.some(person => person.id === newId)) {
            return generateUnique();
        }

        return newId;
    }

    return String(generateUnique())

}

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'Name or number missing'
        })
    }

    if (persons.some(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'Name already exists in phonebook'
        })
    }

    if (persons.length === maxId) {
        return response.status(400).json({
            error: 'Phonebook is full'
        })
    }

    const { name,  number } = body;

    const person = {
        id: generateId(),
        name: name,
        number: number,
    }
    persons = persons.concat(person)

    response.json(person)
})

app.get('/info', (request, response) => {
    const date = new Date().toString();

    const length = persons.length;
    response.send(`<p>Phonebook has info for ${length} people</p><p>${date}</p>`);
})

const PORT = process.env.PORT || 6969
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})

