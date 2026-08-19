const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                  onPostCreated={async (newPostObj) => {
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

const replacement = `                  onPostCreated={async (newPostObj) => {
                    setActiveTab("home");
                    try {
                      const { db } = await import('./firebase');
                      const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
                      const dbObj = { ...newPostObj, createdAt: serverTimestamp(), authorId: currentUser?.uid };
                      
                      if (newPostObj.category === "story") {
                         setStories([newPostObj, ...stories]);
                         await setDoc(doc(db, "stories", newPostObj.id), dbObj);
                      } else if (newPostObj.category === "reel") {
                         setReels([newPostObj, ...reels]);
                         await setDoc(doc(db, "reels", newPostObj.id), dbObj);
                      } else {
                         setPosts([newPostObj, ...posts]);
                         await setDoc(doc(db, "posts", newPostObj.id), dbObj);
                      }
                    } catch (e) {
                      console.error("Error saving content to DB", e);
                    }
                  }}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
