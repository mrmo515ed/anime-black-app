cat << 'INNER_EOF' > /tmp/user_sync.ts
  // Auto-sync currentUser changes to Firestore
  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;
    const syncTimeout = setTimeout(async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const currentData = docSnap.data();
          // Avoid infinite loops by checking if anything actually changed before saving
          // A simple shallow compare of essential keys
          let needsUpdate = false;
          for (const key of Object.keys(currentUser)) {
            if (currentUser[key] !== currentData[key]) {
              needsUpdate = true;
              break;
            }
          }
          if (needsUpdate) {
             await updateDoc(userRef, {
               ...currentUser,
               updatedAt: new Date().toISOString()
             });
             console.log("Auto-synced user data to Firestore.");
          }
        }
      } catch (err) {
        console.error("Failed to auto-sync user data:", err);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(syncTimeout);
  }, [currentUser]);
INNER_EOF

# Let's see where to inject it. We can put it after the activeTab state or inside useEffects block.
