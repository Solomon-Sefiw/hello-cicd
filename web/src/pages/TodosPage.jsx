import { useEffect, useState } from 'react'

// Locally this is http://localhost:5080 (see .env.development).
// In GitHub Actions it is set to the Lambda Function URL before `npm run build`.
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export default function TodosPage() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [health, setHealth] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/health`).then(r => r.json()).then(setHealth).catch(() => setError('API is not reachable'))
    fetch(`${API_URL}/api/todos`).then(r => r.json()).then(setTodos).catch(() => {})
  }, [])

  async function addTodo(e) {
    e.preventDefault()
    const res = await fetch(`${API_URL}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    if (!res.ok) return setError(await res.text())
    setTodos([...todos, await res.json()])
    setTitle('')
    setError('')
  }

  return (
    <section className="narrow">
      <h1>Hello CI/CD</h1>
      <p className="muted">
        API: {health ? `${health.status} (version ${health.version})` : 'checking...'}
      </p>

      <form onSubmit={addTodo}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New todo" />
        <button>Add</button>
      </form>
      {error && <p className="error">{error}</p>}

      <ul className="todos">
        {todos.map(t => (
          <li key={t.id} className={t.done ? 'done' : ''}>{t.title}</li>
        ))}
      </ul>

      <p className="muted">New here? Start with the <a href="#/learn">Learn</a> page.</p>
    </section>
  )
}
