import express from 'express';
import Team from '../models/Team';
import Player from '../models/Player';
import League from '../models/League';
import Match from '../models/Match';
import Trade from '../models/Trade';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get league analytics
router.get('/league/:leagueId', auth, async (req, res) => {
  try {
    const { leagueId } = req.params;
    
    // Get league basic info
    const league = await League.findById(leagueId);
    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }
    
    // Get all teams in league
    const teams = await Team.find({ league: leagueId }).populate('owner', 'firstName lastName username');
    
    // Calculate team standings and stats
    const standings = teams.map(team => {
      const totalPoints = team.weeklyScores.reduce((sum, week) => sum + week.totalPoints, 0);
      const gamesPlayed = team.weeklyScores.length;
      
      return {
        teamId: team._id,
        teamName: team.name,
        owner: team.owner,
        wins: team.wins,
        losses: team.losses,
        ties: team.ties,
        totalPoints,
        averagePoints: gamesPlayed > 0 ? totalPoints / gamesPlayed : 0,
        highestScore: Math.max(...team.weeklyScores.map(w => w.totalPoints), 0),
        lowestScore: Math.min(...team.weeklyScores.map(w => w.totalPoints), 999),
        rosterValue: team.roster.reduce((sum, player) => sum + player.salary, 0)
      };
    }).sort((a, b) => {
      // Sort by wins, then by total points
      if (a.wins !== b.wins) return b.wins - a.wins;
      return b.totalPoints - a.totalPoints;
    });
    
    // League-wide statistics
    const totalTrades = await Trade.countDocuments({ league: leagueId });
    const activeTrades = await Trade.countDocuments({ league: leagueId, status: 'pending' });
    
    const leagueStats = {
      totalTeams: teams.length,
      averageScore: standings.reduce((sum, team) => sum + team.averagePoints, 0) / standings.length,
      highestTeamScore: Math.max(...standings.map(t => t.highestScore)),
      lowestTeamScore: Math.min(...standings.map(t => t.lowestScore)),
      totalTrades,
      activeTrades,
      mostActiveTrader: standings.reduce((prev, current) => 
        prev.totalPoints > current.totalPoints ? prev : current
      ).teamName
    };
    
    res.json({
      success: true,
      analytics: {
        league: {
          id: league._id,
          name: league.name,
          sport: league.sport,
          currentWeek: league.currentWeek
        },
        standings,
        leagueStats,
        powerRankings: standings.slice(0, 10) // Top 10 teams
      }
    });
  } catch (error) {
    console.error('Error fetching league analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch league analytics'
    });
  }
});

