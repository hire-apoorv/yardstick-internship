"use client"

import { useEffect, useMemo, useState } from "react"
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns"
import type { Transaction } from "@/types/transaction"
import { Card } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { getSessionId } from "@/lib/getSessionId"
import { getTransactions } from "@/lib/firebase-functions"


export default function ExpensesChart() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const chartData = useMemo(() => {
        // Get the last 6 months
        const today = new Date()
        const sixMonthsAgo = subMonths(today, 5)

        const months = eachMonthOfInterval({
            start: startOfMonth(sixMonthsAgo),
            end: endOfMonth(today),
        })

        return months.map((month) => {
            const monthStart = startOfMonth(month)
            const monthEnd = endOfMonth(month)

            // Filter transactions for this month
            const monthlyExpenses = transactions.filter(
                (transaction) =>
                    transaction.type === "expense" && transaction.date >= monthStart && transaction.date <= monthEnd,
            )

            // Calculate total expenses for the month
            const totalExpenses = monthlyExpenses.reduce((sum, transaction) => sum + transaction.amount, 0)

            return {
                name: format(month, "MMM yyyy"),
                total: totalExpenses,
            }
        })
    }, [transactions])

    useEffect(() => {
        const fetchTransactions = async () => {
            const sessionId = getSessionId();
            if (!sessionId) {
                console.error("Session ID not found");
                return;
            }
            const fetchedTransactions = await getTransactions(sessionId);
            setTransactions(fetchedTransactions);
        };

        fetchTransactions();
    }, []);

    return (
        <Card className="p-4">
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Expenses"]}
                        labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    )
}
