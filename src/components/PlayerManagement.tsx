import React, { useState } from 'react'

interface Player {
  id: number
  name: string
  position: string
  team: string
  sport: string
  points: number
  status: 'available' | 'owned' | 'injured'
  price: number
}

const PlayerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSport, setSelectedSport] = useState('all')
  const [selectedPosition, setSelectedPosition] = useState('all')

  const players: Player[] = [
    { id: 1, name: 'Patrick Mahomes', position: 'QB', team: 'KC', sport: 'Football', points: 324, status: 'available', price: 12.5 },
    { id: 2, name: 'Josh Allen', position: 'QB', team: 'BUF', sport: 'Football', points: 298, status: 'owned', price: 11.8 },
    { id: 3, name: 'LeBron James', position: 'SF', team: 'LAL', sport: 'Basketball', points: 456, status: 'available', price: 15.2 },
    { id: 4, name: 'Stephen Curry', position: 'PG', team: 'GSW', sport: 'Basketball', points: 423, status: 'available', price: 14.7 },
    { id: 5, name: 'Derrick Henry', position: 'RB', team: 'TEN', sport: 'Football', points: 267, status: 'injured', price: 9.3 },
    { id: 6, name: 'Giannis Antetokounmpo', position: 'PF', team: 'MIL', sport: 'Basketball', points: 478, status: 'owned', price: 16.1 },
    { id: 7, name: 'Cooper Kupp', position: 'WR', team: 'LAR', sport: 'Football', points: 289, status: 'available', price: 10.9 },
    { id: 8, name: 'Luka Dončić', position: 'PG', team: 'DAL', sport: 'Basketball', points: 445, status: 'available', price: 15.8 },
  ]

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSport = selectedSport === 'all' || player.sport === selectedSport
    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition
    
    return matchesSearch && matchesSport && matchesPosition
  })

  const handleAddPlayer = (playerId: number) => {
    console.log(`Adding player ${playerId} to team`)
    // In a real app, this would update the player's status and add to user's team
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#4CAF50'
      case 'owned': return '#FF9800'
      case 'injured': return '#F44336'
      default: return '#757575'
    }
  }

  return (
    <div className="player-management">
      <div className="player-header">
        <h2>Player Management</h2>
        <p>Search, filter, and manage your fantasy players</p>
      </div>

      <div className="player-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search players or teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select 
            value={selectedSport} 
            onChange={(e) => setSelectedSport(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Sports</option>
            <option value="Football">Football</option>
            <option value="Basketball">Basketball</option>
          </select>
          
          <select 
            value={selectedPosition} 
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Positions</option>
            <option value="QB">QB</option>
            <option value="RB">RB</option>
            <option value="WR">WR</option>
            <option value="PG">PG</option>
            <option value="SF">SF</option>
            <option value="PF">PF</option>
          </select>
        </div>
      </div>

      <div className="players-grid">
        {filteredPlayers.map(player => (
          <div key={player.id} className="player-card">
            <div className="player-info">
              <h3>{player.name}</h3>
              <div className="player-details">
                <span className="position">{player.position}</span>
                <span className="team">{player.team}</span>
                <span className="sport">{player.sport}</span>
              </div>
            </div>
            
            <div className="player-stats">
              <div className="stat">
                <span className="stat-label">Points</span>
                <span className="stat-value">{player.points}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Price</span>
                <span className="stat-value">${player.price}M</span>
              </div>
            </div>
            
            <div className="player-actions">
              <span 
                className="status-badge" 
                style={{ backgroundColor: getStatusColor(player.status) }}
              >
                {player.status.toUpperCase()}
              </span>
              
              {player.status === 'available' && (
                <button 
                  className="add-player-btn"
                  onClick={() => handleAddPlayer(player.id)}
                >
                  Add to Team
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filteredPlayers.length === 0 && (
        <div className="no-players">
          <p>No players found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default PlayerManagement
