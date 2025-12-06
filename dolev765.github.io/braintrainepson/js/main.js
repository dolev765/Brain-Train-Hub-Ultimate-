// Main JavaScript file - Initializes the application and handles event listeners

import { gameState } from './game-state.js';
import { gameLogic } from './game-logic.js';
import { uiController } from './ui-controller.js';
import { progressTracker } from './progress-tracker.js';
import { QuestionAnswerLog } from './question-answer-log.js';

// Initialize the application
class PosnerTaskApp {
  constructor() {
    this.initializeApp();
    this.setupEventListeners();
    this.setupKeyboardListeners();
  }

  // Initialize the application
  initializeApp() {
    // Set up cross-references
    gameLogic.setUIController(uiController);
    progressTracker.setUIController(uiController);
    
    // Initialize question-answer log
    this.questionAnswerLog = new QuestionAnswerLog();
    gameLogic.setQuestionAnswerLog(this.questionAnswerLog);
    
    // Initialize UI
    uiController.updateLastCompletedLevel();
    uiController.updateErrorCountsDisplay();
    
    // Check for hub URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const isFromHub = urlParams.get('hub') === 'true' || urlParams.get('autostart') === 'true';
    
    // Get ALL settings from URL params
    const modeParam = urlParams.get('mode') || 'multi';
    const rangeParam = parseInt(urlParams.get('range')) || 10;
    const showErrorsParam = urlParams.get('showErrors') !== 'false';
    const tier2Param = urlParams.get('tier2') === 'true';
    const tier3Param = urlParams.get('tier3') === 'true';
    
    // Set initial mode from params
    this.selectMode(modeParam);
    
    // Set number range
    const rangeSelect = document.getElementById('numberRangeSelect');
    if (rangeSelect) {
      rangeSelect.value = rangeParam.toString();
      gameLogic.updateNumberRange(rangeParam);
    }
    
    // Set show error counts
    const showErrorCountsCheckbox = document.getElementById('showErrorCounts');
    if (showErrorCountsCheckbox) {
      showErrorCountsCheckbox.checked = showErrorsParam;
      gameLogic.updateShowErrorCounts(showErrorsParam);
    }
    
    // Set semantic tier toggles
    const tier2Toggle = document.getElementById('tier2Toggle');
    const tier3Toggle = document.getElementById('tier3Toggle');
    if (tier2Toggle) { tier2Toggle.checked = tier2Param; gameState.setSemanticTier('tier2', tier2Param); }
    if (tier3Toggle) { tier3Toggle.checked = tier3Param; gameState.setSemanticTier('tier3', tier3Param); }
    
    // Listen for hub settings via postMessage
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'HUB_SETTINGS') {
        if (event.data.settings && event.data.settings.epson) {
          const e = event.data.settings.epson;
          if (e.mode) this.selectMode(e.mode);
          if (e.range) {
            const rangeSelect = document.getElementById('numberRangeSelect');
            if (rangeSelect) {
              rangeSelect.value = e.range.toString();
              gameLogic.updateNumberRange(e.range);
            }
          }
          if (e.showErrors !== undefined) {
            const cb = document.getElementById('showErrorCounts');
            if (cb) { cb.checked = e.showErrors; gameLogic.updateShowErrorCounts(e.showErrors); }
          }
          if (e.tier2 !== undefined) gameState.setSemanticTier('tier2', e.tier2);
          if (e.tier3 !== undefined) gameState.setSemanticTier('tier3', e.tier3);
        }
        if (event.data.autostart) {
          setTimeout(() => gameLogic.startTask(), 500);
        }
      }
    });
    
    // Auto-start if from hub
    if (isFromHub) {
      // Hide description screen elements for minimalist mode
      const topControls = document.querySelector('.top-controls');
      const settingsPanel = document.getElementById('settingsPanel');
      if (topControls) topControls.style.display = 'none';
      if (settingsPanel) settingsPanel.style.display = 'none';
      
      // Auto-start after brief delay
      setTimeout(() => gameLogic.startTask(), 500);
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Mode selection
    document.getElementById('progressiveMode')?.addEventListener('click', () => {
      this.selectMode('classic');
    });

    document.getElementById('comprehensiveMode')?.addEventListener('click', () => {
      this.selectMode('multi');
    });

    document.getElementById('manualMode')?.addEventListener('click', () => {
      this.selectManualMode();
    });

    // Number range selection
    const rangeSelect = document.getElementById('numberRangeSelect');
    if (rangeSelect) {
      rangeSelect.addEventListener('change', (e) => {
        gameLogic.updateNumberRange(parseInt(e.target.value));
      });
    }

    // Level buttons for manual mode
    const levelButtons = document.querySelectorAll('.level-button');
    levelButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        levelButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        gameLogic.selectManualLevel(parseInt(e.target.getAttribute('data-level')));
      });
    });

    // Settings
    document.getElementById('showErrorCounts')?.addEventListener('change', (e) => {
      gameLogic.updateShowErrorCounts(e.target.checked);
    });

    // Settings panel
    document.getElementById('settingsToggle')?.addEventListener('click', () => {
      this.toggleSettingsPanel();
    });

    // Logs modal
    document.getElementById('logsToggle')?.addEventListener('click', () => {
      this.questionAnswerLog.showModal();
    });

    // Semantic tier toggles
    document.getElementById('tier2Toggle')?.addEventListener('change', (e) => {
      gameState.setSemanticTier('tier2', e.target.checked);
    });

    document.getElementById('tier3Toggle')?.addEventListener('change', (e) => {
      gameState.setSemanticTier('tier3', e.target.checked);
    });

    // Main action buttons
    document.getElementById('startTask')?.addEventListener('click', () => {
      gameLogic.startTask();
    });

    document.getElementById('continueButton')?.addEventListener('click', () => {
      gameLogic.showFixationCross();
    });

    document.getElementById('differentButton')?.addEventListener('click', () => {
      gameLogic.handleResponse(false);
    });

    document.getElementById('sameButton')?.addEventListener('click', () => {
      gameLogic.handleResponse(true);
    });

    // Navigation buttons
    document.getElementById('backToHomeFromRule')?.addEventListener('click', () => {
      this.goBackToHome();
    });

    document.getElementById('backToHomeFromTask')?.addEventListener('click', () => {
      this.goBackToHome();
    });

    document.getElementById('backToHomeFromFixation')?.addEventListener('click', () => {
      this.goBackToHome();
    });

    // Session management
    document.getElementById('returnToMenu')?.addEventListener('click', () => {
      gameLogic.returnToMenu();
    });

    document.getElementById('startNewSession')?.addEventListener('click', () => {
      gameLogic.startNewSession();
    });

    document.getElementById('startNewTest')?.addEventListener('click', () => {
      gameLogic.startNewTest();
    });

    // Progress and settings
    document.getElementById('viewProgress')?.addEventListener('click', () => {
      progressTracker.showProgressScreen();
    });

    document.getElementById('progressBackToMenu')?.addEventListener('click', () => {
      uiController.hideAllScreens();
      uiController.showScreen('descriptionScreen');
    });

    document.getElementById('resetLevel')?.addEventListener('click', () => {
      gameLogic.resetLevel();
    });

    // Progress filter
    const progressModeFilter = document.getElementById('progressModeFilter');
    if (progressModeFilter) {
      progressModeFilter.addEventListener('change', () => {
        progressTracker.renderProgressChart();
      });
    }
  }

  // Setup keyboard listeners
  setupKeyboardListeners() {
    document.addEventListener('keydown', (event) => {
      // Rule screen - spacebar to continue
      if (uiController.screens.ruleScreen?.style.display !== 'none' && 
          (event.key === ' ' || event.code === 'Space')) {
        event.preventDefault();
        gameLogic.showFixationCross();
      }
      
      // Task screen - F and J keys for responses
      if (uiController.screens.taskScreen?.style.display !== 'none') {
        if (event.key === 'f' || event.key === 'F') {
          event.preventDefault();
          gameLogic.handleResponse(false);
        } else if (event.key === 'j' || event.key === 'J') {
          event.preventDefault();
          gameLogic.handleResponse(true);
        }
      }
    });
  }

  // Select game mode
  selectMode(modeType) {
    // Update button states
    document.getElementById('progressiveMode')?.classList.remove('active');
    document.getElementById('comprehensiveMode')?.classList.remove('active');
    document.getElementById('manualMode')?.classList.remove('active');
    
    if (modeType === 'classic') {
      document.getElementById('progressiveMode')?.classList.add('active');
    } else if (modeType === 'multi') {
      document.getElementById('comprehensiveMode')?.classList.add('active');
    }
    
    // Hide manual controls
    uiController.hideManualControls();
    
    // Update game state and UI
    gameLogic.selectMode(modeType);
  }

  // Select manual mode
  selectManualMode() {
    // Update button states
    document.getElementById('progressiveMode')?.classList.remove('active');
    document.getElementById('comprehensiveMode')?.classList.remove('active');
    document.getElementById('manualMode')?.classList.add('active');
    
    // Show manual controls
    uiController.showManualControls();
    
    // Update game state and UI
    gameLogic.selectManualMode();
  }

  // Go back to home screen
  goBackToHome() {
    gameState.clearTimer();
    uiController.hideAllScreens();
    uiController.showScreen('descriptionScreen');
    gameLogic.resetTest();
  }

  // Toggle settings panel
  toggleSettingsPanel() {
    const panel = document.getElementById('settingsPanel');
    if (panel) {
      panel.classList.toggle('hidden');
    }
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PosnerTaskApp();
});

// Export for potential external use
export { PosnerTaskApp };
