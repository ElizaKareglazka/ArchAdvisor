import { useState, useMemo } from 'react'
import characteristics from '../data/characteristics'

const categories = [...new Set(characteristics.map((c) => c.category))]

export default function CharacteristicsTab() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return characteristics.filter((c) => {
      const matchesSearch =
        !q ||
        c.nameRu.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q)
      const matchesCategory = !activeCategory || c.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  const grouped = useMemo(() => {
    return filtered.reduce((acc, c) => {
      if (!acc[c.category]) acc[c.category] = []
      acc[c.category].push(c)
      return acc
    }, {})
  }, [filtered])

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Характеристики архитектуры</h2>
        <p className="text-text-secondary">
          Справочник качественных атрибутов программной архитектуры
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          placeholder="Поиск по названию (RU / EN)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface-card text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          aria-label="Поиск характеристик"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer
            ${!activeCategory
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
        >
          Все
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer
              ${activeCategory === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards */}
      {Object.keys(grouped).length === 0 && (
        <p className="text-center text-text-secondary py-8">Ничего не найдено</p>
      )}

      {Object.entries(grouped).map(([category, chars]) => (
        <div key={category} className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-text-secondary">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {chars.map((c) => {
              const isExpanded = expandedId === c.id
              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-border bg-surface-card overflow-hidden"
                >
                  <button
                    className="w-full p-4 text-left cursor-pointer bg-transparent border-none hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{c.nameRu}</p>
                        <p className="text-sm text-text-secondary">{c.nameEn}</p>
                      </div>
                      <span
                        className={`text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        ▼
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{c.shortDescription}</p>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border pt-3">
                      <p className="text-sm mb-3">{c.fullDescription}</p>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs font-semibold text-primary mb-1">Пример из практики</p>
                        <p className="text-sm text-text-primary">{c.example}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}
