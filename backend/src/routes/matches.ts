import express from 'express';
import Match from '../models/Match';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get live scores for current week
router.get('/live', async (req, res) => {
  try {
    const { sport, league, week } = req.query;
    
    const query: any = {
      status: { $in: ['live', 'scheduled'] }
    };
    
    if (sport) query.sport = sport;
    if (league) query.league = league;
    if (week) query.week = parseInt(week as string);
    
    // Get games for today and next 7 days
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    query.gameDate = { $gte: today, $lte: nextWeek };
    
    const matches = await Match.find(query)
      .sort({ gameDate: 1 })
      .limit(50);
    
    res.json({
      success: true,
      matches,
      count: matches.length
    });
  } catch (error) {
    console.error('Error fetching live scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live scores'
    });
  }
});

// Get match details by ID
router.get('/:matchId', async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }
    
    res.json({
      success: true,
      match
    });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match details'
    });
  }
});

// Get matches by date range
router.get('/schedule/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    const { startDate, endDate, team } = req.query;
    
    const query: any = { sport };
    
    if (startDate && endDate) {
      query.gameDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    if (team) {
      query.$or = [
        { 'homeTeam.abbreviation': team },
        { 'awayTeam.abbreviation': team }
      ];
    }
    
    const matches = await Match.find(query)
      .sort({ gameDate: 1 })
      .limit(100);
    
    res.json({
      success: true,
      matches,
      count: matches.length
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule'
    });
  }
});

// Get player stats from matches
router.get('/:matchId/stats', async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }
    
    res.json({
      success: true,
      playerStats: match.playerStats,
      teamStats: match.teamStats
    });
  } catch (error) {
    console.error('Error fetching match stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match statistics'
    });
  }
});

// Update match (admin only)
router.put('/:matchId', authenticateToken, async (req, res) => {
  try {
    // In a real app, you'd check if user is admin
    const match = await Match.findByIdAndUpdate(
      req.params.matchId,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }
    
    res.json({
      success: true,
      match
    });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update match'
    });
  }
});

// Get weekly highlights
router.get('/highlights/:sport/:week', async (req, res) => {
  try {
    const { sport, week } = req.params;
    
    const matches = await Match.find({
      sport,
      week: parseInt(week),
      status: 'completed',
      highlights: { $exists: true, $ne: [] }
    }).select('highlights homeTeam awayTeam gameDate');
    
    const allHighlights = matches.flatMap(match => 
      match.highlights.map(highlight => ({
        ...highlight,
        matchId: match._id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        gameDate: match.gameDate
      }))
    );
    
    // Sort by timestamp, most recent first
    allHighlights.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    res.json({
      success: true,
      highlights: allHighlights.slice(0, 20), // Top 20 highlights
      count: allHighlights.length
    });
  } catch (error) {
    console.error('Error fetching highlights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch highlights'
    });
  }
});

export default router;
