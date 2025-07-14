import React, { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import PlayerManagement from './components/PlayerManagement'
import TeamManagement from './components/TeamManagement'
import LeagueStandings from './components/LeagueStandings'
import LiveScores from './components/LiveScores'
import Analytics from './components/Analytics'
import TradeCenter from './components/TradeCenter'
import LeagueCreation from './components/LeagueCreation'

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { isAuthenticated, isLoading, user, logout } = useAuth()

  console.log('App: Render state - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user)

  if (isLoading) {
    console.log('App: Showing loading screen')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Auth />
  }

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
      case 'scores':
        return <LiveScores />
      case 'analytics':
        return <Analytics leagueId="test-league-id" />
      case 'trades':
        return <TradeCenter leagueId="test-league-id" teamId="test-team-id" />
      case 'create-league':
        return <LeagueCreation onLeagueCreated={(id) => console.log('League created:', id)} />
      default:
        return <Dashboard />
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🏆 Fantasy Sports Manager</h1>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            🏠 Dashboard
          </button>
          <button
            className={`nav-tab ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            👥 Players
          </button>
          <button
            className={`nav-tab ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            🏈 My Teams
          </button>
          <button
            className={`nav-tab ${activeTab === 'league' ? 'active' : ''}`}
            onClick={() => setActiveTab('league')}
          >
            🏆 League
          </button>
          <button
            className={`nav-tab ${activeTab === 'scores' ? 'active' : ''}`}
            onClick={() => setActiveTab('scores')}
          >
            📊 Live Scores
          </button>
          <button
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
          <button
            className={`nav-tab ${activeTab === 'trades' ? 'active' : ''}`}
            onClick={() => setActiveTab('trades')}
          >
            🔄 Trades
          </button>
          <button
            className={`nav-tab ${activeTab === 'create-league' ? 'active' : ''}`}
            onClick={() => setActiveTab('create-league')}
          >
            ➕ Create League
          </button>
        </nav>

        <div className="header-right">
          <span className="user-welcome">Welcome, {user?.firstName || 'User'}!</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>
      <main className="app-content">
        {renderContent()}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
