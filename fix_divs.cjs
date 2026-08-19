const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\/\* Font settings \*\/\}/;
content = content.replace(regex, `
                  <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-4 space-y-4 shadow-xl">
                    {/* Font settings */}`);

fs.writeFileSync('src/App.tsx', content);
