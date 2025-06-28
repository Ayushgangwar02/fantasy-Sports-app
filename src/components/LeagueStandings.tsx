import React, { useState } from 'react'

interface LeagueTeam {
  id: number
  teamName: string
  ownerName: string
  wins: number
  losses: number
  points: number
  pointsAgainst: number
}

interface League {
  id: number
  name: string
  sport: string
  teams: LeagueTeam[]
}

const LeagueStandings: React.FC = () => {
  const [selectedLeague, setSelectedLeague] = useState<number>(1)

  const leagues: League[] = [
    {
      id: 1,
      name: 'Championship League',
      sport: 'Football',
      teams: [
        { id: 1, teamName: 'Thunder Bolts', ownerName: 'You', wins: 8, losses: 2, points: 1245, pointsAgainst: 1089 },
        { id: 2, teamName: 'Lightning Strikes', ownerName: 'Mike Johnson', wins: 7, losses: 3, points: 1198, pointsAgainst: 1134 },
        { id: 3, teamName: 'Storm Chasers', ownerName: 'Sarah Wilson', wins: 6, losses: 4, points: 1156, pointsAgainst: 1167 },
        { id: 4, teamName: 'Wind Runners', ownerName: 'Alex Chen', wins: 6, losses: 4, points: 1134, pointsAgainst: 1145 },
        { id: 5, teamName: 'Rain Makers', ownerName: 'Jessica Brown', wins: 5, losses: 5, points: 1098, pointsAgainst: 1178 },
        { id: 6, teamName: 'Cloud Busters', ownerName: 'David Lee', wins: 4, losses: 6, points: 1067, pointsAgainst: 1203 },
        { id: 7, teamName: 'Sky Warriors', ownerName: 'Emma Davis', wins: 3, losses: 7, points: 1034, pointsAgainst: 1234 },
        { id: 8, teamName: 'Hurricane Force', ownerName: 'Ryan Miller', wins: 1, losses: 9, points: 987, pointsAgainst: 1298 },
      ]
    },
    {
      id: 2,
      name: 'Elite Basketball League',
      sport: 'Basketball',
      teams: [
        { id: 9, teamName: 'Ice Dragons', ownerName: 'You', wins: 6, losses: 4, points: 987, pointsAgainst: 923 },
        { id: 10, teamName: 'Fire Hawks', ownerName: 'Tom Anderson', wins: 7, losses: 3, points: 1034, pointsAgainst: 945 },
        { id: 11, teamName: 'Steel Eagles', ownerName: 'Lisa Garcia', wins: 5, losses: 5, points: 956, pointsAgainst: 967 },
        { id: 12, teamName: 'Golden Lions', ownerName: 'Mark Thompson', wins: 4, losses: 6, points: 923, pointsAgainst: 989 },
        { id: 13, teamName: 'Silver Wolves', ownerName: 'Amy Rodriguez', wins: 3, losses: 7, points: 889, pointsAgainst: 1012 },
        { id: 14, teamName: 'Bronze Tigers', ownerName: 'Chris Martinez', wins: 2, losses: 8, points: 845, pointsAgainst: 1067 },
      ]
    }
  ]

  const currentLeague = leagues.find(league => league.id === selectedLeague)
  
  const sortedTeams = currentLeague?.teams.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    return b.points - a.points
  }) || []

  const getWinPercentage = (wins: number, losses: number) => {
    const total = wins + losses
    return total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0'
  }

  const getPositionColor = (index: number) => {
    if (index === 0) return '#FFD700' // Gold
    if (index === 1) return '#C0C0C0' // Silver
    if (index === 2) return '#CD7F32' // Bronze
    return '#f0f0f0'
  }

  const upcomingMatchups = [
    { week: 'Week 11', team1: 'Thunder Bolts', team2: 'Lightning Strikes', date: 'Sunday, Dec 3' },
    { week: 'Week 11', team1: 'Storm Chasers', team2: 'Wind Runners', date: 'Sunday, Dec 3' },
    { week: 'Week 11', team1: 'Rain Makers', team2: 'Cloud Busters', date: 'Sunday, Dec 3' },
  ]

  return (
    <div className="league-standings">
      <div className="league-header">
        <h2>League Standings</h2>
        <select 
          value={selectedLeague} 
          onChange={(e) => setSelectedLeague(Number(e.target.value))}
          className="league-select"
        >
          {leagues.map(league => (
            <option key={league.id} value={league.id}>
              {league.name} ({league.sport})
            </option>
          ))}
        </select>
      </div>

      {currentLeague && (
        <div className="league-content">
          <div className="standings-table">
            <h3>{currentLeague.name} Standings</h3>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team</th>
                  <th>Owner</th>
                  <th>Record</th>
                  <th>Win %</th>
                  <th>Points For</th>
                  <th>Points Against</th>
                  <th>Diff</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((team, index) => (
                  <tr 
                    key={team.id} 
                    className={team.ownerName === 'You' ? 'my-team' : ''}
                  >
                    <td>
                      <div 
                        className="rank-badge"
                        style={{ backgroundColor: getPositionColor(index) }}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="team-name">{team.teamName}</td>
                    <td className="owner-name">{team.ownerName}</td>
                    <td className="record">{team.wins}-{team.losses}</td>
                    <td className="win-percentage">{getWinPercentage(team.wins, team.losses)}%</td>
                    <td className="points-for">{team.points}</td>
                    <td className="points-against">{team.pointsAgainst}</td>
                    <td className={`point-diff ${team.points - team.pointsAgainst >= 0 ? 'positive' : 'negative'}`}>
                      {team.points - team.pointsAgainst > 0 ? '+' : ''}{team.points - team.pointsAgainst}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="league-info">
            <div className="upcoming-matchups">
              <h3>Upcoming Matchups</h3>
              <div className="matchups-list">
                {upcomingMatchups.map((matchup, index) => (
                  <div key={index} className="matchup-card">
                    <div className="matchup-week">{matchup.week}</div>
                    <div className="matchup-teams">
                      <span className="team">{matchup.team1}</span>
                      <span className="vs">vs</span>
                      <span className="team">{matchup.team2}</span>
                    </div>
                    <div className="matchup-date">{matchup.date}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="league-stats">
              <h3>League Stats</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Teams</span>
                  <span className="stat-value">{currentLeague.teams.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Highest Score</span>
                  <span className="stat-value">{Math.max(...currentLeague.teams.map(t => t.points))}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average Score</span>
                  <span className="stat-value">
                    {Math.round(currentLeague.teams.reduce((sum, t) => sum + t.points, 0) / currentLeague.teams.length)}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Your Rank</span>
                  <span className="stat-value">
                    {sortedTeams.findIndex(t => t.ownerName === 'You') + 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeagueStandings
