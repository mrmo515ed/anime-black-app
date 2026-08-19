const fs = require('fs');
let content = fs.readFileSync('src/components/PostItem.tsx', 'utf8');

content = content.replace(/post\.author\./g, 'post?.author?.');
content = content.replace(/post\.author /g, 'post?.author ');

fs.writeFileSync('src/components/PostItem.tsx', content);
console.log('Fixed post.author to post?.author?');
