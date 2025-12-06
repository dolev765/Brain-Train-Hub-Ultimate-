# Mission Start and End Points Documentation

This document tracks when missions/trials start and end in each app. A "mission" is defined as a single task that the user must complete, from when the task is presented until when the user's response is evaluated.

## 1. 3D MOT (just-3d-mot.netlify.app)

**Location**: `just-3d-mot.netlify.app/index.html`

### Mission START
- **When**: When balls are displayed and labeled for user selection
- **Code Location**: Line 1458-1462 in `afterHighlight()` function
- **Trigger**: After the highlight sequence completes and delay period ends
- **Key Code**:
  ```javascript
  isUserTurn = true;
  messageElement.textContent = 'Select in any order';
  freezeBalls();
  labelBalls();
  ```
- **Description**: Mission starts when `isUserTurn` becomes `true` and balls are labeled with keyboard hotkeys. This is when the user can begin selecting balls.

### Mission END
- **When**: After user selects all required balls (even if wrong selection)
- **Code Location**: Line 1598 in `checkUserSequence()` function
- **Trigger**: When `userSequence.length === targetSequence.length` (line 1568 or 1592)
- **Key Code**:
  ```javascript
  if (userSequence.length === targetSequence.length) {
    isUserTurn = false;
    checkUserSequence(); // Mission ends here
  }
  ```
- **Description**: Mission ends when the user has selected the required number of balls (e.g., if asked to track 3 balls, it ends after selecting 3 balls, regardless of correctness). The `checkUserSequence()` function then evaluates if the selection was correct or incorrect.

---

## 2. Syllogimous-v3 (Syllogism App)

**Location**: `Syllogimous-v3/js/index.js`

### Mission START
- **When**: When premises and conclusions are displayed to the user
- **Code Location**: Line 566 in `init()` function
- **Trigger**: When a new question is generated and initialized
- **Key Code**:
  ```javascript
  carouselInit();
  displayInit(); // Mission starts here - displays premises and conclusion
  ```
- **Description**: Mission starts when `displayInit()` is called, which renders the premises and conclusion to the display. If timer is enabled, `question.startedAt` is set when timer starts (line 404).

### Mission END
- **When**: When user submits an answer (True/False) on the conclusion
- **Code Location**: Lines 709 and 729 in `checkIfTrue()` and `checkIfFalse()` functions
- **Trigger**: User clicks True or False button
- **Key Code**:
  ```javascript
  // In checkIfTrue() or checkIfFalse():
  question.answerUser = true/false;
  question.answeredAt = new Date().getTime(); // Mission ends here
  storeQuestionAndSave();
  ```
- **Description**: Mission ends when the user clicks either the True or False button, which sets `question.answeredAt` timestamp. The answer is then evaluated and feedback is shown.

---

## 3. Bridge Analogy

**Location**: `bridge analogy/App.tsx`

### Mission START
- **When**: When the exercise (analogy base pair) is displayed to the user
- **Code Location**: Line 26 in `handleStartGame()` or `handleNextRound()` functions
- **Trigger**: When `setGameState(GameState.PLAYING)` is called
- **Key Code**:
  ```javascript
  setCurrentExercise(newExercise);
  setGameState(GameState.PLAYING); // Mission starts here - exercise displayed
  ```
- **Description**: Mission starts when the game state changes to `PLAYING` and the exercise (base pair A:B) is displayed to the user with input fields for C and D.

### Mission END
- **When**: When user submits their analogy answer
- **Code Location**: Line 33 in `handleSubmitAnalogy()` function
- **Trigger**: User clicks Submit button
- **Key Code**:
  ```javascript
  setGameState(GameState.JUDGING); // Mission ends here - answer submitted
  const result = await judgeAnalogy(currentExercise, playerAnalogy);
  setScores(result);
  setGameState(GameState.FEEDBACK);
  ```
- **Description**: Mission ends when `handleSubmitAnalogy()` is called, which changes state to `JUDGING` and evaluates the user's analogy answer.

---

## 4. Posner Task / Brain Train Epson (braintrainepson)

**Location**: `dolev765.github.io/braintrainepson/js/game-logic.js`

### Mission START
- **When**: When the stimulus pair (number pair) is displayed to the user
- **Code Location**: Line 104 in `generateStimulus()` function
- **Trigger**: After fixation cross disappears and stimulus is shown
- **Key Code**:
  ```javascript
  const pair = stimulusGenerator.generateStimulus();
  gameState.markTrialAsUsed();
  this.uiController.updateStimulusDisplay(pair); // Mission starts here
  ```
- **Description**: Mission starts when `updateStimulusDisplay(pair)` is called, displaying the number pair (e.g., "7-9") to the user. The trial is marked as used at this point.

