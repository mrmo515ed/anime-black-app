const fs = require('fs');
let content = fs.readFileSync('src/components/HomeFeedEngine.tsx', 'utf8');

const regex = /catch \(e\) \{\n\s*console\.error\("Failed to sync post interaction:", e\);\n\s*\}/;

const replacement = `catch (e) {
                              const { handleFirestoreError, OperationType } = await import('../firestoreUtils');
                              handleFirestoreError(e, OperationType.UPDATE, \`posts/\${updatedPost.id}\`);
                            }`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/HomeFeedEngine.tsx', content);
  console.log('Fixed error handling in HomeFeedEngine');
} else {
  console.log('Regex not matched');
}
