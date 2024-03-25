import { SectionsArrayInput, definePathname } from '@tinloof/sanity-studio'
import { defineField, defineType } from 'sanity'
import { sections } from './sections'

export default defineType({
  type: 'document',
  name: 'page',
  fields: [
    {
      type: 'string',
      name: 'title',
    },
    definePathname({ name: 'pathname' }),
    defineField({
      name: 'sectionsBody',
      title: 'Sections',
      type: 'array',
      of: sections.map((section) => ({
        type: section.name,
      })),
      components: {
        input: SectionsArrayInput,
      },
    }),
  ],
})
