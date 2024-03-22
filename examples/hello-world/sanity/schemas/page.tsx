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
      image: 'image.asset.url',
    },
    prepare({ title, image }) {
      const Image = () => <img src={image} alt="" />
      const Icon = () => <StickyNote size={16} />
      return {
        title,
        media: image ? Image : Icon,
      }
    },
  },
})
