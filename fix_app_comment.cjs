const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /      \}\n\s*\} catch \(e\) \{\n\s*console\.error\(e\);\n\s*\/\/ fallback\n\s*try \{\n\s*const res = await postJson\(\`\/api\/posts\/\$\{postId\}\/comments\`, \{\n\s*authorName: currentUser\?\.name \|\| "Anonymous Otaku",\n\s*text: newCommentText,\n\s*\}\);\n\s*const updatedPost = await res\.json\(\);\n\s*setPosts\(posts\.map\(p => p\.id === postId \? updatedPost : p\)\);\n\s*setNewCommentText\(""\);\n\s*triggerHapticFeedback\("success"\);\n\s*playSynthSound\("tap"\);\n\s*\} catch \(err\) \{\}\n\s*\}/m;

const replacement = `      }
    } catch (e) {
      import('./firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(e, OperationType.UPDATE, \`posts/\${postId}\`);
      });
    }`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Fixed comment error in App.tsx');
} else {
  console.log('Regex not matched for comment');
}
