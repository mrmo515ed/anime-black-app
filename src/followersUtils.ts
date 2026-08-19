import { db } from "./firebase";
import { 
  collection, doc, getDoc, getDocs, updateDoc, setDoc, deleteDoc, 
  addDoc, query, where, arrayUnion, arrayRemove, writeBatch 
} from "firebase/firestore";

// Helper to create notifications in Firestore
export async function createNotification(userId: string, type: "like" | "comment" | "follow" | "mention", text: string) {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      type,
      text,
      read: false,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error creating notification:", err);
  }
}

// 1. Follow User (Handles Public directly, Private via Request)
export async function followUser(currentUserId: string, targetUserId: string, targetIsPrivate: boolean) {
  if (currentUserId === targetUserId) return { success: false, message: "You cannot follow yourself" };

  try {
    // Check if either user is blocked
    const blockCheck1 = await getDoc(doc(db, "blockedUsers", `${currentUserId}_${targetUserId}`));
    const blockCheck2 = await getDoc(doc(db, "blockedUsers", `${targetUserId}_${currentUserId}`));
    if (blockCheck1.exists() || blockCheck2.exists()) {
      return { success: false, message: "Action blocked by security rules" };
    }

    if (targetIsPrivate) {
      // Create Follow Request
      const requestId = `${currentUserId}_to_${targetUserId}`;
      const requestRef = doc(db, "followRequests", requestId);
      
      const requestSnap = await getDoc(requestRef);
      if (requestSnap.exists() && requestSnap.data()?.status === "pending") {
        return { success: false, message: "Request already pending" };
      }

      await setDoc(requestRef, {
        id: requestId,
        senderId: currentUserId,
        receiverId: targetUserId,
        status: "pending",
        createdAt: new Date().toISOString()
      });

      // Send follow request notification
      await createNotification(
        targetUserId, 
        "follow", 
        "أرسل لك طلب متابعة جديد"
      );

      return { success: true, requested: true, message: "Follow request sent" };
    } else {
      // Direct Follow
      const batch = writeBatch(db);

      // Add to users documents
      const targetUserRef = doc(db, "users", targetUserId);
      const currentUserRef = doc(db, "users", currentUserId);

      batch.update(targetUserRef, {
        followers: arrayUnion(currentUserId),
        followersCount: arrayUnion(currentUserId) // will be synced or we can increment
      });

      batch.update(currentUserRef, {
        following: arrayUnion(targetUserId)
      });

      // Add to Followers collection
      const followerRef = doc(db, "followers", `${targetUserId}_${currentUserId}`);
      batch.set(followerRef, {
        userId: targetUserId,
        followerId: currentUserId,
        createdAt: new Date().toISOString()
      });

      // Add to Following collection
      const followingRef = doc(db, "following", `${currentUserId}_${targetUserId}`);
      batch.set(followingRef, {
        userId: currentUserId,
        followingId: targetUserId,
        createdAt: new Date().toISOString()
      });

      await batch.commit();

      // Send follow notification
      await createNotification(
        targetUserId, 
        "follow", 
        "قام بمتابعتك الآن"
      );

      return { success: true, requested: false, message: "Following user directly" };
    }
  } catch (err) {
    console.error("Error in followUser:", err);
    throw err;
  }
}

// 2. Unfollow User
export async function unfollowUser(currentUserId: string, targetUserId: string) {
  try {
    const batch = writeBatch(db);

    const targetUserRef = doc(db, "users", targetUserId);
    const currentUserRef = doc(db, "users", currentUserId);

    batch.update(targetUserRef, {
      followers: arrayRemove(currentUserId)
    });

    batch.update(currentUserRef, {
      following: arrayRemove(targetUserId)
    });

    // Delete from Followers collection
    const followerRef = doc(db, "followers", `${targetUserId}_${currentUserId}`);
    batch.delete(followerRef);

    // Delete from Following collection
    const followingRef = doc(db, "following", `${currentUserId}_${targetUserId}`);
    batch.delete(followingRef);

    await batch.commit();
    return { success: true };
  } catch (err) {
    console.error("Error in unfollowUser:", err);
    throw err;
  }
}

// 3. Cancel Sent Follow Request
export async function cancelFollowRequest(currentUserId: string, targetUserId: string) {
  try {
    const requestId = `${currentUserId}_to_${targetUserId}`;
    await deleteDoc(doc(db, "followRequests", requestId));
    return { success: true };
  } catch (err) {
    console.error("Error in cancelFollowRequest:", err);
    throw err;
  }
}

