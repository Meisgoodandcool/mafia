export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { password } = req.body
  if (password === process.env.HICOM_PASSWORD) {
    return res.json({ role: 'hicom' })
  }
  if (password === process.env.STAFF_PASSWORD) {
    return res.json({ role: 'staff' })
  }
  return res.json({ role: null })
}
