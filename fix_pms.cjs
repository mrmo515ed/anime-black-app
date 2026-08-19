const fs = require('fs');
let content = fs.readFileSync('src/components/PrivateMessagingSystem.tsx', 'utf8');

const target = `                <h1 className="font-black text-white text-sm tracking-wide">
                  {isArabic ? "رسائل أنمي بلاك" : "Anime Black DM"}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button`;

const btn = `                <h1 className="font-black text-white text-sm tracking-wide">
                  {isArabic ? "رسائل أنمي بلاك" : "Anime Black DM"}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onOpenThemeEngine && onOpenThemeEngine()}
                  className="p-2 bg-[var(--theme-card)] border border-[var(--theme-border)] hover:bg-[var(--theme-accent)] rounded-full transition-colors text-[var(--theme-text)] hover:text-white"
                >
                  <Palette className="w-4 h-4" />
                </button>
                <button`;

content = content.replace(target, btn);
fs.writeFileSync('src/components/PrivateMessagingSystem.tsx', content);
console.log('Fixed PMS button');
