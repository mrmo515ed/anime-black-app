const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const fetchPosts = async \(\) => \{[\s\S]*?catch \(e\) \{\n\s*console\.error\(e\);\n\s*setPosts\(\[\]\);\n\s*\}\n\s*\};/;

const replacement = `const fetchPosts = () => {
    import('./firebase').then(({ db }) => {
      import('firebase/firestore').then(({ collection, onSnapshot, query, orderBy }) => {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
          setPosts(data);
        }, (error) => {
          console.error("Error syncing posts:", error);
        });
        return unsubscribe;
      });
    });
  };`;

if (appContent.match(regex)) {
  appContent = appContent.replace(regex, replacement);
  fs.writeFileSync('src/App.tsx', appContent);
  console.log('Replaced fetchPosts with onSnapshot');
} else {
  console.log('regex not matched');
}
