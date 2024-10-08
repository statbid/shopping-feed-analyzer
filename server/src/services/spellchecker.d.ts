declare module 'spellchecker' {
    interface SpellChecker {
      isMisspelled(word: string): boolean;
      getCorrectionsForMisspelling(word: string): string[];
    }
  
    const spellchecker: SpellChecker;
    export = spellchecker;
  }
  