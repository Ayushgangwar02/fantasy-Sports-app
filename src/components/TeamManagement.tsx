import React, { useState } from 'react'

interface TeamPlayer {
  id: number
  name: string
  position: string
  team: string
  points: number
  isStarter: boolean
}

interface Team {
  id: number
  name: string
  sport: string
  players: TeamPlayer[]
  budget: number
  usedBudget: number
}

const TeamManagement: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<number>(1)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamSport, setNewTeamSport] = useState('Football')

  const teams: Team[] = [
    {
      id: 1,
      name: 'Thunder Bolts',
      sport: 'Football',
      budget: 100,
      usedBudget: 78.5,
      players: [
        { id: 1, name: 'Josh Allen', position: 'QB', team: 'BUF', points: 298, isStarter: true },
        { id: 2, name: 'Derrick Henry', position: 'RB', team: 'TEN', points: 267, isStarter: true },
        { id: 3, name: 'Cooper Kupp', position: 'WR', team: 'LAR', points: 289, isStarter: true },
        { id: 4, name: 'Travis Kelce', position: 'TE', team: 'KC', points: 234, isStarter: true },
        { id: 5, name: 'Justin Tucker', position: 'K', team: 'BAL', points: 156, isStarter: true },
        { id: 6, name: 'Steelers', position: 'DEF', team: 'PIT', points: 189, isStarter: true },
        { id: 7, name: 'Tua Tagovailoa', position: 'QB', team: 'MIA', points: 201, isStarter: false },
      ]
    },
    {
      id: 2,
      name: 'Ice Dragons',
      sport: 'Basketball',
      budget: 100,
      usedBudget: 82.3,
      players: [
        { id: 8, name: 'LeBron James', position: 'SF', team: 'LAL', points: 456, isStarter: true },
        { id: 9, name: 'Stephen Curry', position: 'PG', team: 'GSW', points: 423, isStarter: true },
        { id: 10, name: 'Giannis Antetokounmpo', position: 'PF', team: 'MIL', points: 478, isStarter: true },
        { id: 11, name: 'Luka Dončić', position: 'PG', team: 'DAL', points: 445, isStarter: false },
      ]
    }
  ]

  const currentTeam = teams.find(team => team.id === selectedTeam)

  const handleToggleStarter = (playerId: number) => {
    console.log(`Toggling starter status for player ${playerId}`)
    // In a real app, this would update the player's starter status
  }

  const handleDropPlayer = (playerId: number) => {
    console.log(`Dropping player ${playerId}`)
    // In a real app, this would remove the player from the team
  }

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      console.log(`Creating new team: ${newTeamName} (${newTeamSport})`)
      setNewTeamName('')
      setShowCreateTeam(false)
      // In a real app, this would create a new team
    }
  }

  return (
    <div className="team-management">
      <div className="team-header">
        <h2>Team Management</h2>
        <div className="team-controls">
          <select 
            value={selectedTeam} 
            onChange={(e) => setSelectedTeam(Number(e.target.value))}
            className="team-select"
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.sport})
              </option>
            ))}
          </select>
          <button 
            className="create-team-btn"
            onClick={() => setShowCreateTeam(true)}
          >
            Create New Team
          </button>
        </div>
      </div>

      {showCreateTeam && (
        <div className="create-team-modal">
          <div className="modal-content">
            <h3>Create New Team</h3>
            <input
              type="text"
              placeholder="Team Name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="team-name-input"
            />
            <select 
              value={newTeamSport} 
              onChange={(e) => setNewTeamSport(e.target.value)}
              className="sport-select"
            >
              <option value="Football">Football</option>
              <option value="Basketball">Basketball</option>
            </select>
            <div className="modal-actions">
              <button onClick={handleCreateTeam} className="create-btn">Create</button>
              <button onClick={() => setShowCreateTeam(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {currentTeam && (
        <div className="team-details">
          <div className="team-info">
            <h3>{currentTeam.name}</h3>
            <div className="budget-info">
              <span>Budget: ${currentTeam.usedBudget}M / ${currentTeam.budget}M</span>
              <div className="budget-bar">
                <div 
                  className="budget-used" 
                  style={{ width: `${(currentTeam.usedBudget / currentTeam.budget) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="lineup-section">
            <h4>Starting Lineup</h4>
            <div className="players-list">
              {currentTeam.players.filter(p => p.isStarter).map(player => (
                <div key={player.id} className="player-row starter">
                  <div className="player-info">
                    <span className="player-name">{player.name}</span>
                    <span className="player-position">{player.position}</span>
                    <span className="player-team">{player.team}</span>
                  </div>
                  <div className="player-stats">
                    <span className="points">{player.points} pts</span>
                  </div>
                  <div className="player-actions">
                    <button 
                      onClick={() => handleToggleStarter(player.id)}
                      className="bench-btn"
                    >
                      Bench
                    </button>
                    <button 
                      onClick={() => handleDropPlayer(player.id)}
                      className="drop-btn"
                    >
                      Drop
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bench-section">
            <h4>Bench</h4>
            <div className="players-list">
              {currentTeam.players.filter(p => !p.isStarter).map(player => (
                <div key={player.id} className="player-row bench">
                  <div className="player-info">
                    <span className="player-name">{player.name}</span>
                    <span className="player-position">{player.position}</span>
                    <span className="player-team">{player.team}</span>
                  </div>
                  <div className="player-stats">
                    <span className="points">{player.points} pts</span>
                  </div>
                  <div className="player-actions">
                    <button 
                      onClick={() => handleToggleStarter(player.id)}
                      className="start-btn"
                    >
                      Start
                    </button>
                    <button 
                      onClick={() => handleDropPlayer(player.id)}
                      className="drop-btn"
                    >
                      Drop
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamManagement
