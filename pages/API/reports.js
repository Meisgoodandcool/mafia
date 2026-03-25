import { addReport } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { staffId, ...report } = req.body
    const result = await addReport(staffId, report)
    return res.json(result)
  }
  res.status(405).end()
}
