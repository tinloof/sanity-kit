import { defineField } from 'sanity'

export default defineField({
  name: 'section.testimonials',
  title: 'Testimonials',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      type: 'string',
    }),
  ],
})
