import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

interface AnalyticsProps {
  leagueId?: string;
  teamId?: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ leagueId, teamId }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');

        if (leagueId) {
          const [analyticsResponse, trendsResponse] = await Promise.all([
            analyticsAPI.getLeagueAnalytics(leagueId),
            analyticsAPI.getTrends(leagueId)
          ]);
          setAnalytics(analyticsResponse.analytics);
          setTrends(trendsResponse.trends);
        } else if (teamId) {
          const analyticsResponse = await analyticsAPI.getTeamAnalytics(teamId);
          setAnalytics(analyticsResponse.analytics);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (leagueId || teamId) {
      fetchAnalytics();
    }
  }, [leagueId, teamId]);

  if (loading) {
    return (
      <div className="analytics">
        <div className="analytics-header">
          <h2>Analytics Dashboard</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics">
        <div className="analytics-header">
          <h2>Analytics Dashboard</h2>
        </div>
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  const renderLeagueAnalytics = () => (
    <div className="league-analytics">
      <div className="analytics-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'standings' ? 'active' : ''}`}
          onClick={() => setActiveTab('standings')}
        >
          Standings
        </button>
        <button 
          className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          Trends
        </button>
      </div>

      {activeTab === 'overview' && analytics?.leagueStats && (
        <div className="overview-tab">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Teams</h3>
              <div className="stat-value">{analytics.leagueStats.totalTeams}</div>
            </div>
            <div className="stat-card">
              <h3>Average Score</h3>
              <div className="stat-value">{analytics.leagueStats.averageScore?.toFixed(1)}</div>
            </div>
            <div className="stat-card">
              <h3>Highest Score</h3>
              <div className="stat-value">{analytics.leagueStats.highestTeamScore}</div>
            </div>
            <div className="stat-card">
              <h3>Total Trades</h3>
              <div className="stat-value">{analytics.leagueStats.totalTrades}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'standings' && analytics?.standings && (
        <div className="standings-tab">
          <div className="standings-table">
            <div className="table-header">
              <div className="rank-col">Rank</div>
              <div className="team-col">Team</div>
              <div className="record-col">Record</div>
              <div className="points-col">Points</div>
              <div className="avg-col">Avg</div>
            </div>
            {analytics.standings.map((team: any, index: number) => (
              <div key={team.teamId} className="table-row">
                <div className="rank-col">{index + 1}</div>
                <div className="team-col">
                  <div className="team-name">{team.teamName}</div>
                  <div className="owner-name">{team.owner?.firstName} {team.owner?.lastName}</div>
                </div>
                <div className="record-col">
                  {team.wins}-{team.losses}-{team.ties}
                </div>
                <div className="points-col">{team.totalPoints.toFixed(1)}</div>
                <div className="avg-col">{team.averagePoints.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trends' && trends && (
        <div className="trends-tab">
          <div className="trends-section">
            <h3>Top Performers This Week</h3>
            <div className="performers-list">
              {trends.topPerformersThisWeek?.map((team: any, index: number) => (
                <div key={team.teamId} className="performer-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="team-name">{team.teamName}</span>
                  <span className="score">{team.score.toFixed(1)} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="trends-section">
            <h3>Trade Activity</h3>
            <div className="trade-stats">
              <div className="trade-stat">
                <span className="label">Total Trades:</span>
                <span className="value">{trends.tradeActivity?.totalTrades || 0}</span>
              </div>
              <div className="trade-stat">
                <span className="label">Average Trade Value:</span>
                <span className="value">{trends.tradeActivity?.averageTradeValue?.toFixed(1) || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTeamAnalytics = () => (
    <div className="team-analytics">
      {analytics?.team && (
        <div className="team-overview">
          <h3>{analytics.team.name}</h3>
          <div className="team-stats">
            <div className="stat">
              <span className="label">Record:</span>
              <span className="value">{analytics.team.record}</span>
            </div>
            <div className="stat">
              <span className="label">Total Points:</span>
              <span className="value">{analytics.team.totalPoints.toFixed(1)}</span>
            </div>
            <div className="stat">
              <span className="label">Average Points:</span>
              <span className="value">{analytics.team.averagePoints.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {analytics?.weeklyPerformance && (
        <div className="weekly-performance">
          <h4>Weekly Performance</h4>
          <div className="performance-chart">
            {analytics.weeklyPerformance.map((week: any) => (
              <div key={week.week} className="week-bar">
                <div className="week-label">W{week.week}</div>
                <div 
                  className="score-bar"
                  style={{ 
                    height: `${Math.max(week.totalPoints / 200 * 100, 10)}%`,
                    backgroundColor: week.totalPoints > week.projectedPoints ? '#28a745' : '#dc3545'
                  }}
                  title={`${week.totalPoints.toFixed(1)} pts`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics?.positionBreakdown && (
        <div className="position-breakdown">
          <h4>Position Analysis</h4>
          <div className="position-grid">
            {Object.entries(analytics.positionBreakdown).map(([position, data]: [string, any]) => (
              <div key={position} className="position-card">
                <h5>{position}</h5>
                <div className="position-stats">
                  <div className="stat">
                    <span className="label">Count:</span>
                    <span className="value">{data.count}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Avg Value:</span>
                    <span className="value">{data.averageValue.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        {analytics?.league && (
          <div className="league-info">
            <span>{analytics.league.name} - Week {analytics.league.currentWeek}</span>
          </div>
        )}
      </div>

      <div className="analytics-content">
        {leagueId ? renderLeagueAnalytics() : renderTeamAnalytics()}
      </div>
    </div>
  );
};

export default Analytics;
