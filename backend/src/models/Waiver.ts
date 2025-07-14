import mongoose, { Document, Schema } from 'mongoose';

export interface IWaiver extends Document {
  _id: string;
  league: string;
  team: string;
  user: string;
  claimType: 'add' | 'drop' | 'add_drop';
  playerToAdd?: {
    playerId: string;
    playerName: string;
    position: string;
    team: string;
    fantasyValue: number;
  };
  playerToDrop?: {
    playerId: string;
    playerName: string;
    position: string;
    team: string;
    fantasyValue: number;
  };
  priority: number;
  waiverPeriod: {
    startDate: Date;
    endDate: Date;
    processDate: Date;
  };
  status: 'pending' | 'processed' | 'failed' | 'cancelled';
  failureReason?: string;
  budgetBid?: number; // For FAAB (Free Agent Acquisition Budget) leagues
  processedAt?: Date;
  processedBy?: string; // System or admin user ID
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WaiverSchema = new Schema<IWaiver>({
  league: { type: String, required: true, ref: 'League' },
  team: { type: String, required: true, ref: 'Team' },
  user: { type: String, required: true, ref: 'User' },
  claimType: {
    type: String,
    enum: ['add', 'drop', 'add_drop'],
    required: true
  },
  playerToAdd: {
    playerId: { type: String, ref: 'Player' },
    playerName: String,
    position: String,
    team: String,
    fantasyValue: Number
  },
  playerToDrop: {
    playerId: { type: String, ref: 'Player' },
    playerName: String,
    position: String,
    team: String,
    fantasyValue: Number
  },
  priority: { type: Number, required: true },
  waiverPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    processDate: { type: Date, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed', 'cancelled'],
    default: 'pending'
  },
  failureReason: String,
  budgetBid: { type: Number, min: 0 },
  processedAt: Date,
  processedBy: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
WaiverSchema.index({ league: 1, status: 1 });
WaiverSchema.index({ team: 1, status: 1 });
WaiverSchema.index({ 'waiverPeriod.processDate': 1 });
WaiverSchema.index({ priority: 1 });

export default mongoose.model<IWaiver>('Waiver', WaiverSchema);
