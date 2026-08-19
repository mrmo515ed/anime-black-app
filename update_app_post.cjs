const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                  onPostCreated={(newPostObj) => {
                    setPosts([newPostObj, ...posts]);
                    setActiveTab("home");
                  }}`;

const replacement = `                  onPostCreated={async (newPostObj) => {
                    setPosts([newPostObj, ...posts]);
                    setActiveTab("home");
                    try {
                      const { db } = await import('./firebase');
                      const { collection, setDoc, doc, serverTimestamp } = await import('firebase/firestore');
                      // Save to firestore
                      const dbPost = { ...newPostObj, createdAt: serverTimestamp(), authorId: currentUser?.uid };
                      await setDoc(doc(db, "posts", newPostObj.id), dbPost);
                    } catch (e) {
                      console.error("Error saving post to DB", e);
                    }
                  }}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
