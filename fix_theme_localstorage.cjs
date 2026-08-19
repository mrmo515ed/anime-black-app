const fs = require('fs');
let content = fs.readFileSync('src/components/ThemeEngine.tsx', 'utf8');

const regex1 = /const saved = localStorage\.getItem\("animeblack_starred_themes"\);/g;
const replacement1 = `let saved = null; try { saved = localStorage.getItem("animeblack_starred_themes"); } catch(e) {}`;

const regex2 = /localStorage\.setItem\("animeblack_starred_themes", JSON\.stringify\(starredThemes\)\);/g;
const replacement2 = `try { localStorage.setItem("animeblack_starred_themes", JSON.stringify(starredThemes)); } catch(e) {}`;

content = content.replace(regex1, replacement1);
content = content.replace(regex2, replacement2);
fs.writeFileSync('src/components/ThemeEngine.tsx', content);
console.log('Fixed localStorage in ThemeEngine.tsx');
