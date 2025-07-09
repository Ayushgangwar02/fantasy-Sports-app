import React, { useState, useEffect } from 'react'
import { teamsAPI, type Team } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const TeamManagement: React.FC = () => {
  const { user } = useAuth()
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamSport, setNewTeamSport] = useState('football')

  // Fetch user's teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await teamsAPI.getTeams()
        setTeams(response.teams || [])
        if (response.teams && response.teams.length > 0) {
          setSelectedTeamId(response.teams[0]._id)
        }
      } catch (err) {
        console.error('Error fetching teams:', err)
        setError('Failed to load teams. Please try again.')
        setTeams([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTeams()
    }
  }, [user])

  const currentTeam = teams.find(team => team._id === selectedTeamId)

  const handleToggleStarter = async (playerId: string) => {
    if (!currentTeam) return

    try {
      // Find the roster entry for this player
      const rosterEntry = currentTeam.roster.find(r => r.playerId === playerId)
      if (!rosterEntry) return

      // Update the team roster
      await teamsAPI.updateTeam(currentTeam._id, {
        name: currentTeam.name, // Required field
        description: currentTeam.description
      })

      // Note: The actual roster update might need a separate API endpoint
      // For now, we'll refresh the data
      const response = await teamsAPI.getTeams()
      setTeams(response.teams || [])
    } catch (err) {
      console.error('Error toggling starter status:', err)
      setError('Failed to update player status')
    }
  }

  const handleDropPlayer = async (playerId: string) => {
    if (!currentTeam) return

    try {
      await teamsAPI.removePlayerFromTeam(currentTeam._id, playerId)

      // Refresh teams data
      const response = await teamsAPI.getTeams()
      setTeams(response.teams || [])
    } catch (err) {
      console.error('Error dropping player:', err)
      setError('Failed to drop player')
    }
  }

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return

    try {
      setError('')
      await teamsAPI.createTeam({
        name: newTeamName.trim(),
        description: `${newTeamSport} team`,
        league: 'default-league' // You might want to make this configurable
      })

      setNewTeamName('')
      setShowCreateTeam(false)

      // Refresh teams data
      const response = await teamsAPI.getTeams()
      setTeams(response.teams || [])

      // Select the new team if it's the first one
      if (response.teams && response.teams.length === 1) {
        setSelectedTeamId(response.teams[0]._id)
      }
    } catch (err) {
      console.error('Error creating team:', err)
      setError('Failed to create team')
    }
  }

  if (loading) {
    return (
      <div className="team-management">
        <div className="team-header">
          <h2>Team Management</h2>
          <p>Loading teams...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="team-management">
        <div className="team-header">
          <h2>Team Management</h2>
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="team-management">
      <div className="team-header">
        <h2>Team Management</h2>
        <div className="team-controls">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="team-select"
          >
            <option value="">Select a team</option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>
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
              <span>Budget: ${currentTeam.budget - currentTeam.remainingBudget}M / ${currentTeam.budget}M</span>
              <div className="budget-bar">
                <div
                  className="budget-used"
                  style={{ width: `${((currentTeam.budget - currentTeam.remainingBudget) / currentTeam.budget) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="team-stats">
              <p>Record: {currentTeam.wins}-{currentTeam.losses}-{currentTeam.ties}</p>
              <p>Total Points: {currentTeam.totalPoints}</p>
              <p>Roster Size: {currentTeam.rosterCount}/{currentTeam.maxRosterSize}</p>
            </div>
          </div>

          <div className="roster-section">
            <h4>Team Roster</h4>
            <div className="players-list">
              {currentTeam.roster.length === 0 ? (
                <p>No players in roster. Add players to get started!</p>
              ) : (
                currentTeam.roster.map(rosterEntry => (
                  <div key={rosterEntry.playerId} className={`player-row ${rosterEntry.isStarter ? 'starter' : 'bench'}`}>
                    <div className="player-info">
                      <span className="player-name">Player ID: {rosterEntry.playerId}</span>
                      <span className="player-position">{rosterEntry.position}</span>
                      <span className="player-status">{rosterEntry.isStarter ? 'Starter' : 'Bench'}</span>
                    </div>
                    <div className="player-stats">
                      <span className="salary">${rosterEntry.salary}M</span>
                      <span className="acquisition">{rosterEntry.acquisitionType}</span>
                    </div>
                    <div className="player-actions">
                      <button
                        onClick={() => handleToggleStarter(rosterEntry.playerId)}
                        className={rosterEntry.isStarter ? "bench-btn" : "start-btn"}
                      >
                        {rosterEntry.isStarter ? 'Bench' : 'Start'}
                      </button>
                      <button
                        onClick={() => handleDropPlayer(rosterEntry.playerId)}
                        className="drop-btn"
                      >
                        Drop
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamManagement
