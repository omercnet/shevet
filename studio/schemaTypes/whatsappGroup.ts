import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'whatsappGroup',
  title: 'קבוצת וואטסאפ',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'שם הקבוצה', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'cohort', title: 'סוג', type: 'string',
      options: {list: [
        {title: 'לפי תאריך לידה', value: 'due-date'},
        {title: 'לפי נושא', value: 'topic'},
      ]}}),
    defineField({name: 'inviteUrl', title: 'קישור הצטרפות', type: 'url'}),
    defineField({name: 'moderator', title: 'מנחה', type: 'string'}),
    defineField({name: 'guidelines', title: 'כללי הקבוצה', type: 'text'}),
  ],
  preview: {select: {title: 'name', subtitle: 'cohort'}},
})
