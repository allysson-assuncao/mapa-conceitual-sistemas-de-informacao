const fs = require('fs');
const data = JSON.parse(fs.readFileSync('disciplines.json', 'utf8'));
const names = data.map(d => `${d.id}: ${d.name}`);
console.log(names.join('\n'));
