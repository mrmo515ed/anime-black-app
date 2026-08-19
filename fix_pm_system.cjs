const fs = require('fs');
let content = fs.readFileSync('src/components/PrivateMessagingSystem.tsx', 'utf8');

const regex1 = /setSearchResults\(results\);\n\s*\} catch \(e\) \{\n\s*console\.error\(e\);\n\s*\}/;
const replacement1 = `setSearchResults(results);
      } catch (e) {
        const { handleFirestoreError, OperationType } = await import('../firestoreUtils');
        handleFirestoreError(e, OperationType.LIST, \`users\`);
      }`;

const regex2 = /setActiveView\("chat"\);\n\s*\} catch \(e\) \{\n\s*console\.error\(e\);\n\s*playSynthSound\("error"\);\n\s*\}/;
const replacement2 = `setActiveView("chat");
    } catch (e) {
      playSynthSound("error");
      const { handleFirestoreError, OperationType } = await import('../firestoreUtils');
      handleFirestoreError(e, OperationType.CREATE, \`directChats/\${newChatRef.id}\`);
    }`;

const regex3 = /\}\n\s*\} catch \(e\) \{\n\s*console\.error\(e\);\n\s*playSynthSound\("error"\);\n\s*\}/;
const replacement3 = `}
    } catch (e) {
      playSynthSound("error");
      const { handleFirestoreError, OperationType } = await import('../firestoreUtils');
      handleFirestoreError(e, OperationType.CREATE, \`directChats/\${activeChat.id}/messages\`);
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
  fs.writeFileSync('src/components/PrivateMessagingSystem.tsx', content);
  console.log('Fixed PrivateMessagingSystem.tsx');
} else {
  console.log('No matches found in PrivateMessagingSystem.tsx');
}
