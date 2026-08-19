const fs = require('fs');
let content = fs.readFileSync('src/components/PostItem.tsx', 'utf8');

content = content.replace(
  /onUpdatePost\(\{ \.\.\.post, likes: \(post\?\.likes \|\| 0\) \+ 1, hasLiked: true \}\);/,
  `onUpdatePost({ ...post, likes: Math.max(0, (post?.likes || 0) + (post?.hasLiked ? -1 : 1)), hasLiked: !post?.hasLiked });`
);

fs.writeFileSync('src/components/PostItem.tsx', content);
console.log('Fixed toggle in PostItem');
