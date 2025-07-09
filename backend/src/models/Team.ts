import mongoose, { Document, Schema } from 'mongoose';

export interface IRosterPlayer {
  playerId: mongoose.Types.ObjectId;
  position: string;
  isStarter: boolean;
  acquisitionDate: Date;
  acquisitionType: 'draft' | 'waiver' | 'trade' | 'free_agent';
  salary?: number;
}

export interface ITeam extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  league: mongoose.Types.ObjectId;
  sport: 'football' | 'basketball' | 'baseball' | 'hockey' | 'soccer';
  logo?: string;
  description?: string;
  
  // Roster management
  roster: IRosterPlayer[];
  maxRosterSize: number;
  maxStartersByPosition: Map<string, number>;
  
  // Financial
  budget: number;
  remainingBudget: number;
  salaryCapUsed: number;
  
  // Performance
  wins: number;
  losses: number;
  ties: number;
  totalPoints: number;
  averagePoints: number;
  rank: number;
  
  // Season tracking
  season: string;
  isActive: boolean;
  
  // Transactions
  transactions: Array<{
    type: 'add' | 'drop' | 'trade' | 'waiver_claim';
    playerId: mongoose.Types.ObjectId;
    details: string;
    date: Date;
    week?: number;
  }>;
  
  // Matchups
  currentMatchup?: {
    opponent: mongoose.Types.ObjectId;
    week: number;
    projectedPoints: number;
    actualPoints: number;
    isComplete: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const rosterPlayerSchema = new Schema<IRosterPlayer>({
  playerId: {
    type: Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  isStarter: {
    type: Boolean,
    default: false
  },
  acquisitionDate: {
    type: Date,
    default: Date.now
  },
  acquisitionType: {
    type: String,
    enum: ['draft', 'waiver', 'trade', 'free_agent'],
    required: true
  },
  salary: {
    type: Number,
    min: 0
  }
}, { _id: false });

const teamSchema = new Schema<ITeam>({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [50, 'Team name cannot exceed 50 characters']
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  league: {
    type: Schema.Types.ObjectId,
    ref: 'League',
    required: true,
    index: true
  },
  sport: {
    type: String,
    required: [true, 'Sport is required'],
    enum: ['football', 'basketball', 'baseball', 'hockey', 'soccer'],
    index: true
  },
  logo: {
    type: String,
    default: null
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    trim: true
  },
  
  // Roster management
  roster: [rosterPlayerSchema],
  maxRosterSize: {
    type: Number,
    default: 16,
    min: 1,
    max: 30
  },
  maxStartersByPosition: {
    type: Map,
    of: Number,
    default: new Map([
      ['QB', 1],
      ['RB', 2],
      ['WR', 2],
      ['TE', 1],
      ['K', 1],
      ['DEF', 1],
      ['FLEX', 1]
    ])
  },
  
  // Financial
  budget: {
    type: Number,
    default: 200,
    min: 0
  },
  remainingBudget: {
    type: Number,
    default: 200,
    min: 0
  },
  salaryCapUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Performance
  wins: {
    type: Number,
    default: 0,
    min: 0
  },
  losses: {
    type: Number,
    default: 0,
    min: 0
  },
  ties: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  averagePoints: {
    type: Number,
    default: 0,
    min: 0
  },
  rank: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Season tracking
  season: {
    type: String,
    required: true,
    default: () => new Date().getFullYear().toString()
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Transactions
  transactions: [{
    type: {
      type: String,
      enum: ['add', 'drop', 'trade', 'waiver_claim'],
      required: true
    },
    playerId: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true
    },
    details: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    week: {
      type: Number,
      min: 1,
      max: 18
    }
  }],
  
  // Current matchup
  currentMatchup: {
    opponent: {
      type: Schema.Types.ObjectId,
      ref: 'Team'
    },
    week: {
      type: Number,
      min: 1,
      max: 18
    },
    projectedPoints: {
      type: Number,
      default: 0
    },
    actualPoints: {
      type: Number,
      default: 0
    },
    isComplete: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
teamSchema.index({ owner: 1, league: 1 });
teamSchema.index({ league: 1, isActive: 1 });
teamSchema.index({ sport: 1, season: 1 });
teamSchema.index({ rank: 1 });

// Virtual for win percentage
teamSchema.virtual('winPercentage').get(function() {
  const totalGames = this.wins + this.losses + this.ties;
  if (totalGames === 0) return 0;
  return Number(((this.wins + (this.ties * 0.5)) / totalGames * 100).toFixed(2));
});

// Virtual for roster count
teamSchema.virtual('rosterCount').get(function() {
  return this.roster.length;
});

// Virtual for starter count
teamSchema.virtual('starterCount').get(function() {
  return this.roster.filter(player => player.isStarter).length;
});

// Update average points when total points change
teamSchema.pre('save', function(next) {
  if (this.isModified('totalPoints') || this.isModified('wins') || this.isModified('losses') || this.isModified('ties')) {
    const totalGames = this.wins + this.losses + this.ties;
    this.averagePoints = totalGames > 0 ? Number((this.totalPoints / totalGames).toFixed(2)) : 0;
  }
  next();
});

// Update remaining budget when roster changes
teamSchema.pre('save', function(next) {
  if (this.isModified('roster')) {
    const totalSalary = this.roster.reduce((sum, player) => sum + (player.salary || 0), 0);
    this.salaryCapUsed = totalSalary;
    this.remainingBudget = this.budget - totalSalary;
  }
  next();
});

export default mongoose.model<ITeam>('Team', teamSchema);
