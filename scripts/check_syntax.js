// Simple parser check: require the files to ensure no syntax errors when Node transpiles them.
// Note: this will only check CommonJS parse; since these are .js with JSX, Node may fail unless transpiled.
// We'll perform a lightweight file read to check for unbalanced braces/parentheses as a heuristic.
import fs from 'fs';
const paths = [
  'src/components/VideoRow.js',
  'src/components/MyList.js',
  'src/components/Banner.js'
];

let ok = true;
for (const p of paths) {
  const full = p;
  const content = fs.readFileSync(full, 'utf8');
  // crude checks
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  if (openBraces !== closeBraces) {
    console.error(`${p}: mismatched braces { } : ${openBraces} vs ${closeBraces}`);
    ok = false;
  }
  if (openParens !== closeParens) {
    console.error(`${p}: mismatched parens ( ) : ${openParens} vs ${closeParens}`);
    ok = false;
  }
}
if (ok) {
  console.log('Basic syntax heuristics passed for files.');
  process.exit(0);
} else {
  process.exit(2);
}
