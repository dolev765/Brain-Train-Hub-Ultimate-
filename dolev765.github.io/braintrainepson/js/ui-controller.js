// UI Controller - Handles all UI updates and interactions

import { gameState } from './game-state.js';
import { progressTracker } from './progress-tracker.js';

export class UIController {
  constructor() {
    this.screens = {
      descriptionScreen: document.getElementById('descriptionScreen'),
      ruleScreen: document.getElementById('ruleScreen'),
      fixationScreen: document.getElementById('fixationScreen'),
      taskScreen: document.getElementById('taskScreen'),
      sessionCompleteScreen: document.getElementById('sessionCompleteScreen'),
      scoreScreen: document.getElementById('scoreScreen'),
      progressScreen: document.getElementById('progressScreen')
    };
    
    this.elements = {
      lastCompletedLevel: document.getElementById('lastCompletedLevel'),
      currentLevel: document.getElementById('currentLevel'),
      currentLevel2: document.getElementById('currentLevel2'),
      currentLevelFixation: document.getElementById('currentLevelFixation'),
      currentTrial: document.getElementById('currentTrial'),
      currentTrialDisplay: document.getElementById('currentTrialDisplay'),
      currentTrialFixation: document.getElementById('currentTrialFixation'),
      currentErrors: document.getElementById('currentErrors'),
      currentErrorsRule: document.getElementById('currentErrorsRule'),
      currentErrorsFixation: document.getElementById('currentErrorsFixation'),
      currentConsecutiveFailures: document.getElementById('currentConsecutiveFailures'),
      currentConsecutiveFailuresRule: document.getElementById('currentConsecutiveFailuresRule'),
      currentConsecutiveFailuresFixation: document.getElementById('currentConsecutiveFailuresFixation'),
      currentRuleDisplay: document.getElementById('currentRuleDisplay'),
      ruleInstructions: document.getElementById('ruleInstructions'),
      stimulusPair: document.getElementById('stimulusPair'),
      feedbackMessage: document.getElementById('feedbackMessage'),
      progressFill2: document.getElementById('progressFill2'),
      sessionCorrectCount: document.getElementById('sessionCorrectCount'),
      sessionAccuracy: document.getElementById('sessionAccuracy'),
      sessionFinalLevel: document.getElementById('sessionFinalLevel'),
      accuracyRate: document.getElementById('accuracyRate'),
      finalLevel: document.getElementById('finalLevel'),
      historyContainer: document.getElementById('historyContainer'),
      modeDescription: document.getElementById('modeDescription'),
      manualModeControls: document.getElementById('manualModeControls'),
      errorCountsDisplay: document.getElementById('errorCountsDisplay'),
      errorCountsDisplayRule: document.getElementById('errorCountsDisplayRule'),
      errorCountsDisplayFixation: document.getElementById('errorCountsDisplayFixation')
    };
  }

  // Screen management
  showScreen(screenId) {
    this.hideAllScreens();
    if (this.screens[screenId]) {
      this.screens[screenId].style.display = 'flex';
    }
  }

  hideScreen(screenId) {
    if (this.screens[screenId]) {
      this.screens[screenId].style.display = 'none';
    }
  }

  hideAllScreens() {
    Object.values(this.screens).forEach(screen => {
      if (screen) screen.style.display = 'none';
    });
  }

  // Update game header information
  updateGameHeader() {
    if (this.elements.currentLevel) {
      this.elements.currentLevel.textContent = gameState.currentLevel;
    }
    if (this.elements.currentLevel2) {
      this.elements.currentLevel2.textContent = gameState.currentLevel;
    }
    if (this.elements.currentLevelFixation) {
      this.elements.currentLevelFixation.textContent = gameState.currentLevel;
    }
    if (this.elements.currentTrial) {
      this.elements.currentTrial.textContent = gameState.trialCount + 1;
    }
    if (this.elements.currentTrialDisplay) {
      this.elements.currentTrialDisplay.textContent = gameState.trialCount + 1;
    }
    if (this.elements.currentTrialFixation) {
      this.elements.currentTrialFixation.textContent = gameState.trialCount + 1;
    }
  }

