var path = require('path'),
    base = path.join(__dirname, 'dict');

var dictionaries = [
    'american-english',
    'american-english-small',
    'american-english-large',
    'american-english-huge',
    'american-english-insane'
];

dictionaries.forEach(function(dict) {
    module.exports[dict] = path.join(base, dict);
});

// default words list
module.exports.words = module.exports['american-english'];
