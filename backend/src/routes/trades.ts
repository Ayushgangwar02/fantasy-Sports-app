import express from 'express';
import Trade from '../models/Trade';
import Team from '../models/Team';
import Player from '../models/Player';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get all trades for a league
router.get('/league/:leagueId', auth, async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    
    const query: any = { league: leagueId };
    if (status) query.status = status;
    
    const trades = await Trade.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .populate('initiator.userId', 'firstName lastName username')
      .populate('recipient.userId', 'firstName lastName username');
    
    const total = await Trade.countDocuments(query);
    
    res.json({
      success: true,
      trades,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trades'
    });
  }
});

// Get trades for a specific team
router.get('/team/:teamId', auth, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const trades = await Trade.find({
      $or: [
        { 'initiator.teamId': teamId },
        { 'recipient.teamId': teamId }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('initiator.userId', 'firstName lastName username')
    .populate('recipient.userId', 'firstName lastName username');
    
    res.json({
      success: true,
      trades
    });
  } catch (error) {
    console.error('Error fetching team trades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team trades'
    });
  }
});

// Propose a new trade
router.post('/', auth, async (req, res) => {
  try {
    const {
      leagueId,
      recipientTeamId,
      offeredPlayerIds,
      requestedPlayerIds,
      message
    } = req.body;
    
    // Get initiator's team
    const initiatorTeam = await Team.findOne({
      league: leagueId,
      owner: req.user.id
    });
    
    if (!initiatorTeam) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Get recipient team
    const recipientTeam = await Team.findById(recipientTeamId);
    if (!recipientTeam) {
      return res.status(404).json({
        success: false,
        message: 'Recipient team not found'
      });
    }
    
    // Get player details
    const offeredPlayers = await Player.find({ _id: { $in: offeredPlayerIds } });
    const requestedPlayers = await Player.find({ _id: { $in: requestedPlayerIds } });
    
    // Calculate trade values
    const initiatorValue = offeredPlayers.reduce((sum, player) => sum + player.fantasyValue, 0);
    const recipientValue = requestedPlayers.reduce((sum, player) => sum + player.fantasyValue, 0);
    const fairnessScore = Math.min(initiatorValue, recipientValue) / Math.max(initiatorValue, recipientValue) * 100;
    
    // Create trade
    const trade = new Trade({
      league: leagueId,
      initiator: {
        userId: req.user.id,
        teamId: initiatorTeam._id,
        teamName: initiatorTeam.name
      },
      recipient: {
        userId: recipientTeam.owner,
        teamId: recipientTeam._id,
        teamName: recipientTeam.name
      },
      offeredPlayers: offeredPlayers.map(player => ({
        playerId: player._id,
        playerName: player.name,
        position: player.position,
        team: player.team,
        fantasyValue: player.fantasyValue
      })),
      requestedPlayers: requestedPlayers.map(player => ({
        playerId: player._id,
        playerName: player.name,
        position: player.position,
        team: player.team,
        fantasyValue: player.fantasyValue
      })),
      message,
      tradeDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      tradeValue: {
        initiatorValue,
        recipientValue,
        fairnessScore
      },
      history: [{
        action: 'created',
        userId: req.user.id,
        timestamp: new Date()
      }]
    });
    
    await trade.save();
    
    res.status(201).json({
      success: true,
      trade
    });
  } catch (error) {
    console.error('Error creating trade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create trade'
    });
  }
});

// Respond to a trade (accept/reject)
router.put('/:tradeId/respond', auth, async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { action, rejectionReason } = req.body; // 'accept' or 'reject'
    
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }
    
    // Verify user is the recipient
    if (trade.recipient.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this trade'
      });
    }
    
    if (trade.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Trade is no longer pending'
      });
    }
    
    if (action === 'accept') {
      trade.status = 'accepted';
      trade.processedAt = new Date();
      
      // TODO: Implement actual player transfers between teams
      
    } else if (action === 'reject') {
      trade.status = 'rejected';
      trade.rejectionReason = rejectionReason;
      trade.processedAt = new Date();
    }
    
    trade.history.push({
      action: action === 'accept' ? 'accepted' : 'rejected',
      userId: req.user.id,
      timestamp: new Date(),
      notes: rejectionReason
    });
    
    await trade.save();
    
    res.json({
      success: true,
      trade
    });
  } catch (error) {
    console.error('Error responding to trade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to trade'
    });
  }
});

// Cancel a trade
router.put('/:tradeId/cancel', auth, async (req, res) => {
  try {
    const { tradeId } = req.params;
    
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }
    
    // Verify user is the initiator
    if (trade.initiator.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this trade'
      });
    }
    
    if (trade.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Trade cannot be cancelled'
      });
    }
    
    trade.status = 'cancelled';
    trade.processedAt = new Date();
    trade.history.push({
      action: 'cancelled',
      userId: req.user.id,
      timestamp: new Date()
    });
    
    await trade.save();
    
    res.json({
      success: true,
      trade
    });
  } catch (error) {
    console.error('Error cancelling trade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel trade'
    });
  }
});

export default router;
