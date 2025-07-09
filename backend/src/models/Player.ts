import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayerStats {
  // Football stats
  passingYards?: number;
  passingTouchdowns?: number;
  interceptions?: number;
  rushingYards?: number;
  rushingTouchdowns?: number;
  receivingYards?: number;
  receivingTouchdowns?: number;
  receptions?: number;
  fumbles?: number;
  
  // Basketball stats
  points?: number;
  rebounds?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  fieldGoalPercentage?: number;
  threePointPercentage?: number;
  freeThrowPercentage?: number;
  
  // General stats
  gamesPlayed?: number;
  fantasyPoints?: number;
  averageFantasyPoints?: number;
}

export interface IPlayer extends Document {
  externalId: string; // ID from external sports API
  name: string;
  firstName: string;
  lastName: string;
  sport: 'football' | 'basketball' | 'baseball' | 'hockey' | 'soccer';
  position: string;
  team: string;
  teamAbbreviation: string;
  jerseyNumber?: number;
  height?: string;
  weight?: number;
  age?: number;
  experience?: number;
  college?: string;
  birthDate?: Date;
  isActive: boolean;
  isInjured: boolean;
  injuryStatus?: string;
  injuryDescription?: string;
  fantasyValue: number;
  salary?: number;
  currentSeasonStats: IPlayerStats;
  previousSeasonStats?: IPlayerStats;
  careerStats?: IPlayerStats;
  recentNews: Array<{
    title: string;
    description: string;
    date: Date;
    source: string;
  }>;
  upcomingGames: Array<{
    opponent: string;
    date: Date;
    isHome: boolean;
    gameWeek?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const playerStatsSchema = new Schema<IPlayerStats>({
  // Football stats
  passingYards: { type: Number, default: 0 },
  passingTouchdowns: { type: Number, default: 0 },
  interceptions: { type: Number, default: 0 },
  rushingYards: { type: Number, default: 0 },
  rushingTouchdowns: { type: Number, default: 0 },
  receivingYards: { type: Number, default: 0 },
  receivingTouchdowns: { type: Number, default: 0 },
  receptions: { type: Number, default: 0 },
  fumbles: { type: Number, default: 0 },
  
  // Basketball stats
  points: { type: Number, default: 0 },
  rebounds: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  steals: { type: Number, default: 0 },
  blocks: { type: Number, default: 0 },
  fieldGoalPercentage: { type: Number, default: 0 },
  threePointPercentage: { type: Number, default: 0 },
  freeThrowPercentage: { type: Number, default: 0 },
  
  // General stats
  gamesPlayed: { type: Number, default: 0 },
  fantasyPoints: { type: Number, default: 0 },
  averageFantasyPoints: { type: Number, default: 0 }
}, { _id: false });

const playerSchema = new Schema<IPlayer>({
  externalId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Player name is required'],
    trim: true,
    index: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  sport: {
    type: String,
    required: [true, 'Sport is required'],
    enum: ['football', 'basketball', 'baseball', 'hockey', 'soccer'],
    index: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    index: true
  },
  team: {
    type: String,
    required: [true, 'Team is required'],
    trim: true,
    index: true
  },
  teamAbbreviation: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  jerseyNumber: {
    type: Number,
    min: 0,
    max: 99
  },
  height: {
    type: String,
    trim: true
  },
  weight: {
    type: Number,
    min: 0
  },
  age: {
    type: Number,
    min: 18,
    max: 50
  },
  experience: {
    type: Number,
    min: 0,
    default: 0
  },
  college: {
    type: String,
    trim: true
  },
  birthDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isInjured: {
    type: Boolean,
    default: false,
    index: true
  },
  injuryStatus: {
    type: String,
    enum: ['healthy', 'questionable', 'doubtful', 'out', 'injured_reserve'],
    default: 'healthy'
  },
  injuryDescription: {
    type: String,
    trim: true
  },
  fantasyValue: {
    type: Number,
    default: 0,
    min: 0,
    index: true
  },
  salary: {
    type: Number,
    min: 0
  },
  currentSeasonStats: {
    type: playerStatsSchema,
    default: () => ({})
  },
  previousSeasonStats: {
    type: playerStatsSchema,
    default: null
  },
  careerStats: {
    type: playerStatsSchema,
    default: null
  },
  recentNews: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    source: { type: String, required: true }
  }],
  upcomingGames: [{
    opponent: { type: String, required: true },
    date: { type: Date, required: true },
    isHome: { type: Boolean, required: true },
    gameWeek: { type: Number }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
playerSchema.index({ sport: 1, position: 1 });
playerSchema.index({ sport: 1, team: 1 });
playerSchema.index({ sport: 1, isActive: 1, isInjured: 1 });
playerSchema.index({ fantasyValue: -1 });

// Virtual for display name
playerSchema.virtual('displayName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Update average fantasy points when current season stats change
playerSchema.pre('save', function(next) {
  if (this.isModified('currentSeasonStats.fantasyPoints') || this.isModified('currentSeasonStats.gamesPlayed')) {
    const stats = this.currentSeasonStats;
    if (stats.gamesPlayed && stats.gamesPlayed > 0) {
      stats.averageFantasyPoints = Number((stats.fantasyPoints! / stats.gamesPlayed).toFixed(2));
    }
  }
  next();
});

export default mongoose.model<IPlayer>('Player', playerSchema);
