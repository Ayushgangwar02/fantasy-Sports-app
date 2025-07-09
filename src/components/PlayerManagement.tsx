import React, { useState, useEffect } from 'react'
import { playersAPI, type Player } from '../services/api'

const PlayerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSport, setSelectedSport] = useState('football')
  const [selectedPosition, setSelectedPosition] = useState('all')
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  })

  // Use real API to fetch players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await playersAPI.getPlayers({
          page: pagination.currentPage,
          limit: pagination.limit,
          sport: selectedSport,
          position: selectedPosition !== 'all' ? selectedPosition : undefined,
          name: searchTerm || undefined
        })

        setPlayers(response.players)
        setPagination(prev => ({
          ...prev,
          totalPages: response.pagination?.totalPages || 1,
          totalCount: response.pagination?.totalCount || 0
        }))
      } catch (err) {
        console.error('Error fetching players:', err)
        setError('Failed to load players. Please try again.')
        // Fallback to empty array on error
        setPlayers([])
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [selectedSport, selectedPosition, searchTerm, pagination.currentPage, pagination.limit])

  const handleAddPlayer = (playerId: string) => {
    console.log(`Adding player ${playerId} to team`)
    // TODO: Implement add player to team functionality
  }

  const getStatusColor = (player: Player) => {
    if (player.isInjured) return '#F44336'
    if (!player.isActive) return '#757575'
    return '#4CAF50' // Available
  }

  const getPlayerStatus = (player: Player) => {
    if (player.isInjured) return 'INJURED'
    if (!player.isActive) return 'INACTIVE'
    return 'AVAILABLE'
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  if (loading && players.length === 0) {
    return (
      <div className="player-management">
        <div className="player-header">
          <h2>Player Management</h2>
          <p>Loading players...</p>
        </div>
        <div className="loading-spinner">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="player-management">
      <div className="player-header">
        <h2>Player Management</h2>
        <p>Search, filter, and manage your fantasy players</p>
        {pagination.totalCount > 0 && (
          <p className="text-sm text-gray-600">
            Showing {players.length} of {pagination.totalCount} players
          </p>
        )}
      </div>

      {error && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="player-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search players by name..."
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
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="baseball">Baseball</option>
            <option value="hockey">Hockey</option>
            <option value="soccer">Soccer</option>
          </select>

          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Positions</option>
            {selectedSport === 'football' && (
              <>
                <option value="QB">QB</option>
                <option value="RB">RB</option>
                <option value="WR">WR</option>
                <option value="TE">TE</option>
                <option value="K">K</option>
                <option value="DEF">DEF</option>
              </>
            )}
            {selectedSport === 'basketball' && (
              <>
                <option value="PG">PG</option>
                <option value="SG">SG</option>
                <option value="SF">SF</option>
                <option value="PF">PF</option>
                <option value="C">C</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="players-grid">
        {players.map(player => (
          <div key={player._id} className="player-card">
            <div className="player-info">
              <h3>{player.name}</h3>
              <div className="player-details">
                <span className="position">{player.position}</span>
                <span className="team">{player.teamAbbreviation || player.team}</span>
                <span className="sport">{player.sport}</span>
                {player.jerseyNumber && (
                  <span className="jersey">#{player.jerseyNumber}</span>
                )}
              </div>
            </div>

            <div className="player-stats">
              <div className="stat">
                <span className="stat-label">Fantasy Value</span>
                <span className="stat-value">{player.fantasyValue}</span>
              </div>
              {player.currentSeasonStats?.fantasyPoints && (
                <div className="stat">
                  <span className="stat-label">Fantasy Points</span>
                  <span className="stat-value">{player.currentSeasonStats.fantasyPoints.toFixed(1)}</span>
                </div>
              )}
              {player.currentSeasonStats?.averageFantasyPoints && (
                <div className="stat">
                  <span className="stat-label">Avg Points</span>
                  <span className="stat-value">{player.currentSeasonStats.averageFantasyPoints.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="player-actions">
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(player) }}
              >
                {getPlayerStatus(player)}
              </span>

              {player.isActive && !player.isInjured && (
                <button
                  className="add-player-btn"
                  onClick={() => handleAddPlayer(player._id)}
                >
                  Add to Team
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="pagination-btn"
          >
            Previous
          </button>

          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {players.length === 0 && !loading && (
        <div className="no-players">
          <p>No players found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default PlayerManagement
