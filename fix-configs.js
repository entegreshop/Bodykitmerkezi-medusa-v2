const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}
const files = walk('C:/Users/Asus/Downloads/Bodykitmerkezi-medusa-v2/apps/backend/src/api');
let count = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('os.homedir()')) {
    content = content.replace(/os\.homedir\(\),\s*"\.xoox-([^"]+)\.json"/g, 'process.cwd(), "uploads", "$1.json"');
    content = content.replace(/os\.homedir\(\),\s*'\.xoox-([^']+)\.json'/g, 'process.cwd(), "uploads", "$1.json"');
    content = content.replace(/os\.homedir\(\),\s*`\.xoox-([^`]+)\.json`/g, 'process.cwd(), "uploads", "$1.json"');
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed:', f);
    count++;
  }
});
console.log('Total fixed:', count);
