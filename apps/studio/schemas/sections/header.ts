import {defineSection} from '@tinloof/sanity-studio'
import {defineField} from 'sanity'

export default defineSection({
  name: 'section.header',
  title: 'Header',
  type: 'object',
  options: {
    variants: [
      {
        assetUrl: '/images/header.png',
      },
    ],
  },
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
  ],
})
