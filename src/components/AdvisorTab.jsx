import { useState, useMemo, useRef } from 'react'
import characteristics from '../data/characteristics'
import styles from '../data/styles'
import { recommend } from '../utils/recommend'

const MAX_SELECTED = 10
const MAX_KEY = 3

const grouped = characteristics.reduce((acc, c) => {
  if (!acc[c.category]) acc[c.category] = []
  acc[c.category].push(c)
  return acc
}, {})

export default function AdvisorTab({ onNavigateToStyle }) {
  const [selected, setSelected] = useState(new Set())
  const [keyChars, setKeyChars] = useState(new Set())
  const [results, setResults] = useState(null)
  const [warning, setWarning] = useState('')
  const resultsRef = useRef(null)

  const canSubmit = selected.size === MAX_SELECTED && keyChars.size === MAX_KEY

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setKeyChars((k) => {
          const nk = new Set(k)
          nk.delete(id)
          return nk
        })
      } else {
        if (next.size >= MAX_SELECTED) {
          setWarning('Максимум 10 характеристик. Снимите выбор с одной, чтобы добавить новую.')
          setTimeout(() => setWarning(''), 3000)
          return prev
        }
        next.add(id)
      }
      setWarning('')
      return next
    })
  }

  function toggleKey(id) {
    if (!selected.has(id)) return
    setKeyChars((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (next.size >= MAX_KEY) {
          setWarning('Максимум 3 ключевых характеристики.')
          setTimeout(() => setWarning(''), 3000)
          return prev
        }
        next.add(id)
      }
      setWarning('')
      return next
    })
  }

  function handleSubmit() {
    if (!canSubmit) return
    const res = recommend([...selected], [...keyChars], styles, characteristics)
    setResults(res)
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function handleReset() {
    setSelected(new Set())
    setKeyChars(new Set())
    setResults(null)
    setWarning('')
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Подбор архитектуры</h2>
        <p className="text-text-secondary">
          Выберите 10 характеристик, важных для вашего проекта, и отметьте 3 ключевых.
        </p>
      </div>

      {/* Counter & controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4 sticky top-[61px] bg-surface z-40 py-3 border-b border-border">
        <span className="text-lg font-semibold">
          Выбрано: <span className={selected.size === MAX_SELECTED ? 'text-green-600' : 'text-primary'}>{selected.size}/{MAX_SELECTED}</span>
        </span>
        <span className="text-lg font-semibold">
          Ключевых: <span className={keyChars.size === MAX_KEY ? 'text-green-600' : 'text-accent'}>{keyChars.size}/{MAX_KEY}</span>
        </span>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Сбросить
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer
              ${canSubmit
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            Подобрать архитектуру
          </button>
        </div>
      </div>

      {/* Warning toast */}
      {warning && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm" role="alert">
          {warning}
        </div>
      )}

      {/* Characteristics grid by category */}
      {Object.entries(grouped).map(([category, chars]) => (
        <div key={category} className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-text-secondary">{category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {chars.map((c) => {
              const isSelected = selected.has(c.id)
              const isKey = keyChars.has(c.id)
              return (
                <div
                  key={c.id}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer
                    ${isKey
                      ? 'border-accent bg-amber-50 shadow-md'
                      : isSelected
                        ? 'border-primary bg-primary-light shadow-sm'
                        : 'border-border bg-surface-card hover:border-gray-300'}`}
                  onClick={() => toggleSelect(c.id)}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  title={c.shortDescription}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleSelect(c.id)
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{c.nameRu}</p>
                      <p className="text-xs text-text-secondary">{c.nameEn}</p>
                    </div>
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleKey(c.id)
                        }}
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer
                          ${isKey
                            ? 'bg-accent text-white'
                            : 'bg-gray-200 text-gray-500 hover:bg-amber-200'}`}
                        title={isKey ? 'Убрать из ключевых' : 'Сделать ключевой'}
                        aria-label={isKey ? 'Убрать из ключевых' : 'Сделать ключевой'}
                      >
                        ★
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Results */}
      {results && (
        <div className="mt-8 mb-8" id="results" ref={resultsRef}>
          <h2 className="text-2xl font-bold mb-4">Результат подбора</h2>

          {/* Top recommendation */}
          {results[0] && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-light to-blue-100 border-2 border-primary mb-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm text-primary font-medium mb-1">Лучшее совпадение</p>
                  <h3 className="text-xl font-bold mb-2">
                    <span className="mr-2">{results[0].style.icon}</span>
                    <button
                      onClick={() => onNavigateToStyle(results[0].style.id)}
                      className="text-primary hover:underline cursor-pointer bg-transparent border-none text-xl font-bold p-0"
                    >
                      {results[0].style.name}
                    </button>
                  </h3>
                  <p className="text-text-secondary text-sm">{results[0].explanation}</p>
                </div>
                <div className="text-3xl font-bold text-primary">{results[0].matchPercent}%</div>
              </div>
            </div>
          )}

          {/* Alternatives */}
          {results.length > 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Альтернативные варианты</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.slice(1, 4).map((r) => (
                  <div key={r.style.id} className="p-4 rounded-xl bg-surface-card border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{r.style.icon}</span>
                      <span className="text-lg font-bold text-text-secondary">{r.matchPercent}%</span>
                    </div>
                    <h4 className="font-semibold mb-1">
                      <button
                        onClick={() => onNavigateToStyle(r.style.id)}
                        className="text-primary hover:underline cursor-pointer bg-transparent border-none font-semibold p-0 text-left"
                      >
                        {r.style.name}
                      </button>
                    </h4>
                    <p className="text-xs text-text-secondary">{r.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
