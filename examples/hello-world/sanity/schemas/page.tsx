import { definePathname } from '@tinloof/sanity-studio'
import { defineType } from 'sanity'

export default defineType({
  type: 'document',
  name: 'page',
  fields: [
    {
      type: 'string',
      name: 'title',
    },
    definePathname({ name: 'pathname' }),
  ],
  preview: {
    select: {
      title: 'title',
      pathname: 'pathname',
    },
    prepare: ({ title, pathname }) => ({
      title: title,
      subtitle: pathname?.current || '',
      media: (
        <img src="https://m.media-amazon.com/images/I/31p1Jzn+GXL._AC_UF1000,1000_QL80_.jpg" />
      ),
    }),
  },
})
