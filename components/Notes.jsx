// components/Notes.jsx
import { useState } from 'react'
import { format } from 'date-fns'

const NOTE_TYPES = [
  { value: 'info', label: 'Info', color: '#6c63ff', bg: 'rgba(108,99,255,0.12)' },
  { value: 'success', label: '✅ Positive', color: '#22c98a', bg: 'rgba(34,201,138,0.1)' },
  { value: 'warning', label: '⚠️ Warning', color: '#f5a623', bg: 'rgba(245,166,35,0.1)' },
  { value: 'issue', label: '🔴 Issue', color: '#ff5c5c', bg: 'rgba(255,92,92,0.1)' },
]

function NoteItem({ note, onDelete }) {
  const t = NOTE_TYPES.find(n => n.value === note.type) || NOTE_TYPES[0]
  const date = note.created_at ? format(new Date(note.created_at), 'dd MMM, hh:mm a') : ''

  return (
    <div style={{
      borderLeft: `3px solid ${t.color}`, background: t.bg,
      borderRadius: '0 12px 12px 0', padding: '12px 16px', marginBottom: 10
    }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: t.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.label}</span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>· {note.author}</span>
          {date && <span style={{ fontSize: 11, color: 'var(--text3)' }}>· {date}</span>}
        </div>
        <button onClick={() => onDelete(note.id)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text3)', fontSize: 16, lineHeight: 1, padding: '2px 6px', borderRadius: 6
        }}>×</button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text1)', lineHeight: 1.6 }}>{note.text}</p>
    </div>
  )
}

export default function Notes({ accountId }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [text, setText] = useState('')
  const [type, setType] = useState('info')
  const [author, setAuthor] = useState('')
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)

  async function loadNotes() {
    if (loaded) return
    setLoading(true)
    try {
      const res = await fetch(`/api/notes?accountId=${accountId}`)
      const data = await res.json()
      setNotes(Array.isArray(data) ? data : [])
      setLoaded(true)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleToggle() {
    setOpen(o => !o)
    if (!loaded) await loadNotes()
  }

  async function addNote(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/notes?accountId=${accountId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type, author: author || 'Admin' })
      })
      const note = await res.json()
      setNotes(prev => [note, ...prev])
      setText('')
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function deleteNote(id) {
    setNotes(prev => prev.filter(n => n.id !== id))
    await fetch(`/api/notes?accountId=${accountId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
  }

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <button onClick={handleToggle} style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>📝</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text1)' }}>
            Analysis & Notes
          </span>
          {notes.length > 0 && (
            <span className="tag tag-purple" style={{ fontSize: 10 }}>{notes.length}</span>
          )}
        </div>
        <span style={{ color: 'var(--text3)', fontSize: 18 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 16 }} className="fade-in">
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2].map(i => <div key={i} className="shimmer" style={{ height: 70 }} />)}
            </div>
          )}

          {!loading && notes.length === 0 && (
            <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              Abhi koi notes nahi hain — neeche add karein
            </p>
          )}

          {!loading && notes.map(n => (
            <NoteItem key={n.id} note={n} onDelete={deleteNote} />
          ))}

          <form onSubmit={addNote} style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <select value={type} onChange={e => setType(e.target.value)}>
                {NOTE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Aapka naam (optional)" />
            </div>
            <textarea
              value={text} onChange={e => setText(e.target.value)}
              placeholder="Note likhein... maslan: 'ROAS down hai kyunki competitor ne offer chalaaya, kal better hoga'"
              style={{ minHeight: 80, marginBottom: 10, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={saving || !text.trim()}>
                {saving ? 'Saving...' : '+ Note Add Karein'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
