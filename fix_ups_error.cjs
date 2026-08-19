const fs = require('fs');
let content = fs.readFileSync('src/components/UserProfileSystem.tsx', 'utf8');

const regex = /catch\(err\) \{\n\s*console\.error\("Failed to save profile to Firestore", err\);\n\s*\}/;

const replacement = `catch(err) {
      import('../firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(err, OperationType.UPDATE, \`users/\${currentUser.uid}\`);
      });
    }`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/UserProfileSystem.tsx', content);
  console.log('Fixed UPS error logging');
} else {
  console.log('Regex not matched');
}
