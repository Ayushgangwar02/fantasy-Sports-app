import React, { useState } from 'react';
import { leaguesAPI } from '../services/api';

interface LeagueCreationProps {
  onLeagueCreated?: (leagueId: string) => void;
  onCancel?: () => void;
}

const LeagueCreation: React.FC<LeagueCreationProps> = ({ onLeagueCreated, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Basic League Info
  const [leagueName, setLeagueName] = useState('');
  const [description, setDescription] = useState('');
  const [sport, setSport] = useState('football');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [maxTeams, setMaxTeams] = useState(10);
  const [entryFee, setEntryFee] = useState(0);

  // Draft Settings
  const [draftType, setDraftType] = useState('snake');
  const [draftDate, setDraftDate] = useState('');
  const [budget, setBudget] = useState(200);

  // Scoring Settings
  const [scoringSystem, setScoringSystem] = useState({
    passingYards: 0.04,
    passingTouchdowns: 4,
    interceptions: -2,
    rushingYards: 0.1,
    rushingTouchdowns: 6,
    receivingYards: 0.1,
    receivingTouchdowns: 6,
    receptions: 0.5,
    fumbles: -2
  });

  // Roster Settings
  const [rosterPositions, setRosterPositions] = useState({
    QB: 1,
    RB: 2,
    WR: 2,
    TE: 1,
    FLEX: 1,
    K: 1,
    DEF: 1,
    BENCH: 6
  });

  // League Settings
  const [waiverSystem, setWaiverSystem] = useState('rolling');
  const [waiverBudget, setWaiverBudget] = useState(100);
  const [tradeDeadline, setTradeDeadline] = useState('');
  const [playoffTeams, setPlayoffTeams] = useState(4);
  const [regularSeasonWeeks, setRegularSeasonWeeks] = useState(13);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateLeague = async () => {
    try {
      setLoading(true);
      setError('');

      const leagueData = {
        name: leagueName,
        description,
        sport,
        isPublic,
        password: !isPublic ? password : undefined,
        maxTeams,
        entryFee,
        draftType,
        draftDate: draftDate ? new Date(draftDate) : undefined,
        budget: draftType === 'auction' ? budget : undefined,
        settings: {
          scoringSystem,
          rosterPositions,
          waiverSystem,
          waiverBudget: waiverSystem === 'faab' ? waiverBudget : undefined,
          tradeDeadline: new Date(tradeDeadline),
          playoffTeams,
          regularSeasonWeeks
        }
      };

      const response = await leaguesAPI.createLeague(leagueData);
      
      if (onLeagueCreated) {
        onLeagueCreated(response.league._id);
      }
    } catch (err: any) {
      console.error('Error creating league:', err);
      setError(err.message || 'Failed to create league');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="step-content">
      <h3>Basic League Information</h3>
      
      <div className="form-group">
        <label>League Name *</label>
        <input
          type="text"
          value={leagueName}
          onChange={(e) => setLeagueName(e.target.value)}
          className="form-input"
          placeholder="Enter league name"
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-textarea"
          placeholder="Describe your league..."
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Sport *</label>
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="form-select"
          >
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="baseball">Baseball</option>
            <option value="hockey">Hockey</option>
          </select>
        </div>

        <div className="form-group">
          <label>Max Teams</label>
          <select
            value={maxTeams}
            onChange={(e) => setMaxTeams(parseInt(e.target.value))}
            className="form-select"
          >
            {[4, 6, 8, 10, 12, 14, 16].map(num => (
              <option key={num} value={num}>{num} Teams</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Public League (anyone can join)
        </label>
      </div>

      {!isPublic && (
        <div className="form-group">
          <label>League Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            placeholder="Enter password for private league"
          />
        </div>
      )}

      <div className="form-group">
        <label>Entry Fee ($)</label>
        <input
          type="number"
          value={entryFee}
          onChange={(e) => setEntryFee(parseFloat(e.target.value) || 0)}
          className="form-input"
          min="0"
          step="0.01"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <h3>Draft Settings</h3>
      
      <div className="form-group">
        <label>Draft Type</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              value="snake"
              checked={draftType === 'snake'}
              onChange={(e) => setDraftType(e.target.value)}
            />
            Snake Draft
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="auction"
              checked={draftType === 'auction'}
              onChange={(e) => setDraftType(e.target.value)}
            />
            Auction Draft
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="linear"
              checked={draftType === 'linear'}
              onChange={(e) => setDraftType(e.target.value)}
            />
            Linear Draft
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Draft Date & Time</label>
        <input
          type="datetime-local"
          value={draftDate}
          onChange={(e) => setDraftDate(e.target.value)}
          className="form-input"
        />
      </div>

      {draftType === 'auction' && (
        <div className="form-group">
          <label>Auction Budget</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(parseInt(e.target.value) || 200)}
            className="form-input"
            min="100"
            max="1000"
          />
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <h3>Scoring & Roster Settings</h3>
      
      <div className="settings-section">
        <h4>Roster Positions</h4>
        <div className="roster-grid">
          {Object.entries(rosterPositions).map(([position, count]) => (
            <div key={position} className="roster-item">
              <label>{position}</label>
              <input
                type="number"
                value={count}
                onChange={(e) => setRosterPositions({
                  ...rosterPositions,
                  [position]: parseInt(e.target.value) || 0
                })}
                className="form-input-small"
                min="0"
                max="10"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h4>Scoring System (Points)</h4>
        <div className="scoring-grid">
          {Object.entries(scoringSystem).map(([stat, points]) => (
            <div key={stat} className="scoring-item">
              <label>{stat.replace(/([A-Z])/g, ' $1').toLowerCase()}</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setScoringSystem({
                  ...scoringSystem,
                  [stat]: parseFloat(e.target.value) || 0
                })}
                className="form-input-small"
                step="0.1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <h3>League Rules & Settings</h3>
      
      <div className="form-group">
        <label>Waiver System</label>
        <select
          value={waiverSystem}
          onChange={(e) => setWaiverSystem(e.target.value)}
          className="form-select"
        >
          <option value="rolling">Rolling Waivers</option>
          <option value="faab">FAAB (Free Agent Budget)</option>
          <option value="priority">Waiver Priority</option>
        </select>
      </div>

      {waiverSystem === 'faab' && (
        <div className="form-group">
          <label>FAAB Budget</label>
          <input
            type="number"
            value={waiverBudget}
            onChange={(e) => setWaiverBudget(parseInt(e.target.value) || 100)}
            className="form-input"
            min="50"
            max="500"
          />
        </div>
      )}

      <div className="form-group">
        <label>Trade Deadline</label>
        <input
          type="date"
          value={tradeDeadline}
          onChange={(e) => setTradeDeadline(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Playoff Teams</label>
          <select
            value={playoffTeams}
            onChange={(e) => setPlayoffTeams(parseInt(e.target.value))}
            className="form-select"
          >
            <option value={2}>2 Teams</option>
            <option value={4}>4 Teams</option>
            <option value={6}>6 Teams</option>
            <option value={8}>8 Teams</option>
          </select>
        </div>

        <div className="form-group">
          <label>Regular Season Weeks</label>
          <select
            value={regularSeasonWeeks}
            onChange={(e) => setRegularSeasonWeeks(parseInt(e.target.value))}
            className="form-select"
          >
            {[10, 11, 12, 13, 14, 15, 16].map(weeks => (
              <option key={weeks} value={weeks}>{weeks} Weeks</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="league-creation">
      <div className="creation-header">
        <h2>Create New League</h2>
        <div className="step-indicator">
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step}
              className={`step ${currentStep >= step ? 'active' : ''}`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="creation-content">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      <div className="creation-footer">
        <div className="button-group">
          {onCancel && (
            <button 
              className="cancel-btn"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          
          {currentStep > 1 && (
            <button 
              className="previous-btn"
              onClick={handlePrevious}
            >
              Previous
            </button>
          )}
          
          {currentStep < 4 ? (
            <button 
              className="next-btn"
              onClick={handleNext}
              disabled={currentStep === 1 && !leagueName.trim()}
            >
              Next
            </button>
          ) : (
            <button 
              className="create-btn"
              onClick={handleCreateLeague}
              disabled={loading || !leagueName.trim() || !tradeDeadline}
            >
              {loading ? 'Creating...' : 'Create League'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeagueCreation;