  // Update rule display
  updateRuleDisplay(ruleInfo) {
    if (this.elements.currentRuleDisplay) {
      this.elements.currentRuleDisplay.textContent = ruleInfo.title;
    }
    if (this.elements.ruleInstructions) {
      this.elements.ruleInstructions.textContent = ruleInfo.description;
    }
  }

  // Update error counts
  updateErrorCounts() {
    const errorCount = gameState.errorCount;
    const consecutiveFailures = gameState.consecutiveFailures;
    
    if (this.elements.currentErrors) {
      this.elements.currentErrors.textContent = errorCount;
    }
    if (this.elements.currentErrorsRule) {
      this.elements.currentErrorsRule.textContent = errorCount;
    }
    if (this.elements.currentErrorsFixation) {
      this.elements.currentErrorsFixation.textContent = errorCount;
    }
    if (this.elements.currentConsecutiveFailures) {
      this.elements.currentConsecutiveFailures.textContent = consecutiveFailures;
    }
    if (this.elements.currentConsecutiveFailuresRule) {
      this.elements.currentConsecutiveFailuresRule.textContent = consecutiveFailures;
    }
    if (this.elements.currentConsecutiveFailuresFixation) {
      this.elements.currentConsecutiveFailuresFixation.textContent = consecutiveFailures;
    }
  }

  // Update error counts display visibility
  updateErrorCountsDisplay() {
    const display = gameState.showErrorCounts ? 'flex' : 'none';
    
    if (this.elements.errorCountsDisplay) {
      this.elements.errorCountsDisplay.style.display = display;
    }
    if (this.elements.errorCountsDisplayRule) {
      this.elements.errorCountsDisplayRule.style.display = display;
    }
    if (this.elements.errorCountsDisplayFixation) {
      this.elements.errorCountsDisplayFixation.style.display = display;
    }
  }

  // Update stimulus display
  updateStimulusDisplay(pair) {
    if (this.elements.stimulusPair) {
      this.elements.stimulusPair.textContent = `${pair.item1.value}-${pair.item2.value}`;
    }
  }

  // Clear stimulus display
  clearStimulusDisplay() {
    if (this.elements.stimulusPair) {
      this.elements.stimulusPair.textContent = '';
    }
  }

  // Update progress bar
  updateProgress() {
    if (this.elements.progressFill2) {
      const progress = gameState.getProgressPercentage();
      this.elements.progressFill2.style.width = `${progress}%`;
    }
  }

  // Show feedback message
  showFeedback(isCorrect, message) {
    if (this.elements.feedbackMessage) {
      this.elements.feedbackMessage.textContent = message;
      this.elements.feedbackMessage.className = isCorrect ? 'correct-feedback' : 'incorrect-feedback';
      this.elements.feedbackMessage.style.display = 'block';
      
      setTimeout(() => {
        this.elements.feedbackMessage.style.display = 'none';
      }, 1000);
    }
  }

  // Hide feedback message
  hideFeedback() {
    if (this.elements.feedbackMessage) {
      this.elements.feedbackMessage.style.display = 'none';
    }
  }

  // Show level change message
  showLevelChangeMessage(message) {
    const levelMessage = document.createElement('div');
    levelMessage.textContent = message;
    levelMessage.style.position = 'fixed';
    levelMessage.style.top = '50%';
    levelMessage.style.left = '50%';
    levelMessage.style.transform = 'translate(-50%, -50%)';
    levelMessage.style.padding = '20px';
    levelMessage.style.backgroundColor = '#cc2929';
    levelMessage.style.color = 'white';
    levelMessage.style.borderRadius = '10px';
    levelMessage.style.fontWeight = 'bold';
    levelMessage.style.zIndex = '9999';
    levelMessage.style.fontFamily = 'Inter, sans-serif';
    
    document.body.appendChild(levelMessage);
    
    setTimeout(() => {
      if (document.body.contains(levelMessage)) {
        document.body.removeChild(levelMessage);
      }
    }, 2000);
  }

  // Update session results
  updateSessionResults() {
    if (this.elements.sessionCorrectCount) {
      this.elements.sessionCorrectCount.textContent = gameState.totalCorrect;
    }
    if (this.elements.sessionAccuracy) {
      this.elements.sessionAccuracy.textContent = `${gameState.getAccuracy()}%`;
    }
    if (this.elements.sessionFinalLevel) {
      this.elements.sessionFinalLevel.textContent = gameState.currentLevel;
    }
  }

