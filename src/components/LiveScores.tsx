import React, { useState, useEffect } from 'react';
import { matchesAPI, type Match } from '../services/api';

const LiveScores: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSport, setSelectedSport] = useState('football');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchLiveScores = async () => {
    try {
      setError('');
      const response = await matchesAPI.getLiveScores({
        sport: selectedSport
      });
      setMatches(response.matches);
    } catch (err) {
      console.error('Error fetching live scores:', err);
      setError('Failed to load live scores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveScores();
    
    // Set up auto-refresh for live games
    const interval = setInterval(fetchLiveScores, 30000); // Refresh every 30 seconds
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedSport]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return '#ff4444';
      case 'completed': return '#28a745';
      case 'scheduled': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const formatTime = (timeRemaining?: string) => {
    if (!timeRemaining) return '';
    return timeRemaining;
  };

  const getQuarterText = (quarter?: number, sport?: string) => {
    if (!quarter) return '';
    
    switch (sport) {
      case 'football':
        return quarter <= 4 ? `Q${quarter}` : 'OT';
      case 'basketball':
        return quarter <= 4 ? `Q${quarter}` : 'OT';
      case 'hockey':
        return quarter <= 3 ? `P${quarter}` : 'OT';
      default:
        return `Q${quarter}`;
    }
  };

  if (loading) {
    return (
      <div className="live-scores">
        <div className="live-scores-header">
          <h2>Live Scores</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading live scores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-scores">
      <div className="live-scores-header">
        <h2>Live Scores</h2>
        <div className="sport-selector">
          <select 
            value={selectedSport} 
            onChange={(e) => setSelectedSport(e.target.value)}
            className="sport-select"
          >
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="baseball">Baseball</option>
            <option value="hockey">Hockey</option>
          </select>
          <button 
            onClick={fetchLiveScores}
            className="refresh-btn"
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="scores-container">
        {matches.length === 0 ? (
          <div className="no-games">
            <p>No games available for {selectedSport}</p>
          </div>
        ) : (
          matches.map((match) => (
            <div key={match._id} className={`game-card ${match.status}`}>
              <div className="game-header">
                <div className="game-status">
                  <span 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(match.status) }}
                  ></span>
                  <span className="status-text">
                    {match.status === 'live' ? 'LIVE' : match.status.toUpperCase()}
                  </span>
                  {match.status === 'live' && (
                    <span className="game-time">
                      {getQuarterText(match.quarter, match.sport)} {formatTime(match.timeRemaining)}
                    </span>
                  )}
                </div>
                <div className="game-league">
                  {match.league} {match.week && `Week ${match.week}`}
                </div>
              </div>

              <div className="teams-container">
                <div className="team away-team">
                  <div className="team-info">
                    <span className="team-name">{match.awayTeam.name}</span>
                    <span className="team-abbr">{match.awayTeam.abbreviation}</span>
                  </div>
                  <div className="team-score">{match.score.away}</div>
                </div>

                <div className="vs-divider">@</div>

                <div className="team home-team">
                  <div className="team-info">
                    <span className="team-name">{match.homeTeam.name}</span>
                    <span className="team-abbr">{match.homeTeam.abbreviation}</span>
                  </div>
                  <div className="team-score">{match.score.home}</div>
                </div>
              </div>

              <div className="game-footer">
                <div className="game-date">
                  {new Date(match.gameDate).toLocaleDateString()} {' '}
                  {new Date(match.gameDate).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                {match.playerStats && match.playerStats.length > 0 && (
                  <button className="view-stats-btn">
                    View Stats
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {matches.length > 0 && (
        <div className="auto-refresh-info">
          <span>🔄 Auto-refreshing every 30 seconds</span>
        </div>
      )}
    </div>
  );
};

export default LiveScores;
