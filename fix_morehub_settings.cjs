const fs = require('fs');
let content = fs.readFileSync('src/components/MoreHub.tsx', 'utf8');

const regex = /\{([^}]*)\/\* Accessibility Options \*\/\}/g;
const replacement = `{/* Appearance & Themes */}
                  <div className="space-y-3 pt-3 border-t border-zinc-900">
                    <span className="text-xs font-black text-white block">🎨 {isArabic ? "المظهر والتخصيص" : "Appearance & Themes"}</span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center p-2 bg-zinc-900/40 rounded-xl">
                        <div>
                          <span className="font-bold">{isArabic ? "محرك الثيمات (Theme Engine)" : "Theme Engine"}</span>
                          <span className="block text-[8px] text-zinc-500 mt-0.5">{isArabic ? "تغيير الثيم وتخصيص الألوان" : "Change theme & customize colors"}</span>
                        </div>
                        <button 
                          onClick={() => onOpenThemeEngine && onOpenThemeEngine()}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold"
                        >
                          {isArabic ? "فتح المحرك" : "Open Engine"}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Accessibility Options */}`;

content = content.replace('{/* Accessibility Options */}', replacement);

fs.writeFileSync('src/components/MoreHub.tsx', content);