  // Update last completed level
  updateLastCompletedLevel() {
    if (this.elements.lastCompletedLevel) {
      this.elements.lastCompletedLevel.textContent = gameState.lastRecordedLevel;
    }
  }

  // Update mode description
  updateModeDescription(modeType) {
    if (!this.elements.modeDescription) return;
    
    const descriptions = {
      classic: '<strong>Classic Mode:</strong> Meaning vs Physical rule on numbers. Progressive difficulty.',
      multi: '<strong>Multi Mode:</strong> Includes numbers and semantic relationships. Progressive difficulty.',
      manual: '<strong>Manual Mode:</strong> Practice with a fixed difficulty level of your choice. Good for focused training at a specific difficulty level.'
    };
    
    this.elements.modeDescription.innerHTML = descriptions[modeType] || descriptions.classic;
  }

  // Show manual controls
  showManualControls() {
    if (this.elements.manualModeControls) {
      this.elements.manualModeControls.style.display = 'block';
    }
  }

  // Hide manual controls
  hideManualControls() {
    if (this.elements.manualModeControls) {
      this.elements.manualModeControls.style.display = 'none';
    }
  }

  // Add history item
  addHistoryItem(historyItem) {
    if (!this.elements.historyContainer) return;
    
    const historyElement = document.createElement('div');
    historyElement.className = `history-item ${historyItem.isCorrect ? 'correct' : 'incorrect'}`;
    
    const ruleText = historyItem.rule === 1 ? 'Physical Property' : 'Meaning';
    const correctAnswer = historyItem.rule === 1 ? 
      (historyItem.pair.sameFormat ? 'Same format (J)' : 'Different format (F)') :
      (historyItem.pair.sameMeaning ? 'Same meaning (J)' : 'Different meaning (F)');
    const userAnswer = historyItem.response === null ? 'No response (timeout)' : 
      (historyItem.response === true ? 'Same (J)' : 'Different (F)');
    
    historyElement.innerHTML = `
      <div class="history-content">
        <div class="trial-title">Trial ${historyItem.trial}: ${ruleText} (Level ${historyItem.level})</div>
        <div class="trial-details">
          <div>Stimulus: ${historyItem.pair.item1.value}-${historyItem.pair.item2.value}</div>
          <div>Correct answer: ${correctAnswer}</div>
          <div>Your answer: ${userAnswer}</div>
        </div>
      </div>
      <div class="history-icon">
        ${historyItem.isCorrect ? 
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : 
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
        }
      </div>
    `;
    
    this.elements.historyContainer.prepend(historyElement);
  }

  // Clear history
  clearHistory() {
    if (this.elements.historyContainer) {
      this.elements.historyContainer.innerHTML = '';
    }
  }

  // Update score screen stats
  updateScoreStats() {
    if (this.elements.accuracyRate) {
      this.elements.accuracyRate.textContent = `${gameState.getAccuracy()}%`;
    }
    if (this.elements.finalLevel) {
      this.elements.finalLevel.textContent = gameState.currentLevel;
    }
  }

  // Update trial balance display
  updateTrialBalance() {
    const totalUsed = gameState.relatedTrialsUsed + gameState.unrelatedTrialsUsed;
    if (totalUsed > 0) {
      const relatedPercentage = (gameState.relatedTrialsUsed / totalUsed) * 100;
      const unrelatedPercentage = (gameState.unrelatedTrialsUsed / totalUsed) * 100;
      
      console.log(`Trial Balance: ${gameState.relatedTrialsUsed} related (${relatedPercentage.toFixed(1)}%), ${gameState.unrelatedTrialsUsed} unrelated (${unrelatedPercentage.toFixed(1)}%)`);
      
      // Update any balance display elements if they exist
      const balanceElement = document.getElementById('trialBalance');
      if (balanceElement) {
        balanceElement.textContent = `Balance: ${relatedPercentage.toFixed(0)}%/${unrelatedPercentage.toFixed(0)}%`;
      }
    }
  }

  // Show progress screen
  showProgressScreen() {
    this.hideAllScreens();
    this.showScreen('progressScreen');
    progressTracker.renderProgressChart();
  }
}

// Create global UI controller instance
export const uiController = new UIController();

