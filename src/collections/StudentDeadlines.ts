import type { CollectionConfig } from 'payload'

const openAccess = () => true

export const StudentDeadlines: CollectionConfig = {
  slug: 'student-deadlines',
  admin: { useAsTitle: 'title', group: 'Student dashboard' },
  access: { create: openAccess, read: openAccess, update: openAccess, delete: openAccess },
  fields: [
    { name: 'dashboardKey', type: 'text', required: true, defaultValue: 'amelia' },
    { name: 'title', type: 'text', required: true },
    { name: 'module', type: 'text', required: true },
    { name: 'dueDate', type: 'date', required: true },
    { name: 'progress', type: 'number', min: 0, max: 100, defaultValue: 0 },
  ],
}
