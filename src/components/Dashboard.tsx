import React from 'react'

const Dashboard: React.FC = () => {
  const myTeams = [
    { id: 1, name: 'Thunder Bolts', sport: 'Football', record: '8-2', points: 1245 },
    { id: 2, name: 'Ice Dragons', sport: 'Basketball', record: '6-4', points: 987 },
  ]

  const recentActivity = [
    { id: 1, action: 'Traded', player: 'Tom Brady', time: '2 hours ago' },
    { id: 2, action: 'Added', player: 'LeBron James', time: '1 day ago' },
    { id: 3, action: 'Dropped', player: 'Aaron Rodgers', time: '2 days ago' },
  ]

  const upcomingMatchups = [
    { id: 1, opponent: 'Lightning Strikes', date: 'Sunday, Dec 3', sport: 'Football' },
    { id: 2, opponent: 'Fire Hawks', date: 'Monday, Dec 4', sport: 'Basketball' },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome to Your Fantasy Dashboard</h2>
        <p>Manage your teams, track performance, and stay ahead of the competition!</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>My Teams</h3>
          <div className="teams-list">
            {myTeams.map(team => (
              <div key={team.id} className="team-item">
                <div className="team-info">
                  <h4>{team.name}</h4>
                  <span className="sport-badge">{team.sport}</span>
                </div>
                <div className="team-stats">
                  <span className="record">Record: {team.record}</span>
                  <span className="points">Points: {team.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <span className="action">{activity.action}</span>
                <span className="player">{activity.player}</span>
                <span className="time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Upcoming Matchups</h3>
          <div className="matchups-list">
            {upcomingMatchups.map(matchup => (
              <div key={matchup.id} className="matchup-item">
                <div className="matchup-info">
                  <h4>vs {matchup.opponent}</h4>
                  <span className="sport-badge">{matchup.sport}</span>
                </div>
                <span className="matchup-date">{matchup.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Quick Stats</h3>
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-value">2</span>
              <span className="stat-label">Active Teams</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">24</span>
              <span className="stat-label">Total Players</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">3</span>
              <span className="stat-label">Leagues</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">1,245</span>
              <span className="stat-label">Total Points</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
