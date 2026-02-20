import  Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';


export async function getTransactions (req, res) {
    /**
     * get Transaction details
     * render transactions page with transaction info 
     */
    try {
        const accountId = req.params.accountId;

        // verify user has access to this account
        const account = await Account.findOne({
            _id: accountId,
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        });

        if (!account) {
            return res.redirect('/accounts');
        }

        // get all accounts for display in dropdown
        const accounts = await Account.find({
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        }).sort({ createdAt: -1 });

        // get transactions sorted by date descending
        const transactions = await Transaction.find({ account: accountId })
            .populate('createdBy', 'name email')
            .sort({ date: -1 });

        // calculate totals
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        res.render('transactions', {
            transactions,
            currentAccount: account,
            accounts,
            income,
            expense,
            balance: income - expense,
            error: null
        });
    } catch (err) {
        console.error('Get transactions error:', err);
        res.redirect('/accounts');
    }
};


export async function createTransaction (req, res) {
    /**
     * create Transaction 
     * return json with message and redirectUrl 
     */
    try {
        // receive info from form
        const { account, type, category, amount, description, date, accountName } = req.body;
        
        // verify user has access to this account
        const accountDoc = await Account.findOne({
            _id: account,
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        });
        // if not return error message
        if (!accountDoc) {
            return res.status(404).json({ error: 'Account not found or unauthorized' });
        }

        await Transaction.create({
            account,
            type,
            category,
            accountName,
            amount: parseFloat(amount),
            description: description || '',
            date: date || new Date(),
            createdBy: req.user._id
        });

        res.json({
            success: true,
            redirectUrl: `/transactions/${account}`,
            message: 'Transaction added successfully!'
        });
    } catch (err) {
        console.error('Create transaction error:', err);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
};


export async function updateTransaction (req, res) {
    /**
     * update Transaction detail
     * return json with message and redirectUrl 
     */
    try {
        // update transaction details
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // verify user has access to the account
        const account = await Account.findOne({
            _id: transaction.account,
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        });

        if (!account) {
            return res.status(404).json({ error: 'Account not found or unauthorized' });
        }

        const { type, category, amount, description, date, accountName } = req.body;

        transaction.type = type;
        transaction.category = category;
        transaction.accountName = accountName;
        transaction.amount = parseFloat(amount);
        transaction.description = description || '';
        transaction.date = date || transaction.date;

        await transaction.save();

        res.json({
            success: true,
            redirectUrl: `/transactions/${transaction.account}`,
            message: 'Transaction updated successfully!'
        });
    } catch (err) {
        console.error('Update transaction error:', err);
        res.status(500).json({ error: 'Failed to update transaction' });
    }
};


export async function deleteTransaction(req, res) {
    /**
     * delete Transaction 
     * return json with message and redirectUrl 
     */
    try {
        // delete transaction, only owner can delete
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // verify user has access to the account
        const account = await Account.findOne({
            _id: transaction.account,
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        });

        if (!account) {
            return res.status(404).json({ error: 'Account not found or unauthorized' });
        }

        const accountId = transaction.account;
        await Transaction.deleteOne({ _id: transaction._id });

        res.json({
            success: true,
            redirectUrl: `/transactions/${accountId}`,
            message: 'Transaction deleted successfully!'
        });
    } catch (err) {
        console.error('Delete transaction error:', err);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
};
