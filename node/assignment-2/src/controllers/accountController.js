import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";


export async function getAccounts (req, res)  {
    /**
     * get all accounts for the current user
     * include accounts where user is owner or member
     * pass transactions details for respective accounts
     * it render account ejs
     */
    try {
        const accounts = await Account.find({
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        })
            .populate('owner', 'name email')
            .populate('members', 'name email')
            .sort({ accountName: 1 });

        // get transaction info for each account
        const accountsWithStats = await Promise.all(
            accounts.map(async (account) => {
                const transactions = await Transaction.find({ account: account._id });
                const income = transactions
                    .filter(t => t.type === 'Income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const expense = transactions
                    .filter(t => t.type === 'Expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                return {
                    ...account.toObject(),
                    transactionCount: transactions.length,
                    income,
                    expense,
                    balance: income - expense
                };
            })
        );

        res.render('accounts', { accounts: accountsWithStats, error: null, success: null });
    } catch (err) {
        console.error('Get accounts error:', err);
        res.render('accounts', { accounts: [], error: 'Failed to load accounts', success: null });
    }
};


export async function createAccount (req, res)  {
    /**
     * create new account for the user
     * return json with success , redirectURL and message
     */

    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.redirect('/accounts');
        }

        const account = new Account({
            accountName: req.body.name.trim(),
            owner: req.user._id
        });
        await account.save();

        res.json({
            success: true,
            redirectUrl:'/accounts',
            message: "Account successfully created"
        });
    } catch (err) {
        console.error('Create account error:', err);
        res.status(500).json({ error: 'Failed to create account' });
    }
};

export async function updateAccount (req, res)  {
    /**
     * update account name, only owner can update
     * return json with success , redirectURL and message
     */
    try {
        const account = await Account.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!account) {
            return res.status(404).json({ error: 'Account not found or unauthorized' });
        }

        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Account name is required' });
        }

        account.accountName = name.trim();
        await account.save();

        res.json({
            success: true,
            redirectUrl: '/accounts',
            message: 'Account updated successfully!'
        });
    } catch (err) {
        console.error('Update account error:', err);
        res.status(500).json({ error: 'Failed to update account' });
    }
};


export async function deleteAccount (req, res)  {
    /**
     * delete account, only owner can delete
     * return json with success , redirectURL and message
     */
    try {
        const account = await Account.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!account) {
            return res.status(404).json({ error: 'Account not found or unauthorized' });
        }

        // delete all transactions for this account
        await Transaction.deleteMany({ account: account._id });
        // delete the account
        await Account.deleteOne({ _id: account._id });

        res.json({
            success: true,
            redirectUrl: '/accounts',
            message: 'Account deleted successfully!'
        });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};


export async function shareAccount(req, res) {
    /**
     * share account with another user by email, only owner can share
     * return json with success , redirectURL and message
     */
    try {
        const account = await Account.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

         if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const { email } = req.body;
        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // find the user to share with
        const userToShare = await User.findOne({ email: email.trim().toLowerCase() });
        if (!userToShare) {
            return res.status(404).json({ error: 'No user found with that email address' });
        }

        // don't share with yourself
        if (userToShare._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: 'You cannot share an account with yourself' });
        }

        // check if already shared
        if (account.sharedWith.includes(userToShare._id)) {
            return res.status(400).json({ error: 'This account is already shared with that user' });
        }

        account.sharedWith.push(userToShare._id);
        await account.save();
        
        res.json({
            success: true,
            redirectUrl: '/accounts',
            message: 'Account shared with ' + userToShare.name + ' successfully!'
        });
    } catch (err) {
        console.error('Share account error:', err);
        res.status(500).json({ error: 'Something went wrong while sharing' });
    }
};

