const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex1 = /\} catch\(e\) \{ console\.error\("Error saving theme", e\); \}/;
const replacement1 = `} catch(e) {
                  const { handleFirestoreError, OperationType } = await import('./firestoreUtils');
                  handleFirestoreError(e, OperationType.UPDATE, \`users/\${currentUser.uid || currentUser.id}\`);
                }`;

const regex2 = /\} catch\(e\) \{ console\.error\("Error purchasing theme", e\); \}/;
const replacement2 = `} catch(e) {
                  const { handleFirestoreError, OperationType } = await import('./firestoreUtils');
                  handleFirestoreError(e, OperationType.UPDATE, \`users/\${currentUser.uid || currentUser.id}\`);
                }`;

const regex3 = /\} catch \(e\) \{\n\s*console\.error\("Error saving content to DB", e\);\n\s*\}/;
const replacement3 = `} catch (e) {
                      const { handleFirestoreError, OperationType } = await import('./firestoreUtils');
                      handleFirestoreError(e, OperationType.CREATE, \`\${newPostObj.category === "story" ? "stories" : newPostObj.category === "reel" ? "reels" : "posts"}/\${newPostObj.id}\`);
                    }`;

let changed = false;
if (content.match(regex1)) {
  content = content.replace(regex1, replacement1);
  changed = true;
}
if (content.match(regex2)) {
  content = content.replace(regex2, replacement2);
  changed = true;
}
if (content.match(regex3)) {
  content = content.replace(regex3, replacement3);
  changed = true;
}

if (changed) {
  fs.writeFileSync('src/App.tsx', content);
  console.log('Fixed try-catch Firebase logs in App.tsx');
} else {
  console.log('No matches found for try-catch logs');
}
