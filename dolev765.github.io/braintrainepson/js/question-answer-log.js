// Question-Answer Log functionality
export class QuestionAnswerLog {
  constructor() {
    this.logContainer = document.getElementById('logEntries');
    this.closeButton = document.getElementById('closeLog');
    this.logElement = document.getElementById('questionAnswerLog');
    this.isVisible = false;
    this.entries = [];
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => {
        this.hideModal();
      });
    }
    
    const exportButton = document.getElementById('exportLog');
    if (exportButton) {
      exportButton.addEventListener('click', () => {
        this.exportLog();
      });
    }
    
    // Close modal when clicking outside
    if (this.logElement) {
      this.logElement.addEventListener('click', (e) => {
        if (e.target === this.logElement) {
          this.hideModal();
        }
      });
    }
  }

  showModal() {
    this.isVisible = true;
    if (this.logElement) {
      this.logElement.classList.remove('hidden');
    }
  }

  hideModal() {
    this.isVisible = false;
    if (this.logElement) {
      this.logElement.classList.add('hidden');
    }
  }

  addEntry(pair, response, isCorrect, ruleInfo, responseTime = null) {
    const trialNumber = this.entries.length + 1;
    const timestamp = new Date().toLocaleTimeString();
    
    const entry = {
      trialNumber,
      pair: pair ? `${pair.item1.value}-${pair.item2.value}` : 'N/A',
      rule: ruleInfo ? ruleInfo.title : 'Unknown',
      response: this.formatResponse(response),
      isCorrect,
      responseTime: responseTime ? `${responseTime}ms` : 'N/A',
      timestamp
    };

    this.entries.push(entry);
    this.renderEntry(entry);
    
    // Auto-scroll to bottom
    this.scrollToBottom();
  }

  formatResponse(response) {
    if (response === null) return 'Timeout';
    if (response === true) return 'J (Same)';
    if (response === false) return 'F (Different)';
    return String(response);
  }

  renderEntry(entry) {
    const entryElement = document.createElement('div');
    entryElement.className = 'log-entry';
    
    const responseClass = entry.isCorrect ? 'correct' : 'incorrect';
    const correctClass = entry.isCorrect ? 'yes' : 'no';
    
    if (entry.response === 'Timeout') {
      entryElement.querySelector('.log-response')?.classList.add('timeout');
    }

    entryElement.innerHTML = `
      <div class="log-trial">${entry.trialNumber}</div>
      <div class="log-pair">${entry.pair}</div>
      <div class="log-rule">${entry.rule}</div>
      <div class="log-response ${responseClass}">${entry.response}</div>
      <div class="log-correct ${correctClass}">${entry.isCorrect ? 'Yes' : 'No'}</div>
      <div class="log-time">${entry.timestamp}</div>
    `;

    this.logContainer.appendChild(entryElement);
  }

  scrollToBottom() {
    if (this.logContainer) {
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
  }

  clearLog() {
    this.entries = [];
    if (this.logContainer) {
      this.logContainer.innerHTML = '';
    }
  }

  getLogData() {
    return this.entries;
  }

  exportLog() {
    const data = this.entries.map(entry => ({
      trial: entry.trialNumber,
      pair: entry.pair,
      rule: entry.rule,
      response: entry.response,
      correct: entry.isCorrect,
      time: entry.responseTime,
      timestamp: entry.timestamp
    }));

    const csv = this.arrayToCSV(data);
    this.downloadCSV(csv, 'question-answer-log.csv');
  }

  arrayToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
