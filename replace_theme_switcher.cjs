const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\/\* THEME SWITCHER & SYSTEM CUSTOMIZER PANEL[\s\S]*?\{\/\* Font settings \*\/\}/g;
const replacement = `
                  {/* THEME ENGINE SHORTCUT */}
                  <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-4 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center">
                          <Palette className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--theme-text)]">
                            {isArabic ? "المظهر والتخصيص" : "Appearance & Themes"}
                          </h3>
                          <p className="text-[9px] text-zinc-500">
                            {isArabic ? "تحكم كامل بمظهر التطبيق" : "Full control over app appearance"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          triggerHapticFeedback("tap");
                          playSynthSound("tap");
                          setShowThemeEngine(true);
                        }}
                        className="px-4 py-2 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/80 text-white rounded-xl text-[10px] font-bold transition-all shadow-lg"
                      >
                        {isArabic ? "فتح المحرك" : "Open Engine"}
                      </button>
                    </div>
                  </div>

                  {/* Font settings */}`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Replaced Theme Switcher in App.tsx');
} else {
  console.log('Theme Switcher not found in App.tsx');
}
