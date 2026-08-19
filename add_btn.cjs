const fs = require('fs');
let content = fs.readFileSync('src/components/HomeFeedEngine.tsx', 'utf8');

const target = `            </button>
          )}
        </div>`;

const btn = `            </button>
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

content = content.replace(target, btn);
fs.writeFileSync('src/components/HomeFeedEngine.tsx', content);
console.log('Added button back');