### Mission END
- **When**: When user responds (J/F keys or buttons) or timeout occurs
- **Code Location**: Line 118 in `handleResponse(response)` function
- **Trigger**: User presses J/F key, clicks button, or presentation time expires
- **Key Code**:
  ```javascript
  handleResponse(response) { // Mission ends here when called
    gameState.waitingForNextTrial = true;
    gameState.clearTimer();
    // ... evaluate correctness ...
  }
  ```
- **Description**: Mission ends when `handleResponse()` is called with the user's response (or `null` for timeout). The response is evaluated for correctness based on the current rule (Physical Property or Meaning).

---

## 5. Peripheral Trainer (peripheraltrainer.netlify.app)

**Location**: `peripheraltrainer.netlify.app/` (React app with bundled JavaScript)

**Status**: ⚠️ **NEEDS SOURCE CODE ACCESS**
- This app uses bundled/minified JavaScript (`assets/index-CZ8eiYtn.js`)
- Source code structure not directly accessible in the deployed version
- **Action Required**: Need access to source React components to identify exact mission start/end points

**Expected Pattern** (based on typical peripheral vision training apps):
- **START**: Likely when a target stimulus appears in the peripheral vision area and user can begin responding
- **END**: Likely when user responds (clicks/keys) or stimulus presentation time expires

---

## 6. Trial and Error Reading - Transcription Game Mode

**Location**: `dolev765.github.io/Trial-and-Error-Reading/index.html`

### Mission START
- **When**: When the Transcription Game begins and text starts scrolling
- **Code Location**: `startTranscriptionGame()` function
- **Trigger**: User clicks "🎮 Transcription Game" button
- **Key Code**:
  ```javascript
  startTranscriptionGame() {
    this.generateRandomTextForGame(); // Random text generated
    this.transcriptionGame.active = true;
    this.transcriptionGame.missionStartTime = Date.now(); // Mission starts here
    // ... setup UI ...
    this.startAnimation(false, true);
    this.startTranscriptionWordTracking();
  }
  ```
- **Description**: Mission starts when `startTranscriptionGame()` is called. Random text is generated from multiple sources (Wordsmyth, Merriam Webster), the game state is initialized, `missionStartTime` is recorded, and word tracking begins. The user must transcribe manipulated words back to their original form before they cross the screen border.

### Mission END
- **When**: When user stops the game or animation completes
- **Code Location**: `stopTranscriptionGame()` function
- **Trigger**: User clicks "Stop Game" button
- **Key Code**:
  ```javascript
  stopTranscriptionGame() {
    this.transcriptionGame.active = false;
    this.transcriptionGame.missionEndTime = Date.now(); // Mission ends here
    // ... cleanup and show final score ...
  }
  ```
- **Description**: Mission ends when `stopTranscriptionGame()` is called. The `missionEndTime` is recorded, final score is calculated (with accuracy %), and results are displayed. Best scores are tracked across sessions.

### Game Mechanics
- **Word Tracking**: `startTranscriptionWordTracking()` monitors word positions in real-time
- **Correct Answer**: `handleTranscriptionCorrect()` - Points awarded = `pointsCorrect + (streak × streakBonus)`
- **Missed Word**: `handleTranscriptionMiss()` - Points deducted when word crosses left border before being answered
- **Scoring**: Score, streak, correct count, and missed count are tracked and displayed

---

## Summary Table

| App | Start Event | End Event | Status |
|-----|------------|-----------|--------|
| **3D MOT** | Balls displayed & labeled (`isUserTurn = true`, `labelBalls()`) | All balls selected (`checkUserSequence()` called) | ✅ Documented |
| **Syllogimous-v3** | Premises & conclusion displayed (`displayInit()`) | Answer submitted (`checkIfTrue()`/`checkIfFalse()`) | ✅ Documented |
| **Bridge Analogy** | Exercise displayed (`GameState.PLAYING`) | Analogy submitted (`handleSubmitAnalogy()`) | ✅ Documented |
| **Posner Task** | Stimulus pair displayed (`updateStimulusDisplay()`) | Response received (`handleResponse()`) | ✅ Documented |
| **Peripheral Trainer** | Unknown (bundled JS) | Unknown (bundled JS) | ⚠️ Needs Source Code |
| **Trial and Error Reading** | Game starts (`startTranscriptionGame()`, `missionStartTime`) | Game stops (`stopTranscriptionGame()`, `missionEndTime`) | ✅ Documented |

---

## Notes

- All documented apps follow a pattern where:
  - **START** = When the task/stimulus is presented to the user
  - **END** = When the user's response is received and evaluated

- For apps with timers, the start time may be recorded separately (e.g., `question.startedAt` in Syllogimous)

- Some apps may have intermediate states (e.g., highlighting phase in 3D MOT) but the actual mission starts when user interaction becomes possible

