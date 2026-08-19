const fs = require('fs');
let content = fs.readFileSync('src/components/PostItem.tsx', 'utf8');

content = content.replace(/post\.id/g, 'post?.id');
content = content.replace(/post\.content/g, 'post?.content');
content = content.replace(/post\.tags/g, 'post?.tags');
content = content.replace(/post\.image/g, 'post?.image');
content = content.replace(/post\.likes/g, 'post?.likes');
content = content.replace(/post\.hasLiked/g, 'post?.hasLiked');
content = content.replace(/post\.comments/g, 'post?.comments');
content = content.replace(/post\.reposts/g, 'post?.reposts');
content = content.replace(/post\.stars/g, 'post?.stars');
content = content.replace(/post\.coins/g, 'post?.coins');
content = content.replace(/post\.saves/g, 'post?.saves');
content = content.replace(/post\.views/g, 'post?.views');
content = content.replace(/post\.createdAt/g, 'post?.createdAt');
content = content.replace(/post\.audience/g, 'post?.audience');
content = content.replace(/post\.isEdited/g, 'post?.isEdited');

fs.writeFileSync('src/components/PostItem.tsx', content);
console.log('Fixed more post properties');
