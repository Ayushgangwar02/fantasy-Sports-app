import React, { useState, useEffect } from 'react';
import { tradesAPI, playersAPI, type Trade, type Player } from '../services/api';

interface TradeCenterProps {
  leagueId: string;
  teamId: string;
}

const TradeCenter: React.FC<TradeCenterProps> = ({ leagueId, teamId }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [showProposeTrade, setShowProposeTrade] = useState(false);
  
  // Trade proposal state
  const [selectedTeam, setSelectedTeam] = useState('');
  const [offeredPlayers, setOfferedPlayers] = useState<string[]>([]);
  const [requestedPlayers, setRequestedPlayers] = useState<string[]>([]);
  const [tradeMessage, setTradeMessage] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetchTrades();
    fetchAvailablePlayers();
  }, [leagueId]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await tradesAPI.getLeagueTrades(leagueId, {
        status: activeTab === 'active' ? 'pending' : undefined
      });
      setTrades(response.trades);
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError('Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlayers = async () => {
    try {
      const response = await playersAPI.getPlayers({ limit: 100 });
      setAvailablePlayers(response.players);
    } catch (err) {
      console.error('Error fetching players:', err);
    }
  };

  const handleProposeTrade = async () => {
    if (!selectedTeam || offeredPlayers.length === 0 || requestedPlayers.length === 0) {
      setError('Please select teams and players for the trade');
      return;
    }

    try {
      setError('');
      await tradesAPI.proposeTrade({
        leagueId,
        recipientTeamId: selectedTeam,
        offeredPlayerIds: offeredPlayers,
        requestedPlayerIds: requestedPlayers,
        message: tradeMessage
      });
      
      setShowProposeTrade(false);
      setSelectedTeam('');
      setOfferedPlayers([]);
      setRequestedPlayers([]);
      setTradeMessage('');
      fetchTrades();
    } catch (err) {
      console.error('Error proposing trade:', err);
      setError('Failed to propose trade');
    }
  };

  const handleTradeResponse = async (tradeId: string, action: 'accept' | 'reject', reason?: string) => {
    try {
      setError('');
      await tradesAPI.respondToTrade(tradeId, action, reason);
      fetchTrades();
    } catch (err) {
      console.error('Error responding to trade:', err);
      setError('Failed to respond to trade');
    }
  };

  const handleCancelTrade = async (tradeId: string) => {
    try {
      setError('');
      await tradesAPI.cancelTrade(tradeId);
      fetchTrades();
    } catch (err) {
      console.error('Error cancelling trade:', err);
      setError('Failed to cancel trade');
    }
  };

  const getTradeStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'accepted': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'cancelled': return '#6c757d';
      case 'expired': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const getFairnessColor = (score: number) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  if (loading) {
    return (
      <div className="trade-center">
        <div className="trade-center-header">
          <h2>Trade Center</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading trades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-center">
      <div className="trade-center-header">
        <h2>Trade Center</h2>
        <button 
          className="propose-trade-btn"
          onClick={() => setShowProposeTrade(true)}
        >
          + Propose Trade
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="trade-tabs">
        <button 
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Trades
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Trade History
        </button>
      </div>

      <div className="trades-container">
        {trades.length === 0 ? (
          <div className="no-trades">
            <p>No trades found</p>
          </div>
        ) : (
          trades.map((trade) => (
            <div key={trade._id} className="trade-card">
              <div className="trade-header">
                <div className="trade-teams">
                  <span className="initiator">{trade.initiator.teamName}</span>
                  <span className="trade-arrow">⇄</span>
                  <span className="recipient">{trade.recipient.teamName}</span>
                </div>
                <div className="trade-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getTradeStatusColor(trade.status) }}
                  >
                    {trade.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="trade-details">
                <div className="trade-side">
                  <h4>{trade.initiator.teamName} Offers:</h4>
                  <div className="players-list">
                    {trade.offeredPlayers.map((player) => (
                      <div key={player.playerId} className="player-item">
                        <span className="player-name">{player.playerName}</span>
                        <span className="player-position">{player.position}</span>
                        <span className="player-value">${player.fantasyValue}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="trade-side">
                  <h4>{trade.recipient.teamName} Gets:</h4>
                  <div className="players-list">
                    {trade.requestedPlayers.map((player) => (
                      <div key={player.playerId} className="player-item">
                        <span className="player-name">{player.playerName}</span>
                        <span className="player-position">{player.position}</span>
                        <span className="player-value">${player.fantasyValue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="trade-analysis">
                <div className="trade-values">
                  <div className="value-item">
                    <span className="label">Offered Value:</span>
                    <span className="value">${trade.tradeValue.initiatorValue}</span>
                  </div>
                  <div className="value-item">
                    <span className="label">Requested Value:</span>
                    <span className="value">${trade.tradeValue.recipientValue}</span>
                  </div>
                  <div className="value-item">
                    <span className="label">Fairness Score:</span>
                    <span 
                      className="value"
                      style={{ color: getFairnessColor(trade.tradeValue.fairnessScore) }}
                    >
                      {trade.tradeValue.fairnessScore.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {trade.message && (
                <div className="trade-message">
                  <strong>Message:</strong> {trade.message}
                </div>
              )}

              <div className="trade-footer">
                <div className="trade-date">
                  Proposed: {new Date(trade.createdAt).toLocaleDateString()}
                </div>
                
                {trade.status === 'pending' && (
                  <div className="trade-actions">
                    {trade.recipient.teamId === teamId ? (
                      <>
                        <button 
                          className="accept-btn"
                          onClick={() => handleTradeResponse(trade._id, 'accept')}
                        >
                          Accept
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleTradeResponse(trade._id, 'reject', 'Not interested')}
                        >
                          Reject
                        </button>
                      </>
                    ) : trade.initiator.teamId === teamId ? (
                      <button 
                        className="cancel-btn"
                        onClick={() => handleCancelTrade(trade._id)}
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showProposeTrade && (
        <div className="modal-overlay">
          <div className="propose-trade-modal">
            <div className="modal-header">
              <h3>Propose Trade</h3>
              <button 
                className="close-btn"
                onClick={() => setShowProposeTrade(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label>Select Team to Trade With:</label>
                <select 
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose a team...</option>
                  {/* This would be populated with actual teams */}
                </select>
              </div>

              <div className="trade-builder">
                <div className="trade-side">
                  <h4>You Offer:</h4>
                  {/* Player selection would go here */}
                </div>
                
                <div className="trade-side">
                  <h4>You Request:</h4>
                  {/* Player selection would go here */}
                </div>
              </div>

              <div className="form-group">
                <label>Message (optional):</label>
                <textarea
                  value={tradeMessage}
                  onChange={(e) => setTradeMessage(e.target.value)}
                  className="form-textarea"
                  placeholder="Add a message to your trade proposal..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowProposeTrade(false)}
              >
                Cancel
              </button>
              <button 
                className="propose-btn"
                onClick={handleProposeTrade}
              >
                Propose Trade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeCenter;
