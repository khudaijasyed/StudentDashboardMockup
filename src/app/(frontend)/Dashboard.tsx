'use client'

import { useMemo, useRef, useState, useTransition, type PointerEvent as ReactPointerEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  createCalendarEvent,
  createDeadline,
  createNote,
  saveNote,
  saveStickyNote,
} from './actions'

type Note = { id: string | number; title: string; body?: string | null; folder: string }
type Deadline = { id: string | number; title: string; module: string; dueDate: string; progress?: number | null }
type Event = { id: string | number; title: string; start: string; end: string; location?: string | null; description?: string | null }
type Sticky = { id: string | number; content?: string | null }

const tabs = ['Outlook', 'Notes', 'SurreyLearn', 'Timetable'] as const
type Tab = (typeof tabs)[number]

const fieldClass = 'w-full rounded-xl border border-[#dce2e4] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4285f4]'
const inbox = [
  { sender: 'Dr. Sarah Collins', subject: 'Campaign feedback', preview: 'I’ve added comments to your first draft…', initials: 'SC', body: 'Hi Amelia,\n\nI’ve reviewed your campaign analysis draft. Your audience insight is strong — please add a little more evidence to support the channel recommendations before Friday.\n\nBest,\nSarah' },
  { sender: 'SurreyLearn', subject: 'New assignment posted', preview: 'The research proposal brief is now live.', initials: 'SL', body: 'A new assignment has been posted for Business Research Methods. Open SurreyLearn to review the brief and submission requirements.' },
  { sender: 'Student Union', subject: 'What’s on this week', preview: 'Society events, sports and more…', initials: 'SU', body: 'There’s plenty happening on campus this week, including the Spring Careers Fair and Film Society screening. We hope to see you there!' },
]
const classSchedule = [
  { time: '10:00', title: 'Digital Marketing Strategy', room: 'Teaching Block • 09', color: 'bg-[#ff7a59]' },
  { time: '13:00', title: 'Consumer Behaviour', room: 'Rik Medlik • 06', color: 'bg-[#5b50d6]' },
  { time: '16:00', title: 'Group Project Workshop', room: 'Library • 2.14', color: 'bg-[#2ba58f]' },
]

