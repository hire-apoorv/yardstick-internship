"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TransactionForm from "@/components/TransactionForm"
import TransactionList from "@/components/TransactionList"
import ExpensesChart from "@/components/ExpensesChart"
import type { Transaction } from "@/types/transaction"

export default function TransactionTracker() {
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

    return (
        <div className="container mx-auto py-6 px-4 max-w-5xl">
            <h1 className="text-3xl font-bold mb-6">Transaction Tracker</h1>

            <Tabs defaultValue="transactions" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="add">Add Transaction</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction List</CardTitle>
                            <CardDescription>View, edit, and delete your transactions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TransactionList />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="add">
                    <Card>
                        <CardHeader>
                            <CardTitle>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</CardTitle>
                            <CardDescription>
                                {editingTransaction ? "Update your transaction details" : "Enter the details of your transaction"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TransactionForm
                                transaction={editingTransaction}
                                onCancel={() => setEditingTransaction(null)}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Expenses</CardTitle>
                            <CardDescription>View your expenses by month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ExpensesChart />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
