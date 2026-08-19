const fs = require('fs');
let content = fs.readFileSync('src/components/PrivateMessagingSystem.tsx', 'utf8');

const regex = /<button\s+onClick=\{\(\) => \{ playSynthSound\("tap"\); onClose\(\); \}\}/;
const replacement = `<button 
                  onClick={() => onOpenThemeEngine && onOpenThemeEngine()}
                  className="p-2 bg-[var(--theme-card)] border border-[var(--theme-border)] hover:bg-[var(--theme-accent)] rounded-full transition-colors text-[var(--theme-text)] hover:text-white"
                >
                  <Palette className="w-4 h-4" />
                </button>
                <button
                onClick={() => { playSynthSound("tap"); onClose(); }}`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/PrivateMessagingSystem.tsx', content);
  console.log('Fixed PMS button again');
} else {
  console.log('Regex not matched');
}
