import { useState } from 'react'
import { cheatSheet, glossary, phases } from '../learn/steps'

const REPO_FILES = 'https://github.com/Solomon-Sefiw/hello-cicd/blob/main/'
const STORAGE_KEY = 'learn-progress'
const totalSteps = phases.reduce((n, p) => n + p.steps.length, 0)

// Progress is kept in the browser only. Storage can be blocked (private window), so never let it crash the page.
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // ignore - progress just won't be remembered
  }
}

function Command({ text }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // clipboard not allowed - the user can still select the text
    }
  }

  return (
    <div className="command">
      <code>{text}</code>
      <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
    </div>
  )
}

function Step({ step, done, onToggle }) {
  return (
    <li className={`step ${done ? 'step-done' : ''}`}>
      <label className="step-title">
        <input type="checkbox" checked={done} onChange={onToggle} />
        <span>{step.title}</span>
      </label>
      <div className="step-body">
        {step.what?.map(line => <p key={line}>{line}</p>)}
        {step.commands?.map(cmd => <Command key={cmd} text={cmd} />)}
        {step.expect && <p className="note note-expect"><strong>You should see:</strong> {step.expect}</p>}
        {step.why && <p className="note note-why"><strong>Why:</strong> {step.why}</p>}
        {step.link && <p><a href={REPO_FILES + step.link} target="_blank" rel="noreferrer">Read more: {step.link}</a></p>}
      </div>
    </li>
  )
}

export default function LearnPage() {
  const [progress, setProgress] = useState(loadProgress)
  const doneCount = Object.values(progress).filter(Boolean).length

  function toggle(id) {
    const next = { ...progress, [id]: !progress[id] }
    setProgress(next)
    saveProgress(next)
  }

  function reset() {
    setProgress({})
    saveProgress({})
  }

  return (
    <section className="wide">
      <h1>Learn CI/CD step by step</h1>
      <p className="muted">
        Do the phases in order. Tick each step when it works. Your progress is saved in this browser.
      </p>

      <div className="progress">
        <div className="progress-bar"><div style={{ width: `${(doneCount / totalSteps) * 100}%` }} /></div>
        <span>{doneCount} / {totalSteps} steps</span>
        {doneCount > 0 && <button type="button" className="link-button" onClick={reset}>Reset</button>}
      </div>

      <nav className="toc">
        {phases.map((p, i) => {
          const phaseDone = p.steps.every(s => progress[s.id])
          return <a key={p.id} href={`#/learn/${p.id}`} onClick={e => { e.preventDefault(); document.getElementById(p.id)?.scrollIntoView({ behavior: 'smooth' }) }}>
            {phaseDone ? '✅' : `${i + 1}.`} {p.title}
          </a>
        })}
      </nav>

      {phases.map((phase, i) => (
        <article key={phase.id} id={phase.id} className="phase">
          <h2>Phase {i + 1}: {phase.title}</h2>
          <p className="goal">{phase.goal}</p>
          {phase.link && (
            <p><a href={REPO_FILES + phase.link} target="_blank" rel="noreferrer">Full lesson: {phase.link}</a></p>
          )}
          <ol className="steps">
            {phase.steps.map(step => (
              <Step key={step.id} step={step} done={!!progress[step.id]} onToggle={() => toggle(step.id)} />
            ))}
          </ol>
        </article>
      ))}

      <article className="phase" id="cheat-sheet">
        <h2>Daily cheat sheet</h2>
        <p className="goal">The commands you'll use every day. Run them one line at a time.</p>
        {cheatSheet.map(([label, commands]) => (
          <div key={label} className="cheat">
            <strong>{label}</strong>
            {commands.map(cmd => <Command key={cmd} text={cmd} />)}
          </div>
        ))}
      </article>

      <article className="phase" id="glossary">
        <h2>Words you need to know</h2>
        <dl className="glossary">
          {glossary.map(([term, meaning]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      </article>
    </section>
  )
}
