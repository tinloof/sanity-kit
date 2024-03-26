import { definePathname } from '@tinloof/sanity-studio'
import { defineType } from 'sanity'
import { StickyNote } from 'lucide-react'

export default defineType({
  type: 'document',
  name: 'page',
  fields: [
    {
      type: 'string',
      name: 'title',
    },
    {
      type: 'image',
      name: 'image',
    },
    definePathname({ name: 'pathname' }),
  ],
  preview: {
    select: {
      title: 'title',
      image: 'image',
    },
    prepare({ title, image }) {
      return {
        title,
        media: image,
      }
    },
  },
})
