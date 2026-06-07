import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const adapter = new JSONFile('data/db.json')
const defaultData = { 
    users: [], 
    skills: [
    { id: 1, name: 'Exercise' },
    { id: 2, name: 'Studies' },
    { id: 3, name: 'Organization' },
    { id: 4, name: 'Social' },
    { id: 5, name: 'Mindfulness' },
    { id: 6, name: 'Creativity' },
    { id: 7, name: 'Finance' },
    { id: 8, name: 'Health' },
    { id: 9, name: 'Technical' },
    ]
}
const db = new Low(adapter, defaultData)

await db.read()

export default db