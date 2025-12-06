// Game State Management - Handles all game state variables and persistence

import { GAME_CONFIG, DEFAULT_SETTINGS } from './config/index.js';

// Game state variables
export class GameState {
  constructor() {
    this.reset();
    this.loadFromStorage();
  }

  reset() {
    // Core game state
    this.currentLevel = 1;
    this.currentRule = 1; // 1 for physical property, 2 for meaning
    this.isProgressiveMode = true;
    this.modeType = DEFAULT_SETTINGS.modeType;
    this.numberRange = DEFAULT_SETTINGS.numberRange;
    this.selectedLevel = DEFAULT_SETTINGS.selectedLevel;
    
    // Trial tracking
    this.trialCount = 0;
    this.presentationTime = 1200;
    this.currentPair = null;
    this.trialTypes = [];
    this.waitingForNextTrial = false;
    
    // Performance tracking
    this.totalCorrect = 0;
    this.totalAttempts = 0;
    this.errorCount = 0;
    this.consecutiveFailures = 0;
    
    // Session tracking
    this.sessionHistory = [];
    this.sessionLevelHigh = 1;
    this.sessionLevelLow = 1;
    
    // Stimulus type tracking
    this.currentStimulusType = 'numbers';
    this.currentSemanticCategory = null;
    this.nextUseSemantic = false;
    this.nextSemanticCategory = null;
    
    // Format usage tracking
    this.formatUsage = {
      arabic: 0,
      word: 0,
      roman: 0
    };
    
    // Timer
    this.timer = null;
    
    // Settings
    this.showErrorCounts = DEFAULT_SETTINGS.showErrorCounts;
    
    // Semantic tier settings
    this.enabledSemanticTiers = {
      tier1: true,  // Basic (always on)
      tier2: false, // Common knowledge
      tier3: false  // Expert knowledge
    };
    
    // Progress tracking
    this.lastRecordedLevel = 1;
    this.lastRecordedLevels = { classic: 1, multi: 1 };
  }

