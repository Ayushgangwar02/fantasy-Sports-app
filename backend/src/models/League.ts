import mongoose, { Document, Schema } from 'mongoose';

export interface ILeagueSettings {
  maxTeams: number;
  rosterSize: number;
  startingLineup: Map<string, number>;
  scoringSystem: Map<string, number>;
  waiverSystem: 'rolling' | 'faab' | 'reverse_standings';
  tradeDeadline: Date;
  playoffWeeks: number[];
  draftType: 'snake' | 'auction' | 'linear';
  draftDate?: Date;
  budget?: number;
}

export interface IMatchup {
  week: number;
  team1: mongoose.Types.ObjectId;
  team2: mongoose.Types.ObjectId;
  team1Score: number;
  team2Score: number;
  isComplete: boolean;
  isPlayoff: boolean;
}

export interface ILeague extends Document {
  name: string;
  description?: string;
  commissioner: mongoose.Types.ObjectId;
  sport: 'football' | 'basketball' | 'baseball' | 'hockey' | 'soccer';
  season: string;
  isPublic: boolean;
  isActive: boolean;
  
  // League configuration
  settings: ILeagueSettings;
  
  // Teams and members
  teams: mongoose.Types.ObjectId[];
  invitedUsers: Array<{
    email: string;
    invitedBy: mongoose.Types.ObjectId;
    invitedAt: Date;
    status: 'pending' | 'accepted' | 'declined';
  }>;
  
  // Schedule and matchups
  schedule: IMatchup[];
  currentWeek: number;
  regularSeasonWeeks: number;
  
  // Draft information
  draftStatus: 'not_started' | 'in_progress' | 'completed';
  draftOrder: mongoose.Types.ObjectId[];
  draftPicks: Array<{
    round: number;
    pick: number;
    team: mongoose.Types.ObjectId;
    player?: mongoose.Types.ObjectId;
    timestamp?: Date;
  }>;
  
  // Waivers and transactions
  waiverClaims: Array<{
    team: mongoose.Types.ObjectId;
    player: mongoose.Types.ObjectId;
    dropPlayer?: mongoose.Types.ObjectId;
    priority: number;
    amount?: number; // For FAAB
    status: 'pending' | 'processed' | 'failed';
    processDate?: Date;
  }>;
  
  // League history and stats
  champions: Array<{
    season: string;
    team: mongoose.Types.ObjectId;
    finalScore: number;
  }>;
  
  // Communication
  announcements: Array<{
    title: string;
    message: string;
    author: mongoose.Types.ObjectId;
    date: Date;
    isImportant: boolean;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const leagueSettingsSchema = new Schema<ILeagueSettings>({
  maxTeams: {
    type: Number,
    required: true,
    min: 4,
    max: 16,
    default: 10
  },
  rosterSize: {
    type: Number,
    required: true,
    min: 10,
    max: 30,
    default: 16
  },
  startingLineup: {
    type: Map,
    of: Number,
    default: new Map([
      ['QB', 1],
      ['RB', 2],
      ['WR', 2],
      ['TE', 1],
      ['FLEX', 1],
      ['K', 1],
      ['DEF', 1]
    ])
  },
  scoringSystem: {
    type: Map,
    of: Number,
    default: new Map([
      ['passingYards', 0.04],
      ['passingTouchdowns', 4],
      ['interceptions', -2],
      ['rushingYards', 0.1],
      ['rushingTouchdowns', 6],
      ['receivingYards', 0.1],
      ['receivingTouchdowns', 6],
      ['receptions', 0.5],
      ['fumbles', -2]
    ])
  },
  waiverSystem: {
    type: String,
    enum: ['rolling', 'faab', 'reverse_standings'],
    default: 'rolling'
  },
  tradeDeadline: {
    type: Date,
    required: true
  },
  playoffWeeks: {
    type: [Number],
    default: [14, 15, 16, 17]
  },
  draftType: {
    type: String,
    enum: ['snake', 'auction', 'linear'],
    default: 'snake'
  },
  draftDate: {
    type: Date
  },
  budget: {
    type: Number,
    default: 200
  }
}, { _id: false });

const matchupSchema = new Schema<IMatchup>({
  week: {
    type: Number,
    required: true,
    min: 1,
    max: 18
  },
  team1: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  team2: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  team1Score: {
    type: Number,
    default: 0,
    min: 0
  },
  team2Score: {
    type: Number,
    default: 0,
    min: 0
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  isPlayoff: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const leagueSchema = new Schema<ILeague>({
  name: {
    type: String,
    required: [true, 'League name is required'],
    trim: true,
    maxlength: [50, 'League name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  commissioner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sport: {
    type: String,
    required: [true, 'Sport is required'],
    enum: ['football', 'basketball', 'baseball', 'hockey', 'soccer'],
    index: true
  },
  season: {
    type: String,
    required: true,
    default: () => new Date().getFullYear().toString()
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // League configuration
  settings: {
    type: leagueSettingsSchema,
    required: true
  },
  
  // Teams and members
  teams: [{
    type: Schema.Types.ObjectId,
    ref: 'Team'
  }],
  invitedUsers: [{
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  
  // Schedule and matchups
  schedule: [matchupSchema],
  currentWeek: {
    type: Number,
    default: 1,
    min: 1,
    max: 18
  },
  regularSeasonWeeks: {
    type: Number,
    default: 13,
    min: 8,
    max: 16
  },
  
  // Draft information
  draftStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  draftOrder: [{
    type: Schema.Types.ObjectId,
    ref: 'Team'
  }],
  draftPicks: [{
    round: { type: Number, required: true },
    pick: { type: Number, required: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    player: { type: Schema.Types.ObjectId, ref: 'Player' },
    timestamp: { type: Date }
  }],
  
  // Waivers and transactions
  waiverClaims: [{
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    player: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    dropPlayer: { type: Schema.Types.ObjectId, ref: 'Player' },
    priority: { type: Number, required: true },
    amount: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    },
    processDate: { type: Date }
  }],
  
  // League history
  champions: [{
    season: { type: String, required: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    finalScore: { type: Number, required: true }
  }],
  
  // Communication
  announcements: [{
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    isImportant: { type: Boolean, default: false }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
leagueSchema.index({ commissioner: 1 });
leagueSchema.index({ sport: 1, isActive: 1 });
leagueSchema.index({ isPublic: 1, isActive: 1 });
leagueSchema.index({ season: 1 });

// Virtual for team count
leagueSchema.virtual('teamCount').get(function() {
  return this.teams.length;
});

// Virtual for available spots
leagueSchema.virtual('availableSpots').get(function() {
  return this.settings.maxTeams - this.teams.length;
});

// Virtual for league status
leagueSchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.teams.length < this.settings.maxTeams) return 'recruiting';
  if (this.draftStatus === 'not_started') return 'pre_draft';
  if (this.draftStatus === 'in_progress') return 'drafting';
  if (this.currentWeek <= this.regularSeasonWeeks) return 'regular_season';
  return 'playoffs';
});

export default mongoose.model<ILeague>('League', leagueSchema);
