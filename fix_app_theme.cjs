const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!content.includes('import ThemeEngine')) {
  content = content.replace('import { THEME_PRESETS } from "./themePresets";', 
    'import { THEME_PRESETS } from "./themePresets";\nimport ThemeEngine from "./components/ThemeEngine";');
}

// Add state
if (!content.includes('const [showThemeEngine')) {
  content = content.replace('const [selectedTheme, setSelectedTheme] = useState<string>("dark");',
    'const [selectedTheme, setSelectedTheme] = useState<string>("anime-black");\n  const [showThemeEngine, setShowThemeEngine] = useState(false);');
}

// Render ThemeEngine
if (!content.includes('<ThemeEngine')) {
  const engineRender = `
      <AnimatePresence>
        {showThemeEngine && (
          <ThemeEngine
            isArabic={isArabic}
            currentUser={currentUser}
            onClose={() => setShowThemeEngine(false)}
            currentThemeId={selectedTheme}
            onSelectTheme={async (themeId) => {
              setSelectedTheme(themeId);
              if (currentUser) {
                try {
                  const { doc, updateDoc } = await import('firebase/firestore');
                  const { db } = await import('./firebase');
                  await updateDoc(doc(db, "users", currentUser.uid || currentUser.id), { theme: themeId });
                  setCurrentUser({ ...currentUser, theme: themeId });
                } catch(e) { console.error("Error saving theme", e); }
              }
            }}
            onPurchaseTheme={async (themeId, price) => {
              if (currentUser && currentUser.coins >= price) {
                const newCoins = currentUser.coins - price;
                const newThemes = [...(currentUser.unlockedThemes || []), themeId];
                try {
                  const { doc, updateDoc } = await import('firebase/firestore');
                  const { db } = await import('./firebase');
                  await updateDoc(doc(db, "users", currentUser.uid || currentUser.id), { 
                    coins: newCoins,
                    unlockedThemes: newThemes
                  });
                  setCurrentUser({ ...currentUser, coins: newCoins, unlockedThemes: newThemes });
                  setBlackCoins(newCoins);
                } catch(e) { console.error("Error purchasing theme", e); }
              }
            }}
            playSynthSound={playSynthSound}
            triggerHapticFeedback={triggerHapticFeedback}
          />
        )}
      </AnimatePresence>
`;
  content = content.replace('{/* 2. AUTHENTICATION SCREENS FLOW */}', engineRender + '\n      {/* 2. AUTHENTICATION SCREENS FLOW */}');
}

fs.writeFileSync('src/App.tsx', content);
