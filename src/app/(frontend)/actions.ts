'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

const dashboardKey = 'amelia'
const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

export async function createNote(input: { title: string; folder: string }) {
  const payload = await getPayload({ config })
  return payload.create({
    collection: 'student-notes',
    data: {
      dashboardKey,
      title: text(input.title, 120) || 'Untitled note',
      folder: text(input.folder, 80) || 'My notes',
      body: '',
    },
    overrideAccess: false,
  })
}

export async function saveNote(input: { id: string | number; title: string; body: string }) {
  const payload = await getPayload({ config })
  return payload.update({
    collection: 'student-notes',
    id: input.id,
    data: { title: text(input.title, 120) || 'Untitled note', body: text(input.body, 20000) },
    overrideAccess: false,
  })
}

export async function createDeadline(input: { title: string; module: string; dueDate: string }) {
  const payload = await getPayload({ config })
  return payload.create({
    collection: 'student-deadlines',
    data: {
      dashboardKey,
      title: text(input.title, 120),
      module: text(input.module, 120),
      dueDate: new Date(input.dueDate).toISOString(),
      progress: 0,
    },
    overrideAccess: false,
  })
}

export async function createCalendarEvent(input: {
  title: string
  start: string
  end: string
  location: string
  description: string
}) {
  const payload = await getPayload({ config })
  return payload.create({
    collection: 'calendar-events',
    data: {
      dashboardKey,
      title: text(input.title, 120),
      start: new Date(input.start).toISOString(),
      end: new Date(input.end).toISOString(),
      location: text(input.location, 160),
      description: text(input.description, 2000),
    },
    overrideAccess: false,
  })
}

export async function saveStickyNote(input: { id?: string | number; content: string }) {
  const payload = await getPayload({ config })
  const content = text(input.content, 5000)
  if (input.id) {
    return payload.update({
      collection: 'sticky-notes',
      id: input.id,
      data: { content },
      overrideAccess: false,
    })
  }
  return payload.create({
    collection: 'sticky-notes',
    data: { dashboardKey, content },
    overrideAccess: false,
  })
}
