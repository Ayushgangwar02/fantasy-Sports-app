import React, { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import PlayerManagement from './components/PlayerManagement'
import TeamManagement from './components/TeamManagement'
import LeagueStandings from './components/LeagueStandings'

const AppContent: React.FC = () => {
  console.log('AppContent: Starting to render')

  try {
    const [activeTab, setActiveTab] = useState('dashboard')
    const { isAuthenticated, isLoading, user, logout } = useAuth()

    console.log('App: Render state - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user)

    if (isLoading) {
      console.log('App: Showing loading screen')
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading Fantasy Sports Manager...</p>
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
  } catch (error) {
    console.error('AppContent: Error rendering:', error)
    return (
      <div className="error-container">
        <h2>Something went wrong</h2>
        <p>Please refresh the page and try again.</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Retry
        </button>
      </div>
    )
  }
}

function App() {
  console.log('App: Rendering main App component')

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
