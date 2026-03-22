import { useState, useEffect, useRef, useMemo } from 'react'
import stylesData from '../data/styles'
import characteristics from '../data/characteristics'

const charMap = Object.fromEntries(characteristics.map((c) => [c.id, c]))

const scoreLabelMap = {
  1: { label: 'Низкая', color: 'bg-red-100 text-red-700' },
  2: { label: 'Ниже средней', color: 'bg-orange-100 text-orange-700' },
  3: { label: 'Средняя', color: 'bg-yellow-100 text-yellow-700' },
  4: { label: 'Выше средней', color: 'bg-lime-100 text-lime-700' },
  5: { label: 'Высокая', color: 'bg-green-100 text-green-700' },
}

export default function StylesTab({ highlightStyleId, onClearHighlight }) {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const highlightRef = useRef(null)

  useEffect(() => {
    if (highlightStyleId) {
      // Reset scroll position from previous tab immediately
      window.scrollTo(0, 0)
      setExpandedId(highlightStyleId)
      // Scroll to the card after it renders and expands
      const t = setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
      return () => {
        clearTimeout(t)
        onClearHighlight?.()
      }
    }
  }, [highlightStyleId, onClearHighlight])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return stylesData
    return stylesData.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Стили архитектуры</h2>
        <p className="text-text-secondary">
          Каталог архитектурных стилей с описаниями и примерами
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="search"
          placeholder="Поиск по названию стиля..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface-card text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          aria-label="Поиск стилей архитектуры"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-secondary py-8">Ничего не найдено</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((style) => {
          const isExpanded = expandedId === style.id
          const isHighlighted = highlightStyleId === style.id

          return (
            <div
              key={style.id}
              ref={isHighlighted ? highlightRef : null}
              className={`rounded-2xl border-2 bg-surface-card overflow-hidden transition-all
                ${isHighlighted ? 'border-primary shadow-lg' : 'border-border'}
                ${isExpanded ? 'md:col-span-2 lg:col-span-3' : ''}`}
            >
              <button
                className="w-full p-5 text-left cursor-pointer bg-transparent border-none hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : style.id)}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{style.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg">{style.name}</h3>
                    <p className="text-sm text-text-secondary mt-1">{style.shortDescription}</p>
                  </div>
                  <span
                    className={`text-text-secondary transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    ▼
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border pt-4">
                  {/* Full description */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Описание</h4>
                    <p className="text-sm whitespace-pre-line">{style.fullDescription}</p>
                  </div>

                  {/* Key characteristics with scores */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Оценки характеристик</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(style.scores)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([charId, score]) => {
                          const ch = charMap[charId]
                          const sl = scoreLabelMap[score] || scoreLabelMap[3]
                          return (
                            <span
                              key={charId}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${sl.color}`}
                              title={`${ch?.nameRu || charId}: ${sl.label} (${score}/5)`}
                            >
                              {ch?.nameRu || charId}: {sl.label}
                            </span>
                          )
                        })}
                    </div>
                  </div>

                  {/* Real examples */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Примеры реальных приложений</h4>
                    <div className="flex flex-wrap gap-2">
                      {style.realExamples.map((ex) => (
                        <span
                          key={ex}
                          className="px-3 py-1 bg-blue-50 text-primary rounded-full text-sm font-medium"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* When to use / not to use */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <h4 className="font-semibold text-green-700 mb-1 text-sm">Когда подходит</h4>
                      <p className="text-sm">{style.whenToUse}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-xl">
                      <h4 className="font-semibold text-red-700 mb-1 text-sm">Когда НЕ подходит</h4>
                      <p className="text-sm">{style.whenNotToUse}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
