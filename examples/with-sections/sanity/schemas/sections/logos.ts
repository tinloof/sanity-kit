import { defineSection } from '@tinloof/sanity-studio'
import { defineField } from 'sanity'

export default defineSection({
  name: 'section.logos',
  title: 'Logos',
  type: 'object',
  options: {
    variants: [
      {
        assetUrl: '/images/logos.png',
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
