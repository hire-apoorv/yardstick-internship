"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, MoreHorizontal, Search, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import type { Transaction } from "@/types/transaction"

import { getTransactions } from "@/lib/firebase-functions";
import { getSessionId } from "@/lib/getSessionId";

export default function TransactionList() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Transaction | null
        direction: "ascending" | "descending"
    }>({
        key: "date",
        direction: "descending",
    })

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


    const handleSort = (key: keyof Transaction) => {
        let direction: "ascending" | "descending" = "ascending"

        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending"
        }

        setSortConfig({ key, direction })
    }

    const filteredTransactions = transactions.filter((transaction) =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        if (!sortConfig.key) return 0

        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead onClick={() => handleSort("date")} className="cursor-pointer">
                                Date
                                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                            </TableHead>
                            <TableHead onClick={() => handleSort("description")} className="cursor-pointer">
                                Description
                                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                            </TableHead>
                            <TableHead onClick={() => handleSort("amount")} className="cursor-pointer text-right">
                                Amount
                                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                            </TableHead>
                            <TableHead onClick={() => handleSort("type")} className="cursor-pointer">
                                Type
                                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                            </TableHead>
                            <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedTransactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>
                                        {transaction.date && format(
                                            transaction.date instanceof Date
                                                ? transaction.date
                                                : (transaction.date as any).toDate(), // 👈 cast as any
                                            "MMM dd, yyyy"
                                        )}
                                    </TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell className="text-right font-medium">₹{new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2 }).format(transaction.amount)}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {/* <DropdownMenuItem onClick={() => onEdit(transaction)}> */}
                                                <DropdownMenuItem onClick={() => { }}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                {/* <DropdownMenuItem onClick={() => onDelete(transaction.id)} className="text-red-600"> */}
                                                <DropdownMenuItem onClick={() => { }} className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
