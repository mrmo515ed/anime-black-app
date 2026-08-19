const fs = require('fs');
let content = fs.readFileSync('src/components/HomeFeedEngine.tsx', 'utf8');

const regex = /\{searchKeyword && \([\s\S]*?\)\}/g;
const replacement = `{searchKeyword && (
            <button onClick={() => setSearchKeyword("")} className="absolute right-3 top-2.5 text-zinc-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        
        {/* Theme Engine Shortcut */}
        <button 
          onClick={() => onOpenThemeEngine && onOpenThemeEngine()}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl hover:bg-[var(--theme-accent)] hover:border-[var(--theme-accent)] text-[var(--theme-text)] hover:text-white transition-all shadow-sm"
          title={isArabic ? "المظهر والتخصيص" : "Themes"}
        >
          <Palette className="w-4 h-4" />
        </button>`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/HomeFeedEngine.tsx', content);
  console.log('Replaced in HomeFeedEngine');
} else {
  console.log('Not found in HomeFeedEngine');
}
