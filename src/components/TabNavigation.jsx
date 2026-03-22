const tabs = [
  { id: 'advisor', label: 'Подбор архитектуры' },
  { id: 'characteristics', label: 'Характеристики' },
  { id: 'styles', label: 'Стили архитектуры' },
]

export default function TabNavigation({ activeTab, onTabChange }) {
  return (
    <nav role="tablist" className="flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
            ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-primary-light hover:text-primary'
            }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
