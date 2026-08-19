const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

appContent = appContent.replace(/fetchPosts\(\);\n/g, '');
appContent = appContent.replace(/fetchStories\(\);\n/g, '');
appContent = appContent.replace(/fetchReels\(\);\n/g, '');

fs.writeFileSync('src/App.tsx', appContent);
console.log('Fixed App.tsx fetch functions');
