// Stimulus Generator - Creates number pairs in various formats

import { gameState } from './game-state.js';

// Number to word mapping
const NUMBER_WORDS = {
  1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
  6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
  11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen',
  16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty'
};

// Number to Roman numeral mapping
const ROMAN_NUMERALS = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
  6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
  11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV',
  16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX'
};

// Format types
const FORMAT_TYPES = {
  ARABIC: 'arabic',
  WORD: 'word',
  ROMAN: 'roman'
};

class StimulusGenerator {
  constructor() {
    this.currentRule = 1; // 1 = Physical Property, 2 = Meaning
    this.formatUsage = {
      arabic: 0,
      word: 0,
      roman: 0
    };
  }

  // Reset format usage tracking
  resetFormatUsage() {
    this.formatUsage = {
      arabic: 0,
      word: 0,
      roman: 0
    };
  }

  // Select random rule (1 = Physical Property, 2 = Meaning)
  selectRandomRule() {
    // Randomly select rule 1 or 2
    this.currentRule = Math.random() < 0.5 ? 1 : 2;
    gameState.currentRule = this.currentRule;
  }

  // Get rule display information
  getRuleDisplay() {
    if (this.currentRule === 1) {
      return {
        title: 'Physical Property Rule',
        description: 'Press "J" if items have the same format, press "F" if they have different formats.'
      };
    } else {
      return {
        title: 'Meaning Rule',
        description: 'Press "J" if items represent the same number, press "F" if they represent different numbers.'
      };
    }
  }

  // Generate a random number within range
  getRandomNumber() {
    return Math.floor(Math.random() * gameState.numberRange) + 1;
  }

  // Get format type for a number
  getFormatType(value, format) {
    if (format === FORMAT_TYPES.ARABIC) {
      return { value: value.toString(), format: FORMAT_TYPES.ARABIC };
    } else if (format === FORMAT_TYPES.WORD) {
      return { value: NUMBER_WORDS[value] || value.toString(), format: FORMAT_TYPES.WORD };
    } else if (format === FORMAT_TYPES.ROMAN) {
      return { value: ROMAN_NUMERALS[value] || value.toString(), format: FORMAT_TYPES.ROMAN };
    }
    return { value: value.toString(), format: FORMAT_TYPES.ARABIC };
  }

  // Select format with usage balancing
  selectFormat() {
    const formats = [FORMAT_TYPES.ARABIC, FORMAT_TYPES.WORD, FORMAT_TYPES.ROMAN];
    const usage = formats.map(f => this.formatUsage[f]);
    const minUsage = Math.min(...usage);
    const leastUsed = formats.filter(f => this.formatUsage[f] === minUsage);
    return leastUsed[Math.floor(Math.random() * leastUsed.length)];
  }

  // Generate stimulus pair
  generateStimulus() {
    const trialType = gameState.getNextTrialType();
    
    let num1, num2;
    let sameFormat = false;
    let sameMeaning = false;

    if (trialType) {
      // Related trial - same meaning
      num1 = this.getRandomNumber();
      num2 = num1; // Same number
      sameMeaning = true;
    } else {
      // Unrelated trial - different meaning
      num1 = this.getRandomNumber();
      do {
        num2 = this.getRandomNumber();
      } while (num2 === num1);
      sameMeaning = false;
    }

    // Select formats
    let format1, format2;
    
    if (gameState.currentRule === 1) {
      // Physical Property Rule - test format matching
      if (Math.random() < 0.5) {
        // Same format
        format1 = this.selectFormat();
        format2 = format1;
        sameFormat = true;
      } else {
        // Different formats
        format1 = this.selectFormat();
        do {
          format2 = this.selectFormat();
        } while (format2 === format1);
        sameFormat = false;
      }
    } else {
      // Meaning Rule - formats can be different, test meaning
      format1 = this.selectFormat();
      format2 = this.selectFormat();
      sameFormat = (format1 === format2);
    }

    // Track format usage
    this.formatUsage[format1]++;
    this.formatUsage[format2]++;

    const item1 = this.getFormatType(num1, format1);
    const item2 = this.getFormatType(num2, format2);

    return {
      item1,
      item2,
      sameFormat,
      sameMeaning
    };
  }
}

// Create and export singleton instance
export const stimulusGenerator = new StimulusGenerator();