export default function Dashboard({
  initialNotes,
  initialDeadlines,
  initialEvents,
  initialSticky,
}: {
  initialNotes: Note[]
  initialDeadlines: Deadline[]
  initialEvents: Event[]
  initialSticky: Sticky | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [active, setActive] = useState<Tab>('SurreyLearn')
  const [notes, setNotes] = useState(initialNotes)
  const [deadlines, setDeadlines] = useState(initialDeadlines)
  const [events, setEvents] = useState(initialEvents)
  const [selectedNote, setSelectedNote] = useState<string | number | null>(initialNotes[0]?.id ?? null)
  const [sticky, setSticky] = useState(initialSticky?.content ?? '')
  const [stickyId, setStickyId] = useState(initialSticky?.id)
  const [newStickyTask, setNewStickyTask] = useState('')
  const [completedStickyTasks, setCompletedStickyTasks] = useState<Set<number>>(new Set())
  const [showDeadlineForm, setShowDeadlineForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedMail, setSelectedMail] = useState(0)
  const [message, setMessage] = useState('')
  const [stickyMinimized, setStickyMinimized] = useState(false)
  const [stickyPosition, setStickyPosition] = useState({ x: 0, y: 0 })
  const dragOrigin = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null)

  const currentNote = notes.find((note) => note.id === selectedNote)
  const folders = useMemo(() => [...new Set(notes.map((note) => note.folder))], [notes])

  const flash = (text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 2200)
  }

  const persistNote = () => {
    if (!currentNote) return
    startTransition(async () => {
      await saveNote({ id: currentNote.id, title: currentNote.title, body: currentNote.body ?? '' })
      flash('Note saved')
      router.refresh()
    })
  }

  const saveStickyValue = (content: string) => {
    startTransition(async () => {
      const saved = await saveStickyNote({ id: stickyId, content })
      setStickyId(saved.id)
      flash('Sticky note saved')
      router.refresh()
    })
  }

  const persistSticky = () => saveStickyValue(sticky)

  const stickyTasks = sticky
    .split('\n')
    .map((task) => task.replace(/^[□☐☑✓•-]\s*/, '').trim())
    .filter(Boolean)

  const addStickyTask = () => {
    const task = newStickyTask.trim()
    if (!task) return
    const next = [...stickyTasks, task].join('\n')
    setSticky(next)
    setNewStickyTask('')
    saveStickyValue(next)
  }

  const completeStickyTask = (index: number) => {
    setCompletedStickyTasks((current) => new Set(current).add(index))
    const remainingTasks = stickyTasks.filter((_, taskIndex) => taskIndex !== index)
    window.setTimeout(() => {
      const next = remainingTasks.join('\n')
      setSticky(next)
      setCompletedStickyTasks(new Set())
      saveStickyValue(next)
    }, 650)
  }

  const beginStickyDrag = (event: ReactPointerEvent<HTMLElement>) => {
    dragOrigin.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: stickyPosition.x,
      y: stickyPosition.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveSticky = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragOrigin.current) return
    setStickyPosition({
      x: Math.min(0, Math.max(-500, dragOrigin.current.x + event.clientX - dragOrigin.current.pointerX)),
      y: Math.min(500, Math.max(0, dragOrigin.current.y + event.clientY - dragOrigin.current.pointerY)),
    })
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#172b36]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[260px] shrink-0 flex-col bg-[#102f3a] px-5 py-7 text-white lg:flex">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="grid size-9 place-items-center rounded-xl bg-[#f3c94d] font-black text-[#102f3a]">S</div>
            <span className="text-lg font-extrabold">student space</span>
          </div>
          <div className="mb-8 text-center">
            <img src="https://images.unsplash.com/photo-1576997355598-a5a9def46291?crop=faces&fit=crop&w=240&h=240&q=85" alt="Student profile" className="mx-auto mb-4 size-24 rounded-[28px] object-cover ring-4 ring-white/10" />
            <h2 className="font-bold">Amelia Foster</h2>
            <p className="mt-1 text-xs text-white/55">Business Management</p>
          </div>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActive(tab)} className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${active === tab ? 'bg-[#f3c94d] text-[#102f3a]' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}>
                <span className="mr-3">{tab === 'Outlook' ? '✉' : tab === 'Notes' ? '▤' : tab === 'SurreyLearn' ? '◇' : '□'}</span>{tab}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl bg-white/8 p-4"><p className="text-xs font-bold text-white/45">STUDY STREAK</p><p className="mt-2 text-2xl font-extrabold">12 days</p></div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          <header className="mb-7 flex items-center justify-between">
            <div><p className="text-sm font-semibold text-[#6f7f87]">Student dashboard</p><h1 className="mt-1 text-3xl font-extrabold tracking-[-.04em]">{active === 'SurreyLearn' ? 'Good morning, Amelia.' : active}</h1></div>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#62747c] shadow-sm">{pending ? 'Saving…' : 'All changes saved'}</span>
          </header>
          <nav className="mb-6 flex gap-2 overflow-x-auto lg:hidden">{tabs.map((tab) => <button key={tab} onClick={() => setActive(tab)} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold ${active === tab ? 'bg-[#102f3a] text-white' : 'bg-white'}`}>{tab}</button>)}</nav>

          {active === 'Outlook' && (
            <section className="grid min-h-[650px] overflow-hidden rounded-[24px] bg-white shadow-[0_8px_30px_rgba(28,51,63,.05)] md:grid-cols-[280px_1fr]">
              <div className="border-b border-[#e8ecee] p-5 md:border-b-0 md:border-r">
                <button onClick={() => flash('New message opened')} className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1674d1] px-4 py-3 text-sm font-bold text-white">＋ New message</button>
                <label className="mb-4 flex items-center gap-2 rounded-xl bg-[#f4f6f7] px-3 py-2.5 text-sm text-[#738289]">
                  <span>⌕</span><input aria-label="Search email" placeholder="Search mail" className="min-w-0 flex-1 outline-none" />
                </label>
                {inbox.map((mail, index) => (
                  <button key={mail.subject} onClick={() => setSelectedMail(index)} className={`mb-2 w-full rounded-xl p-3 text-left ${selectedMail === index ? 'bg-[#eaf3fb]' : 'hover:bg-[#f7f8f8]'}`}>
                    <div className="flex justify-between gap-2"><b className="truncate text-sm">{mail.sender}</b><span className="text-[10px] text-[#8a989e]">10:{24 + index}</span></div>
                    <p className="mt-1 truncate text-xs font-semibold">{mail.subject}</p>
                    <p className="mt-1 truncate text-xs text-[#7c8c93]">{mail.preview}</p>
                  </button>
                ))}
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[.15em] text-[#8c999f]">Inbox</p>
                <h2 className="mt-2 text-2xl font-extrabold">{inbox[selectedMail].subject}</h2>
                <div className="mt-5 flex items-center gap-3 border-b border-[#edf0f1] pb-5">
                  <div className="grid size-10 place-items-center rounded-full bg-[#d9e9f8] font-bold text-[#1674d1]">{inbox[selectedMail].initials}</div>
                  <div><p className="text-sm font-bold">{inbox[selectedMail].sender}</p><p className="text-xs text-[#839198]">to Amelia Foster</p></div>
                </div>
                <p className="mt-7 max-w-2xl whitespace-pre-line text-sm leading-7 text-[#52646c]">{inbox[selectedMail].body}</p>
                <button onClick={() => flash('Reply draft started')} className="mt-8 rounded-xl border border-[#ccd5d8] px-5 py-2.5 text-sm font-bold hover:bg-[#f5f7f7]">↩ Reply</button>
              </div>
            </section>
          )}

          {active === 'Notes' && (
            <section className="grid min-h-[650px] overflow-hidden rounded-[24px] bg-white shadow-sm md:grid-cols-[190px_230px_1fr]">
              <div className="border-r border-[#e8ecee] bg-[#f8f9f9] p-4"><b className="text-sm">Folders</b>{(folders.length ? folders : ['My notes']).map((folder) => <div key={folder} className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#60727a]">▰ &nbsp;{folder}</div>)}</div>
              <div className="border-r border-[#e8ecee] p-4">
                <button onClick={() => startTransition(async () => { const note = await createNote({ title: 'Untitled note', folder: 'My notes' }); setNotes([note as Note, ...notes]); setSelectedNote(note.id); router.refresh() })} className="mb-4 w-full rounded-xl bg-[#102f3a] px-4 py-2.5 text-sm font-bold text-white">＋ New note</button>
                {notes.map((note) => <button key={note.id} onClick={() => setSelectedNote(note.id)} className={`mb-2 w-full rounded-xl p-3 text-left ${selectedNote === note.id ? 'bg-[#fff6d9]' : 'hover:bg-[#f7f8f8]'}`}><b className="block truncate text-sm">{note.title}</b><span className="mt-1 block truncate text-xs text-[#87949a]">{note.body || 'Empty note'}</span></button>)}
              </div>
              <div className="flex flex-col p-6">
                {currentNote ? <><div className="mb-4 flex justify-between"><span className="text-xs text-[#87949a]">Saved permanently to your dashboard</span><button onClick={persistNote} className="text-xs font-bold text-[#287a6c]">Save now</button></div><input value={currentNote.title} onChange={(e) => setNotes(notes.map(n => n.id === currentNote.id ? {...n, title: e.target.value} : n))} onBlur={persistNote} className="mb-4 text-2xl font-extrabold outline-none" /><textarea value={currentNote.body ?? ''} onChange={(e) => setNotes(notes.map(n => n.id === currentNote.id ? {...n, body: e.target.value} : n))} onBlur={persistNote} placeholder="Start writing your note…" className="min-h-[470px] flex-1 resize-none text-sm leading-7 outline-none" /></> : <div className="grid h-full place-items-center text-sm text-[#87949a]">Create a note to start writing.</div>}
              </div>
            </section>
          )}

          {active === 'SurreyLearn' && (
            <div className="relative">
              <div className="pointer-events-none absolute -top-16 right-1 z-20 lg:right-5 lg:top-4">
                <aside
                  onPointerDown={beginStickyDrag}
                  onPointerMove={moveSticky}
                  onPointerUp={() => { dragOrigin.current = null }}
                  onPointerCancel={() => { dragOrigin.current = null }}
                  className={`pointer-events-auto relative touch-none bg-[#fff19e] shadow-[4px_8px_18px_rgba(64,54,13,.18)] ${stickyMinimized ? 'w-48 cursor-grab p-3 active:cursor-grabbing' : 'w-[min(350px,calc(100vw-4rem))] cursor-grab p-6 active:cursor-grabbing'}`}
                  style={{ transform: `translate(${stickyPosition.x}px, ${stickyPosition.y}px) rotate(-8deg)` }}
                >
                  <div
                    className={`flex select-none items-center justify-between gap-3 ${stickyMinimized ? '' : 'mb-3'}`}
                    aria-label="Drag sticky note"
                  >
                    <h2 className={`font-handwritten font-bold text-[#493f16] ${stickyMinimized ? 'text-2xl' : 'text-3xl'}`}>Quick note</h2>
                    <div className="flex items-center gap-1">
                      {!stickyMinimized && <button onPointerDown={(e) => e.stopPropagation()} onClick={persistSticky} className="rounded-full bg-[#493f16]/10 px-3 py-1 text-xs font-bold">Save</button>}
                      <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setStickyMinimized(!stickyMinimized)} aria-label={stickyMinimized ? 'Expand sticky note' : 'Minimize sticky note'} className="grid size-7 place-items-center rounded-full bg-[#493f16]/10 text-sm font-bold">{stickyMinimized ? '＋' : '−'}</button>
                    </div>
                  </div>
                  {!stickyMinimized && (
                    <div onPointerDown={(e) => e.stopPropagation()} className="min-h-[220px] touch-auto">
                      <div className="space-y-2">
                        {stickyTasks.map((task, index) => (
                          <label key={`${task}-${index}`} className="font-handwritten flex min-w-0 cursor-pointer items-start gap-3 text-[25px] leading-8 text-[#493f16]">
                            <input type="checkbox" checked={completedStickyTasks.has(index)} onChange={() => completeStickyTask(index)} className="mt-1.5 size-5 shrink-0 accent-[#493f16]" />
                            <span className={`min-w-0 flex-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere] transition-all duration-300 ${completedStickyTasks.has(index) ? 'text-[#81753b] line-through opacity-60' : ''}`}>{task}</span>
                          </label>
                        ))}
                      </div>
                      <form onSubmit={(event) => { event.preventDefault(); addStickyTask() }} className="mt-4 flex items-center gap-2 border-t border-[#8c7e36]/20 pt-3">
                        <span className="font-handwritten text-2xl text-[#493f16]">□</span>
                        <input value={newStickyTask} onChange={(event) => setNewStickyTask(event.target.value)} placeholder="Add a task…" className="font-handwritten min-w-0 flex-1 bg-transparent text-[24px] text-[#493f16] outline-none placeholder:text-[#81753b]/60" />
                        <button type="submit" aria-label="Add task" className="grid size-8 place-items-center rounded-full bg-[#493f16]/10 font-bold text-[#493f16]">＋</button>
                      </form>
                    </div>
                  )}
                </aside>
              </div>
              <section className="mb-6 overflow-hidden rounded-[28px] bg-[#ddf0ec] px-6 py-7 sm:px-8 xl:pr-[390px]">
                <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-[#287a6c]">YOUR WEEK</span>
                <h2 className="mt-4 max-w-md text-2xl font-extrabold tracking-[-.03em] sm:text-3xl">You’re making great progress.</h2>
                <p className="mt-2 text-sm text-[#55766f]">3 of 5 weekly goals completed</p>
              </section>
              <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
                <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(28,51,63,.05)] sm:p-6">
                  <div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9aa6ab]">Today</p><h2 className="mt-1 text-xl font-extrabold">Your schedule</h2></div><button onClick={() => setActive('Timetable')} className="text-sm font-bold text-[#287a6c] hover:underline">Full timetable</button></div>
                  <div className="space-y-3">{classSchedule.map((event) => <button key={event.time} onClick={() => flash(`${event.title} selected`)} className="group flex w-full items-center gap-4 rounded-2xl border border-[#eef0f1] p-4 text-left hover:bg-[#fafbfb]"><p className="w-12 text-sm font-extrabold">{event.time}</p><span className={`h-11 w-1 rounded-full ${event.color}`} /><div className="min-w-0 flex-1"><h3 className="truncate font-bold">{event.title}</h3><p className="mt-1 text-xs text-[#7c8c93]">{event.room}</p></div><span>→</span></button>)}</div>
                </section>
                <section className="rounded-[24px] bg-[#172b36] p-5 text-white shadow-[0_8px_30px_rgba(28,51,63,.1)] sm:p-6">
                  <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-white/45">Coming up</p><h2 className="mt-1 text-xl font-extrabold">Deadlines</h2></div><button onClick={() => setShowDeadlineForm(!showDeadlineForm)} className="rounded-lg bg-[#f3c94d] px-3 py-2 text-xs font-bold text-[#172b36]">＋ Add</button></div>
                  {showDeadlineForm && <form className="mb-5 grid gap-2 rounded-xl bg-white/8 p-3" onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); startTransition(async () => { const deadline = await createDeadline({ title: String(data.get('title')), module: String(data.get('module')), dueDate: String(data.get('dueDate')) }); setDeadlines([...deadlines, deadline as Deadline]); setShowDeadlineForm(false); router.refresh() }) }}><input required name="title" placeholder="Deadline title" className="rounded-lg bg-white px-3 py-2 text-sm text-[#172b36] outline-none" /><input required name="module" placeholder="Module" className="rounded-lg bg-white px-3 py-2 text-sm text-[#172b36] outline-none" /><input required name="dueDate" type="date" className="rounded-lg bg-white px-3 py-2 text-sm text-[#172b36] outline-none" /><button className="rounded-lg bg-[#2ba58f] px-3 py-2 text-sm font-bold">Save deadline</button></form>}
                  <div className="space-y-5">{deadlines.length ? deadlines.map((item) => <div key={item.id} className="flex gap-4"><div className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/8 text-center"><b>{new Date(item.dueDate).getDate()}</b><span className="-mt-3 text-[9px] font-bold text-white/45">{new Date(item.dueDate).toLocaleDateString('en', {month:'short'}).toUpperCase()}</span></div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold">{item.title}</h3><p className="mt-1 text-xs text-white/45">{item.module}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#f3c94d]" style={{width: `${item.progress ?? 0}%`}} /></div></div></div>) : <p className="py-8 text-center text-sm text-white/45">No deadlines yet.</p>}</div>
                </section>
              </div>
            </div>
          )}

          {active === 'Timetable' && (
            <section className="overflow-hidden rounded-[24px] bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8ecee] p-5"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-lg bg-[#4285f4] font-bold text-white">G</div><div><h2 className="font-bold">Google Calendar</h2><p className="text-xs text-[#7b8a91]">Student timetable</p></div></div><button onClick={() => setShowEventForm(!showEventForm)} className="rounded-lg bg-[#4285f4] px-4 py-2 text-sm font-bold text-white">＋ Create event</button></div>
              {showEventForm && <form className="grid gap-3 border-b border-[#e8ecee] bg-[#f8fafc] p-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); const googleWindow = window.open('about:blank', '_blank'); const data = new FormData(e.currentTarget); const input = { title: String(data.get('title')), start: String(data.get('start')), end: String(data.get('end')), location: String(data.get('location')), description: String(data.get('description')) }; startTransition(async () => { const event = await createCalendarEvent(input); setEvents([...events, event as Event]); setShowEventForm(false); router.refresh(); if (googleWindow) googleWindow.location.href = googleCalendarUrl(event as Event) }) }}><input required name="title" placeholder="Event title" className={fieldClass} /><input name="location" placeholder="Location" className={fieldClass} /><label className="text-xs font-bold text-[#65767e]">Starts<input required name="start" type="datetime-local" className={`${fieldClass} mt-1`} /></label><label className="text-xs font-bold text-[#65767e]">Ends<input required name="end" type="datetime-local" className={`${fieldClass} mt-1`} /></label><textarea name="description" placeholder="Description" className={`${fieldClass} sm:col-span-2`} /><button className="rounded-xl bg-[#4285f4] px-4 py-3 text-sm font-bold text-white sm:col-span-2">Save & add to Google Calendar</button></form>}
              <div className="p-5"><div className="mb-4 grid grid-cols-5 text-center text-xs font-bold text-[#687980]">{['MON','TUE','WED','THU','FRI'].map(day => <span key={day}>{day}</span>)}</div><div className="grid min-h-[430px] grid-cols-5 border-t border-l border-[#e6eaec]">{[0,1,2,3,4].map(day => <div key={day} className="border-r border-[#e6eaec] p-2">{day === 1 && events.map(event => <a key={event.id} href={googleCalendarUrl(event)} target="_blank" rel="noreferrer" className="mb-2 block rounded-lg border-l-4 border-[#4285f4] bg-[#e8f0fe] p-2 text-xs text-[#2457a6]"><b className="block">{new Date(event.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} {event.title}</b><span>{event.location}</span></a>)}</div>)}</div></div>
            </section>
          )}
        </main>
      </div>
      {message && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-[#102f3a] px-5 py-3 text-sm font-bold text-white shadow-xl">{message}</div>}
    </div>
  )
}

function googleCalendarUrl(event: Event) {
  const format = (date: string) => new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${format(event.start)}/${format(event.end)}`,
    location: event.location ?? '',
    details: event.description ?? '',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}
