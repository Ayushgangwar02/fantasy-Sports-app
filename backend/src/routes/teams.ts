import express from 'express';
import Team from '../models/Team.js';
import League from '../models/League.js';
import Player from '../models/Player.js';
import { authenticateToken, requireTeamOwner } from '../middleware/auth.js';
import { validateTeam, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/teams
// @desc    Get user's teams
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { sport, season, isActive = true } = req.query;

    // Build filter
    const filter: any = { owner: req.user!.userId };
    if (sport) filter.sport = sport;
    if (season) filter.season = season;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const teams = await Team.find(filter)
      .populate('league', 'name sport season')
      .populate('roster.playerId', 'name position team fantasyValue')
      .sort({ createdAt: -1 });

    res.json({
      teams,
      count: teams.length
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      error: 'Failed to fetch teams',
      message: 'An error occurred while fetching teams'
    });
  }
});

// @route   POST /api/teams
// @desc    Create a new team
// @access  Private
router.post('/', authenticateToken, validateTeam, async (req, res) => {
  try {
    const { name, description, league: leagueId } = req.body;

    // Check if league exists and user can join
    const league = await League.findById(leagueId);
    if (!league) {
      return res.status(404).json({
        error: 'League not found',
        message: 'League does not exist'
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
      league: leagueId
    });

    if (existingTeam) {
      return res.status(400).json({
        error: 'Team already exists',
        message: 'You already have a team in this league'
      });
    }

    // Create team
    const team = new Team({
      name,
      description,
      owner: req.user!.userId,
      league: leagueId,
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

    // Populate team data for response
    await team.populate('league', 'name sport season');

    res.status(201).json({
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      error: 'Failed to create team',
      message: 'An error occurred while creating the team'
    });
  }
});

// @route   GET /api/teams/:id
// @desc    Get team by ID
// @access  Private
router.get('/:id', validateObjectId('id'), authenticateToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'username firstName lastName')
      .populate('league', 'name sport season settings')
      .populate('roster.playerId', 'name position team fantasyValue currentSeasonStats isInjured injuryStatus');

    if (!team) {
      return res.status(404).json({
        error: 'Team not found',
        message: 'Team does not exist'
      });
    }

    // Check if user has access to this team (owner or league member)
    const league = await League.findById(team.league);
    const userTeamInLeague = await Team.findOne({
      owner: req.user!.userId,
      league: team.league
    });

    if (team.owner.toString() !== req.user!.userId && !userTeamInLeague) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this team'
      });
    }

    res.json({
      team
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      error: 'Failed to fetch team',
      message: 'An error occurred while fetching team details'
    });
  }
});

// @route   PUT /api/teams/:id
// @desc    Update team
// @access  Private (Team Owner)
router.put('/:id', validateObjectId('id'), requireTeamOwner('id'), async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        error: 'Team not found',
        message: 'Team does not exist'
      });
    }

    // Update allowed fields
    if (name) team.name = name;
    if (description !== undefined) team.description = description;

    await team.save();

    res.json({
      message: 'Team updated successfully',
      team
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      error: 'Failed to update team',
      message: 'An error occurred while updating the team'
    });
  }
});

// @route   POST /api/teams/:id/players/:playerId
// @desc    Add player to team roster
// @access  Private (Team Owner)
router.post('/:id/players/:playerId', 
  validateObjectId('id'), 
  validateObjectId('playerId'), 
  requireTeamOwner('id'), 
  async (req, res) => {
    try {
      const { isStarter = false, acquisitionType = 'free_agent' } = req.body;

      const [team, player] = await Promise.all([
        Team.findById(req.params.id),
        Player.findById(req.params.playerId)
      ]);

      if (!team) {
        return res.status(404).json({
          error: 'Team not found',
          message: 'Team does not exist'
        });
      }

      if (!player) {
        return res.status(404).json({
          error: 'Player not found',
          message: 'Player does not exist'
        });
      }

      // Check if player is already on roster
      const existingPlayer = team.roster.find(
        p => p.playerId.toString() === req.params.playerId
      );

      if (existingPlayer) {
        return res.status(400).json({
          error: 'Player already on roster',
          message: 'This player is already on your team'
        });
      }

      // Check roster size limit
      if (team.roster.length >= team.maxRosterSize) {
        return res.status(400).json({
          error: 'Roster full',
          message: 'Team roster is at maximum capacity'
        });
      }

      // Check if player is active and not injured for starters
      if (isStarter && (player.isInjured || !player.isActive)) {
        return res.status(400).json({
          error: 'Cannot start injured player',
          message: 'Injured or inactive players cannot be in starting lineup'
        });
      }

      // Add player to roster
      team.roster.push({
        playerId: player._id,
        position: player.position,
        isStarter,
        acquisitionDate: new Date(),
        acquisitionType,
        salary: player.salary || 0
      });

      // Add transaction record
      team.transactions.push({
        type: 'add',
        playerId: player._id,
        details: `Added ${player.name} (${player.position}) from ${player.team}`,
        date: new Date()
      });

      await team.save();

      res.json({
        message: 'Player added to roster successfully',
        player: {
          id: player._id,
          name: player.name,
          position: player.position,
          team: player.team,
          isStarter
        }
      });
    } catch (error) {
      console.error('Add player error:', error);
      res.status(500).json({
        error: 'Failed to add player',
        message: 'An error occurred while adding player to roster'
      });
    }
  }
);

// @route   DELETE /api/teams/:id/players/:playerId
// @desc    Remove player from team roster
// @access  Private (Team Owner)
router.delete('/:id/players/:playerId', 
  validateObjectId('id'), 
  validateObjectId('playerId'), 
  requireTeamOwner('id'), 
  async (req, res) => {
    try {
      const team = await Team.findById(req.params.id);
      if (!team) {
        return res.status(404).json({
          error: 'Team not found',
          message: 'Team does not exist'
        });
      }

      const playerIndex = team.roster.findIndex(
        p => p.playerId.toString() === req.params.playerId
      );

      if (playerIndex === -1) {
        return res.status(404).json({
          error: 'Player not found',
          message: 'Player is not on this team roster'
        });
      }

      const removedPlayer = team.roster[playerIndex];
      
      // Get player details for transaction log
      const player = await Player.findById(req.params.playerId);
      
      // Remove player from roster
      team.roster.splice(playerIndex, 1);

      // Add transaction record
      if (player) {
        team.transactions.push({
          type: 'drop',
          playerId: player._id,
          details: `Dropped ${player.name} (${player.position}) from ${player.team}`,
          date: new Date()
        });
      }

      await team.save();

      res.json({
        message: 'Player removed from roster successfully',
        removedPlayer: {
          playerId: removedPlayer.playerId,
          position: removedPlayer.position,
          isStarter: removedPlayer.isStarter
        }
      });
    } catch (error) {
      console.error('Remove player error:', error);
      res.status(500).json({
        error: 'Failed to remove player',
        message: 'An error occurred while removing player from roster'
      });
    }
  }
);

export default router;
