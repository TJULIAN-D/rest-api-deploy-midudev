const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')

const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const app = express()
app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:1234',
      'http://localhost:8080',
      'http://movies.com'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not Allowed by CORS'))
  }
}))

app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.json({ message: 'hola Mundo' })
})

/*
  Algo muy comun es intentar decirle que urls acepte ejemplo
*/
const ACCEPTED_ORIGINS = [
  'http://localhost:1234',
  'http://localhost:8080',
  'http://movies.com'
]

// metodos normales : GET/HEAD/POST
// metodos complejos : PUT/PATCH/DELETE

// Para los metodos complejos existe algo que se llama PRE-Flight
// OPTIONS -> peticion especial

// Todos los recursos que sean MOVIES  se identifican con /movies
app.get('/movies', (req, res) => {
  /*
    Arreglar el problema de CORS aca le dice que permite todas las url o le puede pasar
    una es especifico
    res.header('Access-Control-Allow-Origin', 'url-que-acepta')
  */

  /**
     * Si el navegador detecta que la peticion es del mismo, no envia el origin
     * asi que hay que hacer otro tipo de validacion porque si es del mismo no lo envia
     */
  const origin = req.header('origin')

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  // const genreMovie = req.query.genre

  // como lo hice yo
  /*   if (genreMovie) {
    const filterMovies = movies.filter(
      movie => {
        return movie.genre.find(genre => {
          return genre.toLocaleLowerCase() === genreMovie.toLocaleLowerCase()
        })
      }
    )
      */

  const { genre } = req.query
  if (genre) {
    const filterMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )

    return res.json(filterMovies)
  }

  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params

  const movie = movies.find(movie => movie.id === id)

  if (movie) return res.json(movie)

  res.status(404).json({ message: 'Movie no found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json(JSON.parse(result.error.message))
  }

  const newMovie = {
    id: crypto.randomUUID(), // uuid v4
    ...result.data
  }
  // Esto no seria REST, porque estamos guardando
  // el estado de la aplicacion en memoria
  movies.push(newMovie)
  res.status(201).json(newMovie)

  // console.log(req.body)
  res.send('movie Create')
  // res.status(200).end({ message: 'Pelicula Creada' })
})

app.delete('/movies/:id', (req, res) => {
  const origin = req.header('origin')

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  const { id } = req.params

  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie Not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  }

  res.send(200)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`)
})
