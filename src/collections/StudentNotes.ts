import type { CollectionConfig } from 'payload'

const openAccess = () => true

export const StudentNotes: CollectionConfig = {
  slug: 'student-notes',
  admin: { useAsTitle: 'title', group: 'Student dashboard' },
  access: { create: openAccess, read: openAccess, update: openAccess, delete: openAccess },
  fields: [
    { name: 'dashboardKey', type: 'text', required: true, defaultValue: 'amelia' },
    { name: 'folder', type: 'text', required: true, defaultValue: 'My notes' },
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea', defaultValue: '' },
  ],
}
