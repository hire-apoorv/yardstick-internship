// lib/firebase-functions.ts

import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import app from "@/lib/firebase"; // your firebase.ts
import type { Transaction } from "@/types/transaction";

const db = getFirestore(app);

// Custom FirestoreTransaction without "id" and with Timestamp
type FirestoreTransaction = Omit<Transaction, "id"> & {
    date: any; // or you can make a Firestore-specific type properly
  };

// Add a transaction
export async function addTransaction(sessionId: string, transaction: FirestoreTransaction) {
  const docRef = await addDoc(collection(db, `users/${sessionId}/transactions`), transaction);
  return docRef.id;
}

// Get all transactions
export async function getTransactions(sessionId: string) {
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