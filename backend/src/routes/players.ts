import express from 'express';
import Player from '../models/Player.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validatePlayerSearch, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/players
// @desc    Get players with filtering and pagination
// @access  Public
router.get('/', validatePlayerSearch, optionalAuth, async (req, res) => {
  try {
    const {
      sport,
      position,
      team,
      name,
      isActive = true,
      isInjured,
      page = 1,
      limit = 20,
      sortBy = 'fantasyValue',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (sport) filter.sport = sport;
    if (position) filter.position = new RegExp(position as string, 'i');
    if (team) filter.team = new RegExp(team as string, 'i');
    if (name) filter.name = new RegExp(name as string, 'i');
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isInjured !== undefined) filter.isInjured = isInjured === 'true';

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const [players, totalCount] = await Promise.all([
      Player.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select('-recentNews -upcomingGames'), // Exclude large fields for list view
      Player.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / Number(limit));
    const hasNextPage = Number(page) < totalPages;
    const hasPrevPage = Number(page) > 1;

    res.json({
      players,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: Number(limit)
      },
      filters: {
        sport,
        position,
        team,
        name,
        isActive,
        isInjured
      }
    });
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({
      error: 'Failed to fetch players',
      message: 'An error occurred while fetching players'
    });
  }
});

// @route   GET /api/players/:id
// @desc    Get single player by ID
// @access  Public
router.get('/:id', validateObjectId('id'), optionalAuth, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({
        error: 'Player not found',
        message: 'Player does not exist'
      });
    }

    res.json({
      player
    });
  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({
      error: 'Failed to fetch player',
      message: 'An error occurred while fetching player details'
    });
  }
});

// @route   GET /api/players/search/:query
// @desc    Search players by name
// @access  Public
router.get('/search/:query', optionalAuth, async (req, res) => {
  try {
    const { query } = req.params;
    const { sport, limit = 10 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        error: 'Invalid search query',
        message: 'Search query must be at least 2 characters long'
      });
    }

    // Build filter
    const filter: any = {
      $or: [
        { name: new RegExp(query, 'i') },
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') }
      ],
      isActive: true
    };

    if (sport) {
      filter.sport = sport;
    }

    const players = await Player.find(filter)
      .sort({ fantasyValue: -1 })
      .limit(Number(limit))
      .select('name firstName lastName sport position team teamAbbreviation fantasyValue isInjured injuryStatus');

    res.json({
      players,
      query,
      count: players.length
    });
  } catch (error) {
    console.error('Search players error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'An error occurred while searching players'
    });
  }
});

// @route   GET /api/players/sport/:sport
// @desc    Get players by sport
// @access  Public
router.get('/sport/:sport', optionalAuth, async (req, res) => {
  try {
    const { sport } = req.params;
    const { position, team, limit = 50 } = req.query;

    const validSports = ['football', 'basketball', 'baseball', 'hockey', 'soccer'];
    if (!validSports.includes(sport)) {
      return res.status(400).json({
        error: 'Invalid sport',
        message: 'Sport must be one of: ' + validSports.join(', ')
      });
    }

    // Build filter
    const filter: any = { sport, isActive: true };
    if (position) filter.position = position;
    if (team) filter.team = new RegExp(team as string, 'i');

    const players = await Player.find(filter)
      .sort({ fantasyValue: -1 })
      .limit(Number(limit))
      .select('name sport position team teamAbbreviation fantasyValue currentSeasonStats isInjured injuryStatus');

    res.json({
      players,
      sport,
      count: players.length
    });
  } catch (error) {
    console.error('Get players by sport error:', error);
    res.status(500).json({
      error: 'Failed to fetch players',
      message: 'An error occurred while fetching players by sport'
    });
  }
});

// @route   GET /api/players/team/:team
// @desc    Get players by team
// @access  Public
router.get('/team/:team', optionalAuth, async (req, res) => {
  try {
    const { team } = req.params;
    const { sport, position } = req.query;

    // Build filter
    const filter: any = {
      $or: [
        { team: new RegExp(team, 'i') },
        { teamAbbreviation: new RegExp(team, 'i') }
      ],
      isActive: true
    };

    if (sport) filter.sport = sport;
    if (position) filter.position = position;

    const players = await Player.find(filter)
      .sort({ position: 1, fantasyValue: -1 })
      .select('name sport position team teamAbbreviation jerseyNumber fantasyValue currentSeasonStats isInjured injuryStatus');

    res.json({
      players,
      team,
      count: players.length
    });
  } catch (error) {
    console.error('Get players by team error:', error);
    res.status(500).json({
      error: 'Failed to fetch players',
      message: 'An error occurred while fetching players by team'
    });
  }
});

// @route   GET /api/players/:id/stats
// @desc    Get player statistics
// @access  Public
router.get('/:id/stats', validateObjectId('id'), optionalAuth, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .select('name sport position team currentSeasonStats previousSeasonStats careerStats');

    if (!player) {
      return res.status(404).json({
        error: 'Player not found',
        message: 'Player does not exist'
      });
    }

    res.json({
      player: {
        id: player._id,
        name: player.name,
        sport: player.sport,
        position: player.position,
        team: player.team
      },
      stats: {
        currentSeason: player.currentSeasonStats,
        previousSeason: player.previousSeasonStats,
        career: player.careerStats
      }
    });
  } catch (error) {
    console.error('Get player stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch player stats',
      message: 'An error occurred while fetching player statistics'
    });
  }
});

// @route   GET /api/players/:id/news
// @desc    Get player news
// @access  Public
router.get('/:id/news', validateObjectId('id'), optionalAuth, async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const player = await Player.findById(req.params.id)
      .select('name sport position team recentNews');

    if (!player) {
      return res.status(404).json({
        error: 'Player not found',
        message: 'Player does not exist'
      });
    }

    // Sort news by date and limit
    const news = player.recentNews
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, Number(limit));

    res.json({
      player: {
        id: player._id,
        name: player.name,
        sport: player.sport,
        position: player.position,
        team: player.team
      },
      news,
      count: news.length
    });
  } catch (error) {
    console.error('Get player news error:', error);
    res.status(500).json({
      error: 'Failed to fetch player news',
      message: 'An error occurred while fetching player news'
    });
  }
});

export default router;