  // Storage management
  loadFromStorage() {
    const savedData = localStorage.getItem(GAME_CONFIG.STORAGE_KEYS.TASK_DATA);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.lastRecordedLevels) {
          this.lastRecordedLevels = {
            classic: data.lastRecordedLevels.classic || 1,
            multi: data.lastRecordedLevels.multi || 1
          };
        } else {
          const legacy = data.lastRecordedLevel || 1;
          this.lastRecordedLevels = { classic: legacy, multi: legacy };
        }
        this.showErrorCounts = data.showErrorCounts !== undefined ? data.showErrorCounts : DEFAULT_SETTINGS.showErrorCounts;
      } catch (error) {
        console.warn('Error loading saved data:', error);
      }
    }
    this.lastRecordedLevel = this.lastRecordedLevels[this.modeType];
  }

  saveToStorage() {
    const data = { 
      lastRecordedLevels: this.lastRecordedLevels, 
      showErrorCounts: this.showErrorCounts, 
      lastRecordedLevel: this.lastRecordedLevels[this.modeType] 
    };
    localStorage.setItem(GAME_CONFIG.STORAGE_KEYS.TASK_DATA, JSON.stringify(data));
  }

  // Level management
  advanceLevel() {
    if (this.currentLevel < GAME_CONFIG.MAX_LEVEL) {
      this.currentLevel++;
      this.presentationTime = this.getLevelTime(this.currentLevel);
      if (this.currentLevel > this.sessionLevelHigh) {
        this.sessionLevelHigh = this.currentLevel;
      }
      return true;
    }
    return false;
  }

  decreaseLevel() {
    if (this.currentLevel > GAME_CONFIG.MIN_LEVEL) {
      this.currentLevel--;
      this.presentationTime = this.getLevelTime(this.currentLevel);
      if (this.currentLevel < this.sessionLevelLow) {
        this.sessionLevelLow = this.currentLevel;
      }
      return true;
    }
    return false;
  }

  getLevelTime(level) {
    const levelTimes = {
      1: 1200, 2: 1100, 3: 1000, 4: 900, 5: 800,
      6: 700, 7: 600, 8: 500, 9: 400, 10: 300
    };
    return levelTimes[level] || 300;
  }

  // Trial management with robust 50/50 balancing
  generateTrialTypes() {
    this.trialTypes = [];
    this.relatedTrialsUsed = 0;
    this.unrelatedTrialsUsed = 0;
    this.totalTrialsPlanned = GAME_CONFIG.TRIALS_PER_SESSION;
    
    // Create exactly 50% related and 50% unrelated trials
    const halfTrials = Math.floor(this.totalTrialsPlanned / 2);
    
    // Add exactly half as related (true) and half as unrelated (false)
    for (let i = 0; i < halfTrials; i++) {
      this.trialTypes.push(true);  // Related trials
    }
    for (let i = 0; i < halfTrials; i++) {
      this.trialTypes.push(false); // Unrelated trials
    }
    
    // If odd number of trials, add one more unrelated to ensure balance
    if (this.totalTrialsPlanned % 2 === 1) {
      this.trialTypes.push(false);
    }
    
    // Shuffle the array using Fisher-Yates algorithm
    for (let i = this.trialTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.trialTypes[i], this.trialTypes[j]] = [this.trialTypes[j], this.trialTypes[i]];
    }
    
    console.log(`Generated ${this.trialTypes.length} trials: ${this.trialTypes.filter(t => t).length} related, ${this.trialTypes.filter(t => !t).length} unrelated`);
  }

  // Get next trial type with balance enforcement
  getNextTrialType() {
    if (this.trialCount >= this.trialTypes.length) {
      console.warn('Trial count exceeds planned trials, regenerating...');
      this.generateTrialTypes();
      this.trialCount = 0;
    }
    
    const trialType = this.trialTypes[this.trialCount];
    
    // Don't increment counters here - they should be incremented when the trial is actually used
    return trialType;
  }

  // Mark trial as used (call this when trial is actually presented)
  markTrialAsUsed() {
    const trialType = this.trialTypes[this.trialCount];
    if (trialType) {
      this.relatedTrialsUsed++;
    } else {
      this.unrelatedTrialsUsed++;
    }
  }

  // Verify trial balance
  verifyTrialBalance() {
    const totalUsed = this.relatedTrialsUsed + this.unrelatedTrialsUsed;
    const relatedPercentage = (this.relatedTrialsUsed / totalUsed) * 100;
    const unrelatedPercentage = (this.unrelatedTrialsUsed / totalUsed) * 100;
    
    console.log(`Trial balance: ${this.relatedTrialsUsed} related (${relatedPercentage.toFixed(1)}%), ${this.unrelatedTrialsUsed} unrelated (${unrelatedPercentage.toFixed(1)}%)`);
    
    // Ensure balance is within acceptable range (45-55%)
    const isBalanced = relatedPercentage >= 45 && relatedPercentage <= 55 && 
                      unrelatedPercentage >= 45 && unrelatedPercentage <= 55;
    
    if (!isBalanced) {
      console.warn('Trial balance is off! Related:', relatedPercentage.toFixed(1), '%, Unrelated:', unrelatedPercentage.toFixed(1), '%');
    }
    
    return isBalanced;
  }

  nextTrial() {
    this.trialCount++;
    this.waitingForNextTrial = false;
  }

  isSessionComplete() {
    return this.trialCount >= GAME_CONFIG.TRIALS_PER_SESSION;
  }

  // Performance tracking
  recordCorrectResponse() {
    this.totalCorrect++;
    this.totalAttempts++;
    this.consecutiveFailures = 0;
  }

  recordIncorrectResponse() {
    this.errorCount++;
    this.consecutiveFailures++;
    this.totalAttempts++;
  }

  recordTimeout() {
    this.errorCount++;
    this.consecutiveFailures++;
    this.totalAttempts++;
  }

  shouldDecreaseLevel() {
    return this.consecutiveFailures >= GAME_CONFIG.MAX_CONSECUTIVE_FAILURES;
  }

  shouldAdvanceLevel() {
    return this.errorCount <= GAME_CONFIG.MAX_ERRORS_PER_LEVEL;
  }

  // Mode management
  setMode(modeType) {
    this.modeType = modeType;
    this.lastRecordedLevel = this.lastRecordedLevels[modeType];
  }

  setProgressiveMode(isProgressive) {
    this.isProgressiveMode = isProgressive;
  }

  setManualLevel(level) {
    this.selectedLevel = level;
  }

  // Settings management
  setShowErrorCounts(show) {
    this.showErrorCounts = show;
    this.saveToStorage();
  }

  setNumberRange(range) {
    this.numberRange = range === 20 ? 20 : 10;
  }

  // Semantic tier management
  setSemanticTier(tier, enabled) {
    if (this.enabledSemanticTiers.hasOwnProperty(tier)) {
      this.enabledSemanticTiers[tier] = enabled;
    }
  }

  getEnabledSemanticTiers() {
    return this.enabledSemanticTiers;
  }

  // Session management
  startNewSession() {
    this.trialCount = 0;
    this.totalCorrect = 0;
    this.errorCount = 0;
    this.consecutiveFailures = 0;
    this.sessionHistory = [];
    this.generateTrialTypes();
    
    if (this.isProgressiveMode) {
      this.currentLevel = this.lastRecordedLevel;
    } else {
      this.currentLevel = this.selectedLevel;
    }
    
    this.presentationTime = this.getLevelTime(this.currentLevel);
    this.sessionLevelHigh = this.currentLevel;
    this.sessionLevelLow = this.currentLevel;
  }

  completeSession() {
    if (this.isProgressiveMode) {
      if (this.shouldAdvanceLevel()) {
        this.advanceLevel();
      }
      this.lastRecordedLevel = this.currentLevel;
      this.lastRecordedLevels[this.modeType] = this.currentLevel;
      this.saveToStorage();
    }
  }

  // Timer management
  setTimer(callback, delay) {
    this.clearTimer();
    this.timer = setTimeout(callback, delay);
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  // Utility methods
  getAccuracy() {
    return this.totalAttempts > 0 ? Math.round((this.totalCorrect / this.totalAttempts) * 100) : 0;
  }

  getProgressPercentage() {
    return (this.trialCount / GAME_CONFIG.TRIALS_PER_SESSION) * 100;
  }

  resetLevel() {
    this.lastRecordedLevels[this.modeType] = 1;
    this.lastRecordedLevel = 1;
    this.saveToStorage();
  }
}

// Create global game state instance
export const gameState = new GameState();
