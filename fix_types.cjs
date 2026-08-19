const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const regex = /export interface Post \{[\s\S]*?\n\}/;
const replacement = `export interface Post {
  id: string;
  authorId?: string;
  author: User;
  content: string;
  image: string | null;
  video: string | null;
  likes: number;
  hasLiked: boolean;
  comments: Comment[];
  poll: Poll | null;
  createdAt: string;
  views?: number;
  reposts?: number;
  shares?: number;
  saves?: number;
  stars?: number;
  coins?: number;
  audience?: "public" | "friends" | "followers" | "private";
  tags?: string[];
  isEdited?: boolean;
}`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/types.ts', content);
  console.log('Fixed types.ts');
} else {
  console.log('Not found in types.ts');
}
