"use client";

import { useEffect } from "react";
import TransactionTracker from "@/components/TransactionTracker";
import { v4 as uuidv4 } from "uuid"; // install uuid package if not installed

export default function Home() {
  useEffect(() => {
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = uuidv4(); // generate a new unique session id
      localStorage.setItem("sessionId", sessionId);
    }
  }, []);

  return (
    <TransactionTracker />
  );
}