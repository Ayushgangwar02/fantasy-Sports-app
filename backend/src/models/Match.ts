import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch extends Document {
  _id: string;
  homeTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo?: string;
  };
  sport: 'football' | 'basketball' | 'baseball' | 'hockey';
  league: string; // NFL, NBA, MLB, NHL
  season: string;
  week?: number; // For football
  gameDate: Date;
  status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';
  score: {
    home: number;
    away: number;
  };
  quarter?: number; // Current quarter/period
  timeRemaining?: string;
  venue: {
    name: string;
    city: string;
    state: string;
  };
  weather?: {
    temperature: number;
    conditions: string;
    windSpeed: number;
    humidity: number;
  };
  officials?: string[];
  attendance?: number;
  broadcasts?: string[];
  odds?: {
    spread: number;
    overUnder: number;
    moneyline: {
      home: number;
      away: number;
    };
  };
  playerStats: [{
    playerId: string;
    playerName: string;
    team: 'home' | 'away';
    position: string;
    stats: Map<string, any>; // Flexible stats object
    fantasyPoints: number;
  }];
  teamStats: {
    home: Map<string, any>;
    away: Map<string, any>;
  };
  highlights?: [{
    type: 'touchdown' | 'field_goal' | 'safety' | 'basket' | 'three_pointer' | 'home_run' | 'goal';
    description: string;
    timestamp: Date;
    quarter?: number;
    timeRemaining?: string;
    playerId?: string;
    playerName?: string;
    team: 'home' | 'away';
  }];
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>({
  homeTeam: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    abbreviation: { type: String, required: true },
    logo: String
  },
  awayTeam: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    abbreviation: { type: String, required: true },
    logo: String
  },
  sport: {
    type: String,
    enum: ['football', 'basketball', 'baseball', 'hockey'],
    required: true
  },
  league: { type: String, required: true },
  season: { type: String, required: true },
  week: Number,
  gameDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'postponed', 'cancelled'],
    default: 'scheduled'
  },
  score: {
    home: { type: Number, default: 0 },
    away: { type: Number, default: 0 }
  },
  quarter: Number,
  timeRemaining: String,
  venue: {
    name: String,
    city: String,
    state: String
  },
  weather: {
    temperature: Number,
    conditions: String,
    windSpeed: Number,
    humidity: Number
  },
  officials: [String],
  attendance: Number,
  broadcasts: [String],
  odds: {
    spread: Number,
    overUnder: Number,
    moneyline: {
      home: Number,
      away: Number
    }
  },
  playerStats: [{
    playerId: { type: String, required: true },
    playerName: { type: String, required: true },
    team: { type: String, enum: ['home', 'away'], required: true },
    position: { type: String, required: true },
    stats: { type: Map, of: Schema.Types.Mixed },
    fantasyPoints: { type: Number, default: 0 }
  }],
  teamStats: {
    home: { type: Map, of: Schema.Types.Mixed },
    away: { type: Map, of: Schema.Types.Mixed }
  },
  highlights: [{
    type: {
      type: String,
      enum: ['touchdown', 'field_goal', 'safety', 'basket', 'three_pointer', 'home_run', 'goal']
    },
    description: String,
    timestamp: Date,
    quarter: Number,
    timeRemaining: String,
    playerId: String,
    playerName: String,
    team: { type: String, enum: ['home', 'away'] }
  }],
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
MatchSchema.index({ sport: 1, league: 1, season: 1 });
MatchSchema.index({ gameDate: 1 });
MatchSchema.index({ status: 1 });
MatchSchema.index({ 'homeTeam.id': 1, 'awayTeam.id': 1 });

// Update the updatedAt field before saving
MatchSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IMatch>('Match', MatchSchema);
