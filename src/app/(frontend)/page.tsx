import config from '@payload-config'
import { getPayload } from 'payload'
import { connection } from 'next/server'
import Dashboard from './Dashboard'

export default async function HomePage() {
  await connection()
  const payload = await getPayload({ config })
  const where = { dashboardKey: { equals: 'amelia' } }
  const [notes, deadlines, events, sticky] = await Promise.all([
    payload.find({ collection: 'student-notes', where, limit: 100, sort: '-updatedAt', overrideAccess: false }),
    payload.find({ collection: 'student-deadlines', where, limit: 100, sort: 'dueDate', overrideAccess: false }),
    payload.find({ collection: 'calendar-events', where, limit: 100, sort: 'start', overrideAccess: false }),
    payload.find({ collection: 'sticky-notes', where, limit: 1, sort: '-updatedAt', overrideAccess: false }),
  ])

  return (
    <Dashboard
      initialNotes={notes.docs}
      initialDeadlines={deadlines.docs}
      initialEvents={events.docs}
      initialSticky={sticky.docs[0] ?? null}
    />
  )
}
