// lib/firebase-functions.ts

import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import app from "@/lib/firebase"; // your firebase.ts
import type { Transaction } from "@/types/transaction";

const db = getFirestore(app);

// Custom FirestoreTransaction without "id" and with Timestamp
type FirestoreTransaction = Omit<Transaction, "id"> & {
    date: any; // or you can make a Firestore-specific type properly
};

// Utility function to check and update counters
function canPerformAction(counterKey: string, limit: number) {
    const today = new Date().toDateString();
    const count = Number(localStorage.getItem(counterKey)) || 0;
    const date = localStorage.getItem(counterKey + "_date");
  
    if (date !== today) {
      // New day ➔ reset
      localStorage.setItem(counterKey, "1");
      localStorage.setItem(counterKey + "_date", today);
      return true;
    }
  
    if (count < limit) {
      // Still under limit
      localStorage.setItem(counterKey, (count + 1).toString());
      return true;
    }
  
    // Over limit
    return false;
}

// Add a transaction
export async function addTransaction(sessionId: string, transaction: FirestoreTransaction) {
    if (!canPerformAction(`addTransactionCount_${sessionId}`, 100)) {
        throw new Error("Daily add transaction limit (100) reached.");
    }

    const docRef =await addDoc(collection(db, `users/${sessionId}/transactions`), transaction);
    return docRef.id;
}

// Get all transactions
export async function getTransactions(sessionId: string) {
    if (!canPerformAction(`getTransactionCount_${sessionId}`, 1000)) {
        throw new Error("Daily get transaction limit (1000) reached.");
    }

    const querySnapshot = await getDocs(collection(db, `users/${sessionId}/transactions`));
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate?.() ?? new Date(),
      };
    }) as any[];
  }

// // Update a transaction
// export async function updateTransaction(sessionId: string, transaction: Transaction) {
//   const docRef = doc(db, `users/${sessionId}/transactions/${transaction.id}`);
//   await updateDoc(docRef, transaction);
// }

// // Delete a transaction
// export async function deleteTransaction(sessionId: string, id: string) {
//   const docRef = doc(db, `users/${sessionId}/transactions/${id}`);
//   await deleteDoc(docRef);
// }