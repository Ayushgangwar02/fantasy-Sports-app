import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import PlayerManagement from './components/PlayerManagement'
import TeamManagement from './components/TeamManagement'
import LeagueStandings from './components/LeagueStandings'
import './App.css'

type TabType = 'dashboard' | 'players' | 'teams' | 'league'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'players':
        return <PlayerManagement />
      case 'teams':
        return <TeamManagement />
      case 'league':
        return <LeagueStandings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏆 Fantasy Sports Manager</h1>
        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-tab ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            Players
          </button>
          <button 
            className={`nav-tab ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            My Teams
          </button>
          <button 
            className={`nav-tab ${activeTab === 'league' ? 'active' : ''}`}
            onClick={() => setActiveTab('league')}
          >
            League
          </button>
        </nav>
      </header>
      <main className="app-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
