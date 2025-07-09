import express from 'express';
import League from '../models/League.js';
import Team from '../models/Team.js';
import { authenticateToken, requireCommissioner } from '../middleware/auth.js';
import { validateLeague, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/leagues
// @desc    Get leagues (public leagues or user's leagues)
// @access  Public/Private
router.get('/', async (req, res) => {
  try {
    const { sport, isPublic, season, page = 1, limit = 20 } = req.query;
    const authHeader = req.headers.authorization;
    const isAuthenticated = authHeader && authHeader.startsWith('Bearer ');

    // Build filter
    const filter: any = { isActive: true };
    
    if (sport) filter.sport = sport;
    if (season) filter.season = season;
    
    // If not authenticated, only show public leagues
    if (!isAuthenticated) {
      filter.isPublic = true;
    } else if (isPublic !== undefined) {
      filter.isPublic = isPublic === 'true';
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    const [leagues, totalCount] = await Promise.all([
      League.find(filter)
        .populate('commissioner', 'username firstName lastName')
        .populate('teams', 'name owner')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-schedule -draftPicks -waiverClaims -announcements'),
      League.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    res.json({
      leagues,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get leagues error:', error);
    res.status(500).json({
      error: 'Failed to fetch leagues',
      message: 'An error occurred while fetching leagues'
    });
  }
});

// @route   POST /api/leagues
// @desc    Create a new league
// @access  Private
router.post('/', authenticateToken, validateLeague, async (req, res) => {
  try {
    const { name, description, sport, isPublic = false, settings = {} } = req.body;

    // Set default settings based on sport
    const defaultSettings = {
      maxTeams: 10,
      rosterSize: 16,
      draftType: 'snake',
      waiverSystem: 'rolling',
      budget: 200,
      regularSeasonWeeks: 13,
      playoffWeeks: [14, 15, 16, 17],
      tradeDeadline: new Date(new Date().getFullYear(), 10, 15), // November 15th
      ...settings
    };

    // Create league
    const league = new League({
      name,
      description,
      commissioner: req.user!.userId,
      sport,
      isPublic,
      settings: defaultSettings
    });

    await league.save();

    // Populate commissioner info for response
    await league.populate('commissioner', 'username firstName lastName');

    res.status(201).json({
      message: 'League created successfully',
      league
    });
  } catch (error) {
    console.error('Create league error:', error);
    res.status(500).json({
      error: 'Failed to create league',
      message: 'An error occurred while creating the league'
    });
  }
});

// @route   GET /api/leagues/:id
// @desc    Get league by ID
// @access  Public (for public leagues) / Private (for private leagues)
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const league = await League.findById(req.params.id)
      .populate('commissioner', 'username firstName lastName')
      .populate({
        path: 'teams',
        populate: {
          path: 'owner',
          select: 'username firstName lastName'
        }
      });

    if (!league) {
      return res.status(404).json({
        error: 'League not found',
        message: 'League does not exist'
      });
    }

    // Check access for private leagues
    if (!league.isPublic) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'This is a private league'
        });
      }
      
      // Additional access check would go here
      // For now, we'll allow access if authenticated
    }

    res.json({
      league
    });
  } catch (error) {
    console.error('Get league error:', error);
    res.status(500).json({
      error: 'Failed to fetch league',
      message: 'An error occurred while fetching league details'
    });
  }
});

// @route   PUT /api/leagues/:id
// @desc    Update league settings
// @access  Private (Commissioner only)
router.put('/:id', validateObjectId('id'), requireCommissioner('id'), async (req, res) => {
  try {
    const { name, description, isPublic, settings } = req.body;

    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({
        error: 'League not found',
        message: 'League does not exist'
      });
    }

    // Check if draft has started (some settings can't be changed after draft)
    if (league.draftStatus !== 'not_started') {
      const restrictedFields = ['maxTeams', 'rosterSize', 'draftType'];
      const hasRestrictedChanges = restrictedFields.some(field => 
        settings && settings[field] !== undefined
      );

      if (hasRestrictedChanges) {
        return res.status(400).json({
          error: 'Cannot modify settings',
          message: 'Some settings cannot be changed after draft has started'
        });
      }
    }

    // Update allowed fields
    if (name) league.name = name;
    if (description !== undefined) league.description = description;
    if (isPublic !== undefined) league.isPublic = isPublic;
    if (settings) {
      league.settings = { ...league.settings, ...settings };
    }

    await league.save();

    res.json({
      message: 'League updated successfully',
      league
    });
  } catch (error) {
    console.error('Update league error:', error);
    res.status(500).json({
      error: 'Failed to update league',
      message: 'An error occurred while updating the league'
    });
  }
});

