import 'server-only'

// Not exposed to the front-end, used solely by the server
export const token = process.env.SANITY_API_TOKEN

console.log('Token:', token)

if (!token) {
  throw new Error('Missing SANITY_API_TOKEN')
}
