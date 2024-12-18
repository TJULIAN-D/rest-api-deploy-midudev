const zod = require('zod')

const movieSchema = zod.object({
  title: zod.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is requerided'
  }),
  year: zod.number().int().positive().min(1900).max(2024),
  duration: zod.number().int().positive(),
  rate: zod.number().min(0).max(10).default(5),
  poster: zod.string().url({
    message: 'invalid url'
  }),
  genre: zod.array(
    zod.enum([
      'Action', 'Crime', 'Drama', 'Adventure',
      'Sci-Fi', 'Romance', 'Animation', 'Biography', 'Fantasy'
    ]),
    {
      required_error: 'Movie genre Required'
    }
  )
})

function validateMovie (object) {
  return movieSchema.safeParse(object)
}

function validatePartialMovie (input) {
  return movieSchema.partial().safeParse(input)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
