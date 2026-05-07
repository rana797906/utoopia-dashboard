// pages/api/notes.js
import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  const { accountId } = req.query

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'POST') {
    const { text, type, author } = req.body
    if (!text?.trim()) return res.status(400).json({ error: 'Text required' })
    const { data, error } = await supabase
      .from('notes')
      .insert([{ account_id: accountId, text: text.trim(), type: type || 'info', author: author || 'Admin' }])
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
