import { defineField } from 'sanity'

export default defineField({
  name: 'section.hero',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
  ],
})
