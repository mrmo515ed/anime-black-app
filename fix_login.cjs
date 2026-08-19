const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf8');

const regex1 = /    \} catch \(err: any\) \{\n\s*console\.error\(err\);\n\s*setError\(err\.message\);\n\s*\} finally \{/m;
const replacement1 = `    } catch (err: any) {
      import('../firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(err, OperationType.CREATE, 'users');
      }).catch(() => {});
      console.error(err);
      setError(err.message);
    } finally {`;

if (content.match(regex1)) {
  content = content.replace(regex1, replacement1);
  fs.writeFileSync('src/components/Login.tsx', content);
  console.log('Fixed Login.tsx');
} else {
  console.log('No match found in Login.tsx');
}
