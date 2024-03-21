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
  // I started by implementing the navigator preview as follows:
  // options: {
  //   pagesNavigatorPreview: ({ title, image }) => {
  //     return {
  //       title,
  //       media: () => <img src={image} alt="" />,
  //     }
  //   },
  // },
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
        subtitle: 'This is a subtitle',
      }
    },
  },
})
