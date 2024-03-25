import { defineSection } from '@tinloof/sanity-studio'
import { defineField } from 'sanity'

export default defineSection({
  name: 'section.hero',
  title: 'Hero',
  type: 'object',
  options: {
    variants: [
      {
        assetUrl: '/images/hero.png',
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
