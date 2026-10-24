import type { CollectionConfig } from 'payload'

const openAccess = () => true

export const CalendarEvents: CollectionConfig = {
  slug: 'calendar-events',
  admin: { useAsTitle: 'title', group: 'Student dashboard' },
  access: { create: openAccess, read: openAccess, update: openAccess, delete: openAccess },
  fields: [
    { name: 'dashboardKey', type: 'text', required: true, defaultValue: 'amelia' },
    { name: 'title', type: 'text', required: true },
    { name: 'start', type: 'date', required: true },
    { name: 'end', type: 'date', required: true },
    { name: 'location', type: 'text' },
    { name: 'description', type: 'textarea' },
  ],
}
