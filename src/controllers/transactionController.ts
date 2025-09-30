import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import User from '../models/User';

// Categorize transaction based on type or description (customize as needed)
function categorizeTransaction(description: string, amount: number, type: string): string {
  if (type === 'income') return 'General Income';
  if (type === 'expense') return 'General Expense';
  return 'Uncategorized';
}

export const createTransaction = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { type, amount, description, category, date, tags } = req.body;

    // Input validation
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Invalid or missing transaction type' });
    }
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Use provided category or auto-categorize
    const finalCategory = category || categorizeTransaction(description, amount, type);

    // Create and save the transaction
    const transaction = new Transaction({
      userId: req.user._id,
      type,
      amount,
      description,
      category: finalCategory,
      date: date ? new Date(date) : new Date(),
      tags: tags || [],
      source: 'manual'
    });

    await transaction.save();

    // Update user's current balance
    const balanceChange = type === 'income' ? amount : -amount;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { currentBalance: balanceChange } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction,
      currentBalance: user.currentBalance
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};