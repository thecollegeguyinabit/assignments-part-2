import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

export default async (req, res) => {
    try {
        // Fetch user accounts and transactions
        const accounts = await Account.find({
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        })
            .populate("owner", "name email")
            .populate("members", "name email")
            .sort({ createdAt: -1 });
        // Get all transactions for each account
        const accountsWithStats = await Promise.all(
            accounts.map(async (account) => {
                const transactions = await Transaction.find({ account: account._id }).sort({ date: -1 });
                const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
                const expense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
                return {
                    ...account.toObject(),
                    transactionCount: transactions.length,
                    income,
                    expense,
                    balance: income - expense
                };
            })
        );
        // calculate total balance across all accounts
        const totalIncome = accountsWithStats.reduce((sum, acc) => sum + acc.income, 0);
        const totalExpense = accountsWithStats.reduce((sum, acc) => sum + acc.expense, 0);
        const totalBalance = totalIncome - totalExpense;

        //get recent transactions across all accounts
        const accountIds = accountsWithStats.map(acc => acc._id);
        const recentTransactions = await Transaction.find({ account: { $in: accountIds } })
            .populate("account", "accountName")  // if got error here, change to "account", "accountName"
            .populate("createdBy", "name")
            .sort({ date: -1 })
            .limit(10);
            
        res.render("index", {
            accounts: accountsWithStats,
            totalBalance,
            totalIncome,
            totalExpense,
            recentTransactions
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.render("index", {
            accounts: [],
            totalBalance: 0,
            totalIncome: 0,
            totalExpense: 0,
            recentTransactions: [],
        });
    }
}