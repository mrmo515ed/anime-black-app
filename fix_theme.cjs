const fs = require('fs');
let content = fs.readFileSync('src/components/ThemeEngine.tsx', 'utf8');

const regex = /const saved = localStorage\.getItem\("animeblack_starred_themes"\);\n\s*return saved \? JSON\.parse\(saved\) : \[\];/;
const replacement = `const saved = localStorage.getItem("animeblack_starred_themes");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch(e) {
      return [];
    }`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/ThemeEngine.tsx', content);
console.log('Fixed ThemeEngine.tsx JSON.parse');
