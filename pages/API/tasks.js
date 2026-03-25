import { addTask, updateTaskStatus } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { staffId, ...task } = req.body
    const result = await addTask(staffId, task)
    return res.json(result)
  }
  if (req.method === 'PUT') {
    const { staffId, taskId, status } = req.body
    const result = await updateTaskStatus(staffId, taskId, status)
    return res.json(result)
  }
  res.status(405).end()
}
