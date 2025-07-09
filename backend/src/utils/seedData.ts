import Player from '../models/Player.js';
import User from '../models/User.js';
import League from '../models/League.js';
import Team from '../models/Team.js';

// Sample NFL players data
const samplePlayers = [
  {
    externalId: 'nfl_1',
    name: 'Josh Allen',
    firstName: 'Josh',
    lastName: 'Allen',
    sport: 'football',
    position: 'QB',
    team: 'Buffalo Bills',
    teamAbbreviation: 'BUF',
    jerseyNumber: 17,
    height: '6\'5"',
    weight: 237,
    age: 27,
    experience: 6,
    college: 'Wyoming',
    fantasyValue: 95,
    currentSeasonStats: {
      passingYards: 4306,
      passingTouchdowns: 29,
      interceptions: 18,
      rushingYards: 524,
      rushingTouchdowns: 15,
      gamesPlayed: 17,
      fantasyPoints: 387.2,
      averageFantasyPoints: 22.8
    }
  },
  {
    externalId: 'nfl_2',
    name: 'Christian McCaffrey',
    firstName: 'Christian',
    lastName: 'McCaffrey',
    sport: 'football',
    position: 'RB',
    team: 'San Francisco 49ers',
    teamAbbreviation: 'SF',
    jerseyNumber: 23,
    height: '5\'11"',
    weight: 205,
    age: 27,
    experience: 7,
    college: 'Stanford',
    fantasyValue: 92,
    currentSeasonStats: {
      rushingYards: 1459,
      rushingTouchdowns: 14,
      receivingYards: 564,
      receivingTouchdowns: 7,
      receptions: 67,
      gamesPlayed: 16,
      fantasyPoints: 356.3,
      averageFantasyPoints: 22.3
    }
  },
  {
    externalId: 'nfl_3',
    name: 'Tyreek Hill',
    firstName: 'Tyreek',
    lastName: 'Hill',
    sport: 'football',
    position: 'WR',
    team: 'Miami Dolphins',
    teamAbbreviation: 'MIA',
    jerseyNumber: 10,
    height: '5\'10"',
    weight: 185,
    age: 29,
    experience: 8,
    college: 'West Alabama',
    fantasyValue: 89,
    currentSeasonStats: {
      receivingYards: 1799,
      receivingTouchdowns: 13,
      receptions: 119,
      gamesPlayed: 17,
      fantasyPoints: 334.9,
      averageFantasyPoints: 19.7
    }
  },
  {
    externalId: 'nfl_4',
    name: 'Travis Kelce',
    firstName: 'Travis',
    lastName: 'Kelce',
    sport: 'football',
    position: 'TE',
    team: 'Kansas City Chiefs',
    teamAbbreviation: 'KC',
    jerseyNumber: 87,
    height: '6\'5"',
    weight: 250,
    age: 34,
    experience: 11,
    college: 'Cincinnati',
    fantasyValue: 85,
    currentSeasonStats: {
      receivingYards: 984,
      receivingTouchdowns: 5,
      receptions: 93,
      gamesPlayed: 17,
      fantasyPoints: 198.4,
      averageFantasyPoints: 11.7
    }
  },
  {
    externalId: 'nfl_5',
    name: 'Justin Tucker',
    firstName: 'Justin',
    lastName: 'Tucker',
    sport: 'football',
    position: 'K',
    team: 'Baltimore Ravens',
    teamAbbreviation: 'BAL',
    jerseyNumber: 9,
    height: '6\'1"',
    weight: 183,
    age: 34,
    experience: 12,
    college: 'Texas',
    fantasyValue: 75,
    currentSeasonStats: {
      gamesPlayed: 17,
      fantasyPoints: 156,
      averageFantasyPoints: 9.2
    }
  }
];

