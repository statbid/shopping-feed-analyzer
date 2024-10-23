"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSymSpellInstance = getSymSpellInstance;
// SymSpell Initialization File - utils/symspell.ts
const symspell_1 = __importDefault(require("symspell"));
const path_1 = __importDefault(require("path"));
let symSpellInstance = null;
function getSymSpellInstance() {
    if (!symSpellInstance) {
        symSpellInstance = new symspell_1.default(2, 7); // Max edit distance is 2, prefix length is 7
        const dictionaryPath = path_1.default.resolve(__dirname, '../dictionaries/frequency_dictionary_en_82_765.txt');
        try {
            symSpellInstance.loadDictionary(dictionaryPath, 0, 1);
            console.log(`Dictionary loaded from ${dictionaryPath}`);
        }
        catch (error) {
            console.error(`Failed to load dictionary from ${dictionaryPath}:`, error);
        }
    }
    return symSpellInstance;
}
