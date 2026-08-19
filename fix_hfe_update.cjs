const fs = require('fs');
let content = fs.readFileSync('src/components/HomeFeedEngine.tsx', 'utf8');

const regex = /onUpdatePost=\{\(updatedPost\) => \{\n\s*setPosts\(posts\.map\(p => p\.id === updatedPost\.id \? updatedPost : p\)\);\n\s*\}\}/g;

const replacement = `onUpdatePost={async (updatedPost) => {
                            // Optimistic UI update
                            setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
                            
                            // Real-time Firebase sync
                            try {
                              const { db } = await import('../firebase');
                              const { doc, updateDoc } = await import('firebase/firestore');
                              const postRef = doc(db, 'posts', updatedPost.id);
                              
                              // We only want to update interaction stats to avoid overwriting other fields accidentally
                              await updateDoc(postRef, {
                                likes: updatedPost.likes,
                                saves: updatedPost.saves,
                                reposts: updatedPost.reposts,
                                stars: updatedPost.stars,
                                coins: updatedPost.coins,
                                views: updatedPost.views
                              });
                            } catch (e) {
                              console.error("Failed to sync post interaction:", e);
                            }
                          }}`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/HomeFeedEngine.tsx', content);
  console.log('Fixed onUpdatePost in HomeFeedEngine');
} else {
  console.log('Regex not matched');
}
