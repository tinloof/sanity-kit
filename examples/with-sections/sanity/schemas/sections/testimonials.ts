import { defineSection } from '@tinloof/sanity-studio'
import { defineField } from 'sanity'

export default defineSection({
  name: 'section.testimonials',
  title: 'Testimonials',
  type: 'object',
  options: {
    variants: [
      {
        assetUrl: '/images/testimonials.png',
      },
    ],
  },
  fields: [
    defineField({
      name: 'text',
      type: 'string',
    }),
  ],
})
