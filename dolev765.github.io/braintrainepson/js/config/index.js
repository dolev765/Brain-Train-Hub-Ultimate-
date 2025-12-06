// Game Configuration and Default Settings

export const GAME_CONFIG = {
  TRIALS_PER_SESSION: 32,
  MIN_LEVEL: 1,
  MAX_LEVEL: 10,
  FIXATION_DURATION: 500,
  FEEDBACK_DURATION: 1000,
  MAX_CONSECUTIVE_FAILURES: 3,
  MAX_ERRORS_PER_LEVEL: 3,
  STORAGE_KEYS: {
    TASK_DATA: 'posnerTaskData',
    PROGRESS: 'posnerTaskProgress'
  }
};

export const DEFAULT_SETTINGS = {
  modeType: 'multi',  // Default to Multi Mode
  numberRange: 10,    // Default to 1-10 range
  selectedLevel: 1,
  showErrorCounts: true
};

