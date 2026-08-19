const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('if (userData.theme) setSelectedTheme(userData.theme);')) {
  content = content.replace('coins: 380,', 'coins: userData.coins || 380,\n              theme: userData.theme,\n              unlockedThemes: userData.unlockedThemes || [],');
  content = content.replace('setBlackCoins(380);', 'setBlackCoins(userData.coins || 380);\n            if (userData.theme) setSelectedTheme(userData.theme);');
}

fs.writeFileSync('src/App.tsx', content);
