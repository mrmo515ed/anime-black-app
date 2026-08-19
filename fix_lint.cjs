const fs = require('fs');

// App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(/fetchNotifications\(\);\n/g, '');
fs.writeFileSync('src/App.tsx', appContent);
console.log('Fixed App.tsx fetchNotifications()');

// PrivateMessagingSystem.tsx
let pmsContent = fs.readFileSync('src/components/PrivateMessagingSystem.tsx', 'utf8');
pmsContent = pmsContent.replace(/handleFirestoreError\(e, OperationType\.CREATE, \`directChats\/\$\{newChatRef\.id\}\`\);/, 'handleFirestoreError(e, OperationType.CREATE, `directChats`);');
fs.writeFileSync('src/components/PrivateMessagingSystem.tsx', pmsContent);
console.log('Fixed PMS newChatRef.id');
