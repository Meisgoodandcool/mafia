import { getAllStaff, createStaff, deleteStaff, updateStaff } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const staff = await getAllStaff()
    return res.json(staff)
  }

  if (req.method === 'POST') {
    const member = await createStaff(req.body)
    return res.json(member)
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body
    const member = await updateStaff(id, updates)
    return res.json(member)
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
    await deleteStaff(id)
    return res.json({ success: true })
  }

  res.status(405).end()
}
