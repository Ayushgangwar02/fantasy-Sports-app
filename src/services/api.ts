// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Types for API responses
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  isVerified: boolean;
  preferences: {
    favoriteSports: string[];
    favoriteTeams: string[];
    notifications: {
      email: boolean;
      push: boolean;
      trades: boolean;
      waivers: boolean;
    };
  };
  stats: {
    totalLeagues: number;
    totalWins: number;
    totalLosses: number;
    championships: number;
  };
  lastLogin?: Date;
  createdAt: Date;
}

export interface Player {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  sport: string;
  position: string;
  team: string;
  teamAbbreviation: string;
  jerseyNumber?: number;
  height?: string;
  weight?: number;
  age?: number;
  experience?: number;
  college?: string;
  fantasyValue: number;
  isActive: boolean;
  isInjured: boolean;
  injuryStatus?: string;
  currentSeasonStats: Record<string, any>;
  previousSeasonStats?: Record<string, any>;
  careerStats?: Record<string, any>;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  league: string;
  sport: string;
  season: string;
  roster: Array<{
    playerId: string;
    position: string;
    isStarter: boolean;
    acquisitionDate: Date;
    acquisitionType: string;
    salary: number;
  }>;
  wins: number;
  losses: number;
  ties: number;
  totalPoints: number;
  averagePoints: number;
  rank: number;
  budget: number;
  remainingBudget: number;
  maxRosterSize: number;
  isActive: boolean;
  winPercentage: number;
  rosterCount: number;
}

export interface League {
  _id: string;
  name: string;
  description?: string;
  commissioner: string;
  sport: string;
  season: string;
  isPublic: boolean;
  isActive: boolean;
  settings: {
    maxTeams: number;
    rosterSize: number;
    startingLineup: Record<string, number>;
    scoringSystem: Record<string, number>;
    waiverSystem: string;
    tradeDeadline: Date;
    playoffWeeks: number[];
    draftType: string;
    draftDate?: Date;
    budget?: number;
  };
  teams: string[];
  currentWeek: number;
  regularSeasonWeeks: number;
  draftStatus: string;
  teamCount: number;
  availableSpots: number;
  status: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// API Client class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  // Player methods
  async getPlayers(params: {
    sport?: string;
    position?: string;
    team?: string;
    name?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<{
    players: Player[];
    pagination: any;
    filters: any;
  }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/players${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{
      players: Player[];
      pagination: any;
      filters: any;
    }>(endpoint);
  }

  async getPlayer(id: string): Promise<{ player: Player }> {
    return this.request<{ player: Player }>(`/players/${id}`);
  }

  async searchPlayers(query: string, sport?: string, limit?: number): Promise<{
    players: Player[];
    query: string;
    count: number;
  }> {
    const params = new URLSearchParams({ limit: (limit || 10).toString() });
    if (sport) params.append('sport', sport);
    
    return this.request<{
      players: Player[];
      query: string;
      count: number;
    }>(`/players/search/${encodeURIComponent(query)}?${params.toString()}`);
  }

  // Team methods
  async getTeams(): Promise<{ teams: Team[]; count: number }> {
    return this.request<{ teams: Team[]; count: number }>('/teams');
  }

  async getTeam(id: string): Promise<{ team: Team }> {
    return this.request<{ team: Team }>(`/teams/${id}`);
  }

  async createTeam(teamData: {
    name: string;
    description?: string;
    league: string;
  }): Promise<{ message: string; team: Team }> {
    return this.request<{ message: string; team: Team }>('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async updateTeam(id: string, updates: {
    name?: string;
    description?: string;
  }): Promise<{ message: string; team: Team }> {
    return this.request<{ message: string; team: Team }>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async addPlayerToTeam(teamId: string, playerId: string, options: {
    isStarter?: boolean;
    acquisitionType?: string;
  } = {}): Promise<{ message: string; player: any }> {
    return this.request<{ message: string; player: any }>(`/teams/${teamId}/players/${playerId}`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async removePlayerFromTeam(teamId: string, playerId: string): Promise<{ message: string; removedPlayer: any }> {
    return this.request<{ message: string; removedPlayer: any }>(`/teams/${teamId}/players/${playerId}`, {
      method: 'DELETE',
    });
  }

  // League methods
  async getLeagues(params: {
    sport?: string;
    isPublic?: boolean;
    season?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    leagues: League[];
    pagination: any;
  }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/leagues${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{
      leagues: League[];
      pagination: any;
    }>(endpoint);
  }

  async getLeague(id: string): Promise<{ league: League }> {
    return this.request<{ league: League }>(`/leagues/${id}`);
  }

  async createLeague(leagueData: {
    name: string;
    description?: string;
    sport: string;
    isPublic?: boolean;
    settings?: any;
  }): Promise<{ message: string; league: League }> {
    return this.request<{ message: string; league: League }>('/leagues', {
      method: 'POST',
      body: JSON.stringify(leagueData),
    });
  }

  async joinLeague(id: string, teamName: string): Promise<{ message: string; team: any }> {
    return this.request<{ message: string; team: any }>(`/leagues/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ teamName }),
    });
  }

  async getLeagueStandings(id: string): Promise<{
    league: any;
    standings: Team[];
  }> {
    return this.request<{
      league: any;
      standings: Team[];
    }>(`/leagues/${id}/standings`);
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual API functions for convenience
export const authAPI = {
  register: (userData: Parameters<typeof apiClient.register>[0]) => apiClient.register(userData),
  login: (credentials: Parameters<typeof apiClient.login>[0]) => apiClient.login(credentials),
  logout: () => apiClient.logout(),
  getCurrentUser: () => apiClient.getCurrentUser(),
};

export const playersAPI = {
  getPlayers: (params?: Parameters<typeof apiClient.getPlayers>[0]) => apiClient.getPlayers(params),
  getPlayer: (id: string) => apiClient.getPlayer(id),
  searchPlayers: (query: string, sport?: string, limit?: number) => apiClient.searchPlayers(query, sport, limit),
};

export const teamsAPI = {
  getTeams: () => apiClient.getTeams(),
  getTeam: (id: string) => apiClient.getTeam(id),
  createTeam: (teamData: Parameters<typeof apiClient.createTeam>[0]) => apiClient.createTeam(teamData),
  updateTeam: (id: string, updates: Parameters<typeof apiClient.updateTeam>[1]) => apiClient.updateTeam(id, updates),
  addPlayerToTeam: (teamId: string, playerId: string, options?: Parameters<typeof apiClient.addPlayerToTeam>[2]) => 
    apiClient.addPlayerToTeam(teamId, playerId, options),
  removePlayerFromTeam: (teamId: string, playerId: string) => apiClient.removePlayerFromTeam(teamId, playerId),
};

export const leaguesAPI = {
  getLeagues: (params?: Parameters<typeof apiClient.getLeagues>[0]) => apiClient.getLeagues(params),
  getLeague: (id: string) => apiClient.getLeague(id),
  createLeague: (leagueData: Parameters<typeof apiClient.createLeague>[0]) => apiClient.createLeague(leagueData),
  joinLeague: (id: string, teamName: string) => apiClient.joinLeague(id, teamName),
  getLeagueStandings: (id: string) => apiClient.getLeagueStandings(id),
};

export default apiClient;
