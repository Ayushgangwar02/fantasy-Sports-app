import mongoose, { Document, Schema } from 'mongoose';

export interface ITrade extends Document {
  _id: string;
  league: string;
  initiator: {
    userId: string;
    teamId: string;
    teamName: string;
  };
  recipient: {
    userId: string;
    teamId: string;
    teamName: string;
  };
  offeredPlayers: [{
    playerId: string;
    playerName: string;
    position: string;
    team: string;
    fantasyValue: number;
  }];
  requestedPlayers: [{
    playerId: string;
    playerName: string;
    position: string;
    team: string;
    fantasyValue: number;
  }];
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
  message?: string;
  tradeDeadline: Date;
  processedAt?: Date;
  rejectionReason?: string;
  adminApprovalRequired: boolean;
  adminApproved?: boolean;
  adminNotes?: string;
  tradeValue: {
    initiatorValue: number;
    recipientValue: number;
    fairnessScore: number; // 0-100, 50 being perfectly fair
  };
  history: [{
    action: 'created' | 'modified' | 'accepted' | 'rejected' | 'cancelled' | 'expired' | 'admin_reviewed';
    userId: string;
    timestamp: Date;
    notes?: string;
  }];
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema = new Schema<ITrade>({
  league: { type: String, required: true, ref: 'League' },
  initiator: {
    userId: { type: String, required: true, ref: 'User' },
    teamId: { type: String, required: true, ref: 'Team' },
    teamName: { type: String, required: true }
  },
  recipient: {
    userId: { type: String, required: true, ref: 'User' },
    teamId: { type: String, required: true, ref: 'Team' },
    teamName: { type: String, required: true }
  },
  offeredPlayers: [{
    playerId: { type: String, required: true, ref: 'Player' },
    playerName: { type: String, required: true },
    position: { type: String, required: true },
    team: { type: String, required: true },
    fantasyValue: { type: Number, required: true }
  }],
  requestedPlayers: [{
    playerId: { type: String, required: true, ref: 'Player' },
    playerName: { type: String, required: true },
    position: { type: String, required: true },
    team: { type: String, required: true },
    fantasyValue: { type: Number, required: true }
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'expired'],
    default: 'pending'
  },
  message: String,
  tradeDeadline: { type: Date, required: true },
  processedAt: Date,
  rejectionReason: String,
  adminApprovalRequired: { type: Boolean, default: false },
  adminApproved: Boolean,
  adminNotes: String,
  tradeValue: {
    initiatorValue: { type: Number, required: true },
    recipientValue: { type: Number, required: true },
    fairnessScore: { type: Number, min: 0, max: 100, required: true }
  },
  history: [{
    action: {
      type: String,
      enum: ['created', 'modified', 'accepted', 'rejected', 'cancelled', 'expired', 'admin_reviewed'],
      required: true
    },
    userId: { type: String, required: true, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    notes: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
TradeSchema.index({ league: 1, status: 1 });
TradeSchema.index({ 'initiator.userId': 1 });
TradeSchema.index({ 'recipient.userId': 1 });
TradeSchema.index({ tradeDeadline: 1 });
TradeSchema.index({ createdAt: -1 });

// Auto-expire trades past deadline
TradeSchema.pre('save', function(next) {
  if (this.status === 'pending' && this.tradeDeadline < new Date()) {
    this.status = 'expired';
  }
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ITrade>('Trade', TradeSchema);