// 4. Accept Follow Request
export async function acceptFollowRequest(requestId: string, receiverId: string, senderId: string) {
  try {
    const batch = writeBatch(db);

    // Update Request status
    const requestRef = doc(db, "followRequests", requestId);
    batch.delete(requestRef);

    // Add to users documents
    const receiverRef = doc(db, "users", receiverId);
    const senderRef = doc(db, "users", senderId);

    batch.update(receiverRef, {
      followers: arrayUnion(senderId)
    });

    batch.update(senderRef, {
      following: arrayUnion(receiverId)
    });

    // Add to Followers collection
    const followerRef = doc(db, "followers", `${receiverId}_${senderId}`);
    batch.set(followerRef, {
      userId: receiverId,
      followerId: senderId,
      createdAt: new Date().toISOString()
    });

    // Add to Following collection
    const followingRef = doc(db, "following", `${senderId}_${receiverId}`);
    batch.set(followingRef, {
      userId: senderId,
      followingId: receiverId,
      createdAt: new Date().toISOString()
    });

    await batch.commit();

    // Send notifications
    await createNotification(
      senderId, 
      "follow", 
      "وافق على طلب المتابعة الخاص بك"
    );

    return { success: true };
  } catch (err) {
    console.error("Error in acceptFollowRequest:", err);
    throw err;
  }
}

// 5. Reject Follow Request
export async function rejectFollowRequest(requestId: string) {
  try {
    await deleteDoc(doc(db, "followRequests", requestId));
    return { success: true };
  } catch (err) {
    console.error("Error in rejectFollowRequest:", err);
    throw err;
  }
}

// 6. Block User
export async function blockUser(currentUserId: string, targetUserId: string) {
  try {
    // Unfollow each other first
    await unfollowUser(currentUserId, targetUserId);
    await unfollowUser(targetUserId, currentUserId);

    // Delete any pending requests
    await deleteDoc(doc(db, "followRequests", `${currentUserId}_to_${targetUserId}`));
    await deleteDoc(doc(db, "followRequests", `${targetUserId}_to_${currentUserId}`));

    const batch = writeBatch(db);

    // Add to user document blocked list
    const currentUserRef = doc(db, "users", currentUserId);
    batch.update(currentUserRef, {
      blockedUsers: arrayUnion(targetUserId)
    });

    // Add to blockedUsers collection
    const blockRef = doc(db, "blockedUsers", `${currentUserId}_${targetUserId}`);
    batch.set(blockRef, {
      blockerId: currentUserId,
      blockedId: targetUserId,
      createdAt: new Date().toISOString()
    });

    await batch.commit();
    return { success: true };
  } catch (err) {
    console.error("Error in blockUser:", err);
    throw err;
  }
}

// 7. Unblock User
export async function unblockUser(currentUserId: string, targetUserId: string) {
  try {
    const batch = writeBatch(db);

    const currentUserRef = doc(db, "users", currentUserId);
    batch.update(currentUserRef, {
      blockedUsers: arrayRemove(targetUserId)
    });

    const blockRef = doc(db, "blockedUsers", `${currentUserId}_${targetUserId}`);
    batch.delete(blockRef);

    await batch.commit();
    return { success: true };
  } catch (err) {
    console.error("Error in unblockUser:", err);
    throw err;
  }
}

// 8. Remove Follower (without blocking)
export async function removeFollower(currentUserId: string, followerId: string) {
  try {
    const batch = writeBatch(db);

    const currentUserRef = doc(db, "users", currentUserId);
    const followerRefDoc = doc(db, "users", followerId);

    batch.update(currentUserRef, {
      followers: arrayRemove(followerId)
    });

    batch.update(followerRefDoc, {
      following: arrayRemove(currentUserId)
    });

    // Delete from Followers collection
    batch.delete(doc(db, "followers", `${currentUserId}_${followerId}`));

    // Delete from Following collection
    batch.delete(doc(db, "following", `${followerId}_${currentUserId}`));

    await batch.commit();
    return { success: true };
  } catch (err) {
    console.error("Error in removeFollower:", err);
    throw err;
  }
}

// 9. Update privacy settings
export async function updatePrivacySettings(
  userId: string, 
  settings: { 
    isPrivate?: boolean; 
    showFollowersList?: boolean; 
    showFollowingList?: boolean; 
    allowSuggestions?: boolean; 
  }
) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, settings);
    return { success: true };
  } catch (err) {
    console.error("Error in updatePrivacySettings:", err);
    throw err;
  }
}
