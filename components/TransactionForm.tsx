"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { Transaction } from "@/types/transaction"
import { toast } from "sonner";

import { getSessionId } from "@/lib/getSessionId";
import { addTransaction } from "@/lib/firebase-functions";

const formSchema = z.object({
    amount: z.coerce.number().positive({ message: "Amount must be positive" }),
    date: z.date({
        required_error: "A date is required",
    }),
    description: z.string().min(2, { message: "Description must be at least 2 characters" }),
    type: z.enum(["income", "expense"], {
        required_error: "Please select a transaction type",
    }),
})

interface TransactionFormProps {
    transaction?: Transaction | null
    onCancel?: () => void
}

export default function TransactionForm({ transaction = null, onCancel }: TransactionFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
            date: new Date(),
            description: "",
            type: "expense",
        },
    })

    useEffect(() => {
        if (transaction) {
            form.reset({
                amount: transaction.amount,
                date: transaction.date,
                description: transaction.description,
                type: transaction.type,
            })
        }
    }, [transaction, form])

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const sessionId = getSessionId();

        if (!sessionId) {
            console.error("Session ID not found!");
            return;
        }

        try {
            await addTransaction(sessionId, values);
            toast.success("Transaction added successfully!", {
                description: "Your expense has been saved.",
                duration: 3000,
            });
        } catch (error) {
            toast.error("Failed to add transaction ❌");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input placeholder="0.00" type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select transaction type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="income">Income</SelectItem>
                                        <SelectItem value="expense">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className="w-full pl-3 text-left font-normal">
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Enter transaction description" className="resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit">{transaction ? "Update" : "Add"} Transaction</Button>
                </div>
            </form>
        </Form>
    )
}