// Get team analytics
router.get('/team/:teamId', auth, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await Team.findById(teamId)
      .populate('roster.playerId', 'name position team fantasyValue')
      .populate('league', 'name sport currentWeek');
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Calculate team performance metrics
    const weeklyPerformance = team.weeklyScores.map((week, index) => ({
      week: index + 1,
      totalPoints: week.totalPoints,
      projectedPoints: week.projectedPoints,
      difference: week.totalPoints - week.projectedPoints,
      rank: week.rank || 0
    }));
    
    // Position analysis
    const positionBreakdown = team.roster.reduce((acc, player) => {
      const pos = player.position;
      if (!acc[pos]) {
        acc[pos] = { count: 0, totalValue: 0, averageValue: 0 };
      }
      acc[pos].count++;
      acc[pos].totalValue += player.salary;
      acc[pos].averageValue = acc[pos].totalValue / acc[pos].count;
      return acc;
    }, {} as Record<string, any>);
    
    // Strength analysis
    const strengthsWeaknesses = {
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
    
    // Find strongest and weakest positions by average value
    const positions = Object.entries(positionBreakdown);
    if (positions.length > 0) {
      const sortedByValue = positions.sort((a, b) => b[1].averageValue - a[1].averageValue);
      strengthsWeaknesses.strengths = sortedByValue.slice(0, 2).map(([pos]) => pos);
      strengthsWeaknesses.weaknesses = sortedByValue.slice(-2).map(([pos]) => pos);
    }
    
    res.json({
      success: true,
      analytics: {
        team: {
          id: team._id,
          name: team.name,
          record: `${team.wins}-${team.losses}-${team.ties}`,
          totalPoints: team.weeklyScores.reduce((sum, week) => sum + week.totalPoints, 0),
          averagePoints: team.weeklyScores.length > 0 
            ? team.weeklyScores.reduce((sum, week) => sum + week.totalPoints, 0) / team.weeklyScores.length 
            : 0
        },
        weeklyPerformance,
        positionBreakdown,
        strengthsWeaknesses,
        rosterAnalysis: {
          totalValue: team.roster.reduce((sum, player) => sum + player.salary, 0),
          averageValue: team.roster.length > 0 
            ? team.roster.reduce((sum, player) => sum + player.salary, 0) / team.roster.length 
            : 0,
          rosterCount: team.rosterCount,
          benchStrength: team.roster.filter(p => !p.isStarter).length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching team analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team analytics'
    });
  }
});

// Get player analytics
router.get('/player/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { weeks = 5 } = req.query; // Default to last 5 weeks
    
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }
    
    // Get recent match performances
    const recentMatches = await Match.find({
      'playerStats.playerId': playerId,
      status: 'completed'
    })
    .sort({ gameDate: -1 })
    .limit(parseInt(weeks as string));
    
    const performances = recentMatches.map(match => {
      const playerStat = match.playerStats.find(stat => stat.playerId === playerId);
      return {
        matchId: match._id,
        opponent: match.homeTeam.id === player.team ? match.awayTeam.name : match.homeTeam.name,
        date: match.gameDate,
        fantasyPoints: playerStat?.fantasyPoints || 0,
        stats: playerStat?.stats || {}
      };
    });
    
    // Calculate trends
    const avgFantasyPoints = performances.length > 0 
      ? performances.reduce((sum, perf) => sum + perf.fantasyPoints, 0) / performances.length 
      : 0;
    
    const trend = performances.length >= 2 
      ? performances[0].fantasyPoints - performances[performances.length - 1].fantasyPoints 
      : 0;
    
    res.json({
      success: true,
      analytics: {
        player: {
          id: player._id,
          name: player.name,
          position: player.position,
          team: player.team,
          fantasyValue: player.fantasyValue
        },
        recentPerformances: performances,
        trends: {
          averageFantasyPoints: avgFantasyPoints,
          trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
          trendValue: trend
        },
        projections: {
          nextWeek: avgFantasyPoints * 1.1, // Simple projection
          restOfSeason: avgFantasyPoints * 0.95
        }
      }
    });
  } catch (error) {
    console.error('Error fetching player analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch player analytics'
    });
  }
});

// Get league trends and insights
router.get('/trends/:leagueId', auth, async (req, res) => {
  try {
    const { leagueId } = req.params;
    
    // Get top performers this week
    const teams = await Team.find({ league: leagueId });
    const currentWeekScores = teams.map(team => {
      const currentWeek = team.weeklyScores[team.weeklyScores.length - 1];
      return {
        teamId: team._id,
        teamName: team.name,
        score: currentWeek?.totalPoints || 0
      };
    }).sort((a, b) => b.score - a.score);
    
    // Get most traded players
    const trades = await Trade.find({ 
      league: leagueId, 
      status: 'accepted',
      processedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    
    const playerTradeCount = new Map();
    trades.forEach(trade => {
      [...trade.offeredPlayers, ...trade.requestedPlayers].forEach(player => {
        playerTradeCount.set(player.playerId, (playerTradeCount.get(player.playerId) || 0) + 1);
      });
    });
    
    const mostTradedPlayers = Array.from(playerTradeCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([playerId, count]) => ({ playerId, tradeCount: count }));
    
    res.json({
      success: true,
      trends: {
        topPerformersThisWeek: currentWeekScores.slice(0, 5),
        mostTradedPlayers,
        tradeActivity: {
          totalTrades: trades.length,
          averageTradeValue: trades.reduce((sum, trade) => 
            sum + (trade.tradeValue.initiatorValue + trade.tradeValue.recipientValue) / 2, 0
          ) / trades.length || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trends'
    });
  }
});

export default router;