// Sample NBA players data
const sampleNBAPlayers = [
  {
    externalId: 'nba_1',
    name: 'LeBron James',
    firstName: 'LeBron',
    lastName: 'James',
    sport: 'basketball',
    position: 'SF',
    team: 'Los Angeles Lakers',
    teamAbbreviation: 'LAL',
    jerseyNumber: 6,
    height: '6\'9"',
    weight: 250,
    age: 39,
    experience: 21,
    college: 'None',
    fantasyValue: 88,
    currentSeasonStats: {
      points: 1590,
      rebounds: 490,
      assists: 520,
      steals: 85,
      blocks: 45,
      fieldGoalPercentage: 54.0,
      threePointPercentage: 41.0,
      freeThrowPercentage: 75.0,
      gamesPlayed: 71,
      fantasyPoints: 3245,
      averageFantasyPoints: 45.7
    }
  },
  {
    externalId: 'nba_2',
    name: 'Nikola Jokic',
    firstName: 'Nikola',
    lastName: 'Jokic',
    sport: 'basketball',
    position: 'C',
    team: 'Denver Nuggets',
    teamAbbreviation: 'DEN',
    jerseyNumber: 15,
    height: '6\'11"',
    weight: 284,
    age: 29,
    experience: 9,
    college: 'None',
    fantasyValue: 95,
    currentSeasonStats: {
      points: 2023,
      rebounds: 976,
      assists: 732,
      steals: 102,
      blocks: 67,
      fieldGoalPercentage: 58.3,
      threePointPercentage: 35.9,
      freeThrowPercentage: 81.7,
      gamesPlayed: 79,
      fantasyPoints: 4156,
      averageFantasyPoints: 52.6
    }
  }
];

export const seedPlayers = async (): Promise<void> => {
  try {
    console.log('🌱 Seeding players...');
    
    // Clear existing players
    await Player.deleteMany({});
    
    // Insert NFL players
    await Player.insertMany(samplePlayers);
    
    // Insert NBA players
    await Player.insertMany(sampleNBAPlayers);
    
    console.log('✅ Players seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding players:', error);
    throw error;
  }
};

export const seedUsers = async (): Promise<void> => {
  try {
    console.log('🌱 Seeding users...');
    
    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: 'admin@fantasy.com' });
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      return;
    }
    
    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@fantasy.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      isVerified: true,
      preferences: {
        favoriteSports: ['football', 'basketball'],
        favoriteTeams: ['Buffalo Bills', 'Los Angeles Lakers']
      }
    });
    
    await adminUser.save();
    
    // Create sample users
    const sampleUsers = [
      {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        isVerified: true,
        preferences: {
          favoriteSports: ['football'],
          favoriteTeams: ['Kansas City Chiefs']
        }
      },
      {
        username: 'janesmith',
        email: 'jane@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        isVerified: true,
        preferences: {
          favoriteSports: ['basketball'],
          favoriteTeams: ['Denver Nuggets']
        }
      }
    ];
    
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
    }
    
    console.log('✅ Users seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

export const seedLeagues = async (): Promise<void> => {
  try {
    console.log('🌱 Seeding leagues...');
    
    // Get admin user
    const adminUser = await User.findOne({ email: 'admin@fantasy.com' });
    if (!adminUser) {
      throw new Error('Admin user not found');
    }
    
    // Create sample leagues
    const sampleLeagues = [
      {
        name: 'Championship Fantasy Football',
        description: 'Competitive fantasy football league for serious players',
        commissioner: adminUser._id,
        sport: 'football',
        isPublic: true,
        settings: {
          maxTeams: 12,
          rosterSize: 16,
          draftType: 'snake',
          waiverSystem: 'rolling',
          budget: 200,
          tradeDeadline: new Date('2024-11-15')
        }
      },
      {
        name: 'NBA Fantasy Masters',
        description: 'Elite basketball fantasy league',
        commissioner: adminUser._id,
        sport: 'basketball',
        isPublic: true,
        settings: {
          maxTeams: 10,
          rosterSize: 13,
          draftType: 'auction',
          waiverSystem: 'faab',
          budget: 300,
          tradeDeadline: new Date('2024-03-15')
        }
      }
    ];
    
    for (const leagueData of sampleLeagues) {
      const league = new League(leagueData);
      await league.save();
    }
    
    console.log('✅ Leagues seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding leagues:', error);
    throw error;
  }
};

export const seedAll = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await seedUsers();
    await seedPlayers();
    await seedLeagues();
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};
