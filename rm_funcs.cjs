const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /  const fetchPosts = \(\) => \{[\s\S]*?const fetchAdminStats = async \(\) => \{/m;

if (content.match(regex)) {
  content = content.replace(regex, '  const fetchAdminStats = async () => {');
  fs.writeFileSync('src/App.tsx', content);
  console.log('Removed old fetch functions');
} else {
  console.log('Regex not matched');
}
