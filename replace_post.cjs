const fs = require('fs');
let content = fs.readFileSync('src/components/HomeFeedEngine.tsx', 'utf8');

const regex = /processedPosts\.map\(\(post\) => \(\s*<div key=\{post\.id\} className="bg-\[#121212\] rounded-2xl p-4 border border-\[#2A2A2A\] shadow-md space-y-3\.5 relative">[\s\S]*?<\/div>\s*\)\)\s*\)}/;

const replacement = `processedPosts.map((post) => (
                        <PostItem 
                          key={post.id}
                          post={post as any}
                          currentUser={userData}
                          isArabic={isArabic}
                          playSynthSound={playSynthSound}
                          triggerHapticFeedback={triggerHapticFeedback}
                          triggerInAppNotification={triggerInAppNotification}
                          onUpdatePost={(updatedPost) => {
                            setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
                          }}
                        />
                      ))
                    )}`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/HomeFeedEngine.tsx', content);
  console.log('Replaced post rendering successfully.');
} else {
  console.log('Regex did not match!');
}
