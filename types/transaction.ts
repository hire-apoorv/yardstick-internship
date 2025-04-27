export interface Transaction {
    id: string
    amount: number
    date: Date
    description: string
    type: "income" | "expense"
  }
  