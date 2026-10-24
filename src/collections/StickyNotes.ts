import type { CollectionConfig } from 'payload'

const openAccess = () => true

export const StickyNotes: CollectionConfig = {
  slug: 'sticky-notes',
  admin: { useAsTitle: 'dashboardKey', group: 'Student dashboard' },
  access: { create: openAccess, read: openAccess, update: openAccess, delete: openAccess },
  fields: [
    { name: 'dashboardKey', type: 'text', required: true },
    { name: 'content', type: 'textarea', defaultValue: '' },
  ],
}