// @route   GET /api/leagues/:id/standings
// @desc    Get league standings
// @access  Public (for public leagues) / Private (for private leagues)
router.get('/:id/standings', validateObjectId('id'), async (req, res) => {
  try {
    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({
        error: 'League not found',
        message: 'League does not exist'
      });
    }

    const teams = await Team.find({ league: req.params.id })
      .populate('owner', 'username firstName lastName')
      .sort({ rank: 1, totalPoints: -1 })
      .select('name owner wins losses ties totalPoints averagePoints rank winPercentage');

    res.json({
      league: {
        id: league._id,
        name: league.name,
        sport: league.sport,
        currentWeek: league.currentWeek
      },
      standings: teams
    });
  } catch (error) {
    console.error('Get standings error:', error);
    res.status(500).json({
      error: 'Failed to fetch standings',
      message: 'An error occurred while fetching league standings'
    });
  }
});

// @route   GET /api/leagues/:id/schedule
// @desc    Get league schedule
// @access  Public (for public leagues) / Private (for private leagues)
router.get('/:id/schedule', validateObjectId('id'), async (req, res) => {
  try {
    const { week } = req.query;

    const league = await League.findById(req.params.id)
      .populate({
        path: 'schedule.team1 schedule.team2',
        select: 'name owner',
        populate: {
          path: 'owner',
          select: 'username firstName lastName'
        }
      });

    if (!league) {
      return res.status(404).json({
        error: 'League not found',
        message: 'League does not exist'
      });
    }

    let schedule = league.schedule;

    // Filter by week if specified
    if (week) {
      schedule = schedule.filter(matchup => matchup.week === Number(week));
    }

    res.json({
      league: {
        id: league._id,
        name: league.name,
        currentWeek: league.currentWeek,
        regularSeasonWeeks: league.regularSeasonWeeks
      },
      schedule,
      week: week ? Number(week) : null
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      error: 'Failed to fetch schedule',
      message: 'An error occurred while fetching league schedule'
    });
  }
});

// @route   POST /api/leagues/:id/join
// @desc    Join a public league
// @access  Private
router.post('/:id/join', validateObjectId('id'), authenticateToken, async (req, res) => {
  try {
    const { teamName } = req.body;

    if (!teamName || teamName.trim().length === 0) {
      return res.status(400).json({
        error: 'Team name required',
        message: 'Please provide a team name'
      });
    }

    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({
        error: 'League not found',
        message: 'League does not exist'
      });
    }

    if (!league.isPublic) {
      return res.status(400).json({
        error: 'Private league',
        message: 'This league requires an invitation to join'
      });
    }

    if (!league.isActive) {
      return res.status(400).json({
        error: 'League inactive',
        message: 'Cannot join an inactive league'
      });
    }

    if (league.teams.length >= league.settings.maxTeams) {
      return res.status(400).json({
        error: 'League full',
        message: 'League has reached maximum number of teams'
      });
    }

    // Check if user already has a team in this league
    const existingTeam = await Team.findOne({
      owner: req.user!.userId,
      league: req.params.id
    });

    if (existingTeam) {
      return res.status(400).json({
        error: 'Already joined',
        message: 'You already have a team in this league'
      });
    }

    // Create team
    const team = new Team({
      name: teamName.trim(),
      owner: req.user!.userId,
      league: req.params.id,
      sport: league.sport,
      season: league.season,
      budget: league.settings.budget || 200,
      remainingBudget: league.settings.budget || 200,
      maxRosterSize: league.settings.rosterSize
    });

    await team.save();

    // Add team to league
    league.teams.push(team._id);
    await league.save();

    res.status(201).json({
      message: 'Successfully joined league',
      team: {
        id: team._id,
        name: team.name,
        league: {
          id: league._id,
          name: league.name,
          sport: league.sport
        }
      }
    });
  } catch (error) {
    console.error('Join league error:', error);
    res.status(500).json({
      error: 'Failed to join league',
      message: 'An error occurred while joining the league'
    });
  }
});

export default router;
