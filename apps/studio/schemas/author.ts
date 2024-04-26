import {definePathname} from '@tinloof/sanity-studio'
import {defineType} from 'sanity'

export default defineType({
  type: 'document',
  name: 'author',
  fields: [
    {
      type: 'string',
      name: 'title',
    },
    definePathname({
      name: 'pathname',
      initialValue: {
        current: '/authors/',
      },
      options: {folder: {canUnlock: false}},
    }),
  ],
})
