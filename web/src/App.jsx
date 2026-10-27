import { useEffect, useState } from 'react'
import './index.css'
import LearnPage from './pages/LearnPage'
import TodosPage from './pages/TodosPage'

// Hash-based pages (#/ and #/learn). They work on S3 static hosting with no server config,
// because the part after # never reaches the server.
function currentPage() {
  return window.location.hash.startsWith('#/learn') ? 'learn' : 'todos'
}

export default function App() {
  const [page, setPage] = useState(currentPage)

  useEffect(() => {
    const onHashChange = () => setPage(currentPage())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <>
      <header className="topbar">
        <span className="brand">Hello CI/CD</span>
        <nav>
          <a href="#/" className={page === 'todos' ? 'active' : ''}>Todos</a>
          <a href="#/learn" className={page === 'learn' ? 'active' : ''}>Learn</a>
        </nav>
      </header>
      <main>{page === 'learn' ? <LearnPage /> : <TodosPage />}</main>
    </>
  )
}
