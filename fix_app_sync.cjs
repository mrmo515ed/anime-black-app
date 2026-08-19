const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /  useEffect\(\(\) => \{\n\s*chatEndRef\.current\?\.scrollIntoView\(\{ behavior: "smooth" \}\);\n\s*\}, \[chats, activeChatId\]\);\n\n\s*const fetchAdminStats/m;

const replacement = `  useEffect(() => {
    let unsubscribePosts = () => {};
    let unsubscribeStories = () => {};
    let unsubscribeReels = () => {};
    let unsubscribeChats = () => {};
    let unsubscribeNotifications = () => {};
    
    import('./firebase').then(({ db }) => {
      import('firebase/firestore').then(({ collection, onSnapshot, query, orderBy }) => {
        import('./firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
            const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
              const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
              setPosts(data);
            }, (error) => {
              handleFirestoreError(error, OperationType.LIST, "posts");
            });
            
            const storiesQuery = query(collection(db, "stories"), orderBy("createdAt", "desc"));
            unsubscribeStories = onSnapshot(storiesQuery, (snapshot) => {
              const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
              setStories(data);
            }, (error) => {
              handleFirestoreError(error, OperationType.LIST, "stories");
            });

            const reelsQuery = query(collection(db, "reels"), orderBy("createdAt", "desc"));
            unsubscribeReels = onSnapshot(reelsQuery, (snapshot) => {
              const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reel));
              setReels(data);
            }, (error) => {
              handleFirestoreError(error, OperationType.LIST, "reels");
            });
            
            const chatsQuery = query(collection(db, "chats"), orderBy("updatedAt", "desc"));
            unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
              const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
              setChats(data);
            }, (error) => {
              handleFirestoreError(error, OperationType.LIST, "chats");
            });
            
            if (currentUser) {
                const notifsQuery = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
                unsubscribeNotifications = onSnapshot(notifsQuery, (snapshot) => {
                  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
                  setNotifications(data);
                }, (error) => {
                  handleFirestoreError(error, OperationType.LIST, "notifications");
                });
            }
        });
      });
    });
    fetchAdminStats();
    
    return () => {
      unsubscribePosts();
      unsubscribeStories();
      unsubscribeReels();
      unsubscribeChats();
      unsubscribeNotifications();
    };
  }, [currentUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChatId]);

  const fetchAdminStats`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Fixed real-time listeners (2)');
} else {
  console.log('Regex not matched');
}
