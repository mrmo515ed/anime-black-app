const fs = require('fs');
let content = fs.readFileSync('src/components/PrivateMessagingSystem.tsx', 'utf8');

const regex = /<button \s*onClick=\{\(\) => onOpenThemeEngine && onOpenThemeEngine\(\)\}[\s\S]*?<\/button>/;

if (content.match(regex)) {
  content = content.replace(regex, '');
  fs.writeFileSync('src/components/PrivateMessagingSystem.tsx', content);
  console.log('Fixed PrivateMessagingSystem shortcut');
} else {
  console.log('Not found in PrivateMessagingSystem');
}
