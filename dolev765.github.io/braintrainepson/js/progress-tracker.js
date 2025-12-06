// Progress Tracker - Handles progress tracking and visualization

import { gameState } from './game-state.js';
import { GAME_CONFIG } from './config/index.js';

export class ProgressTracker {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  // Initialize canvas for progress chart
  initCanvas() {
    this.canvas = document.getElementById('progressCanvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  }

  // Get today's date key
  getTodayKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Read progress data from localStorage
  readProgress() {
    const raw = localStorage.getItem(GAME_CONFIG.STORAGE_KEYS.PROGRESS);
    if (!raw) return {};
    try {
      return JSON.parse(raw) || {};
    } catch {
      return {};
    }
  }

  // Write progress data to localStorage
  writeProgress(progressObj) {
    localStorage.setItem(GAME_CONFIG.STORAGE_KEYS.PROGRESS, JSON.stringify(progressObj));
  }

  // Record progress for today
  recordProgressForToday(entry) {
    const progress = this.readProgress();
    const key = this.getTodayKey();
    if (!progress[key]) progress[key] = [];
    progress[key].push({ 
      ...entry, 
      ts: Date.now(), 
      mode: gameState.modeType 
    });
    this.writeProgress(progress);
  }

  // Aggregate daily progress data
  aggregateDaily(progress) {
    const dates = Object.keys(progress).sort();
    const filter = (document.getElementById('progressModeFilter')?.value) || 'all';
    const rows = [];
    
    for (const date of dates) {
      let items = progress[date] || [];
      if (filter !== 'all') {
        items = items.filter(it => it.mode === filter);
      }
      if (items.length === 0) continue; // skip dates with no data for this filter
      
      let high = -Infinity, low = Infinity, final = null, lastTs = -Infinity;
      
      for (const it of items) {
        if (typeof it.high === 'number' && it.high > high) high = it.high;
        if (typeof it.low === 'number' && it.low < low) low = it.low;
        if (it.ts > lastTs) { 
          lastTs = it.ts; 
          final = it.final; 
        }
      }
      
      if (high === -Infinity) high = null;
      if (low === Infinity) low = null;
      
      rows.push({ date, final, high, low });
    }
    
    return rows;
  }

  // Render progress chart
  renderProgressChart() {
    if (!this.ctx) {
      this.initCanvas();
      if (!this.ctx) return;
    }
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const padding = { left: 40, right: 10, top: 20, bottom: 30 };
    const w = this.canvas.width - padding.left - padding.right;
    const h = this.canvas.height - padding.top - padding.bottom;
    
    const progress = this.readProgress();
    const data = this.aggregateDaily(progress);
    
    if (data.length === 0) {
      this.ctx.fillStyle = '#403d3d';
      this.ctx.font = '14px Inter';
      this.ctx.fillText(
        'No progress data yet. Complete a session to see your progress.', 
        padding.left, 
        padding.top + 20
      );
      return;
    }
    
    const yMin = 1, yMax = 10;
    const xCount = data.length;
    
    // Helper functions for positioning
    const xPos = (i) => {
      if (xCount <= 1) return padding.left + w / 2;
      return padding.left + (i * (w / (xCount - 1)));
    };
    
    const yPos = (level) => {
      const t = (level - yMin) / (yMax - yMin);
      return padding.top + (1 - t) * h;
    };
    
    // Draw grid lines
    this.ctx.strokeStyle = '#e6dede';
    this.ctx.lineWidth = 1;
    for (let lvl = yMin; lvl <= yMax; lvl += 1) {
      const y = yPos(lvl);
      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, y);
      this.ctx.lineTo(padding.left + w, y);
      this.ctx.stroke();
    }
    
    // Draw y-axis labels
    this.ctx.fillStyle = '#403d3d';
    this.ctx.font = '12px Inter';
    this.ctx.textAlign = 'right';
    for (let lvl = yMin; lvl <= yMax; lvl += 1) {
      const y = yPos(lvl);
      this.ctx.fillText(lvl.toString(), padding.left - 8, y + 4);
    }
    
    // Draw x-axis labels
    this.ctx.textAlign = 'center';
    data.forEach((d, i) => {
      const x = xPos(i);
      this.ctx.fillText(d.date.slice(5), x, padding.top + h + 18);
    });
    
    // Draw data lines
    this.drawLine('#cc2929', data, d => d.final);
    this.drawLine('#2d7a2d', data, d => d.high);
    this.drawLine('#1f4f8a', data, d => d.low);
  }

  // Draw a data line
  drawLine(color, data, accessor) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    let started = false;
    
    data.forEach((d, i) => {
      const val = accessor(d);
      if (val == null) return;
      
      const padding = { left: 40, right: 10, top: 20, bottom: 30 };
      const w = this.canvas.width - padding.left - padding.right;
      const h = this.canvas.height - padding.top - padding.bottom;
      const xCount = data.length;
      
      const x = xCount <= 1 ? padding.left + w / 2 : padding.left + (i * (w / (xCount - 1)));
      const y = padding.top + (1 - (val - 1) / 9) * h;
      
      if (!started) {
        this.ctx.moveTo(x, y);
        started = true;
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    
    this.ctx.stroke();
    
    // Draw data points
    this.ctx.fillStyle = color;
    data.forEach((d, i) => {
      const val = accessor(d);
      if (val == null) return;
      
      const padding = { left: 40, right: 10, top: 20, bottom: 30 };
      const w = this.canvas.width - padding.left - padding.right;
      const h = this.canvas.height - padding.top - padding.bottom;
      const xCount = data.length;
      
      const x = xCount <= 1 ? padding.left + w / 2 : padding.left + (i * (w / (xCount - 1)));
      const y = padding.top + (1 - (val - 1) / 9) * h;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  // Show progress screen
  showProgressScreen() {
    if (this.uiController) {
      this.uiController.hideAllScreens();
      this.uiController.showScreen('progressScreen');
      this.renderProgressChart();
    }
  }

  // Bind progress filter event
  bindProgressFilter() {
    const progressModeFilter = document.getElementById('progressModeFilter');
    if (progressModeFilter && !progressModeFilter._bound) {
      progressModeFilter.addEventListener('change', () => this.renderProgressChart());
      progressModeFilter._bound = true;
    }
  }

  // Set UI controller reference
  setUIController(uiController) {
    this.uiController = uiController;
  }
}

// Create global progress tracker instance
export const progressTracker = new ProgressTracker();
