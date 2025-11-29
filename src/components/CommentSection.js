import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { auth, firestore } from "../firebaseConfig"; // use your exports

export default function CommentSection({ formId }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  // Load comments in real time
  useEffect(() => {
    const q = query(
      collection(firestore, "forms", formId, "comments"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(list);
    });
    return () => unsubscribe();
  }, [formId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const user = auth.currentUser;

    await addDoc(collection(firestore, "forms", formId, "comments"), {
      text: comment.trim(),
      userName: user?.displayName || user?.email || "Anonymous",
      createdAt: serverTimestamp(),
    });

    setComment("");
  };

  return (
    <div style={{ marginTop: "1.5rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
      <h3 style={{ marginBottom: "0.5rem" }}>💬 Comments</h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          style={{ flex: 1, padding: "8px" }}
        />
        <button type="submit" style={{ padding: "8px 12px" }}>Post</button>
      </form>

      {comments.map((c) => (
        <div key={c.id} style={{ marginBottom: "0.75rem", borderBottom: "1px solid #eee", paddingBottom: "6px" }}>
          <strong>{c.userName}</strong>{" "}
          <span style={{ color: "#777", fontSize: "0.85em" }}>
            {c.createdAt?.seconds
              ? new Date(c.createdAt.seconds * 1000).toLocaleString()
              : "Just now"}
          </span>
          <div>{c.text}</div>
        </div>
      ))}
    </div>
  );
}
