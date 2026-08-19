const fs = require('fs');
let content = fs.readFileSync('src/components/PrivateMessagingSystem.tsx', 'utf8');

content = content.replace('import { Palette,\n  collection', 'import {\n  collection');
content = content.replace('import { Palette, db', 'import { db');
// Ensure it's imported correctly
if (!content.includes('import { Palette, X')) {
  content = content.replace('import { X, Search', 'import { X, Search, Palette');
}

fs.writeFileSync('src/components/PrivateMessagingSystem.tsx', content);
