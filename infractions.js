import { addInfraction } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { staffId, ...infraction } = req.body
    const result = await addInfraction(staffId, infraction)
    return res.json(result)
  }
  res.status(405).end()
}
