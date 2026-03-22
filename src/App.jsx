import { useState, useCallback } from 'react'
import TabNavigation from './components/TabNavigation'
import AdvisorTab from './components/AdvisorTab'
import CharacteristicsTab from './components/CharacteristicsTab'
import StylesTab from './components/StylesTab'
import './index.css'

function App() {
  const [activeTab, setActiveTab] = useState('advisor')
  const [highlightStyleId, setHighlightStyleId] = useState(null)

  const navigateToStyle = useCallback((styleId) => {
    setHighlightStyleId(styleId)
    setActiveTab('styles')
  }, [])

  const clearHighlight = useCallback(() => {
    setHighlightStyleId(null)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">
            <span role="img" aria-label="architecture">🏛️</span> ArchAdvisor
          </h1>
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {activeTab === 'advisor' && (
          <AdvisorTab onNavigateToStyle={navigateToStyle} />
        )}
        {activeTab === 'characteristics' && <CharacteristicsTab />}
        {activeTab === 'styles' && (
          <StylesTab
            highlightStyleId={highlightStyleId}
            onClearHighlight={clearHighlight}
          />
        )}
      </main>

      <footer className="bg-white border-t border-border py-4 text-center text-text-secondary text-sm">
        ArchAdvisor v1.0 — Советник по архитектуре ПО
      </footer>
    </div>
  )
}

export default App
