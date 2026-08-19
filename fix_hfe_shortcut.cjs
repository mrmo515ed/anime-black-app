const fs = require('fs');
let content = fs.readFileSync('src/components/HomeFeedEngine.tsx', 'utf8');

const regex = /\{\/\* Theme Engine Shortcut \*\/\}\s*<button\s*onClick=\{\(\) => onOpenThemeEngine && onOpenThemeEngine\(\)\}[\s\S]*?<\/button>/;

if (content.match(regex)) {
  content = content.replace(regex, '');
  fs.writeFileSync('src/components/HomeFeedEngine.tsx', content);
  console.log('Fixed HomeFeedEngine shortcut');
} else {
  console.log('Not found in HomeFeedEngine');
}
