import React, { useState, useMemo } from "react";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { StorageEngine } from "../../lib/storage";
import { Transaction, BudgetLimit } from "../../types";
import { CharacterArtImage } from "../GeneratedArt";

interface FinanceViewProps {
  onXpChange: (delta: number) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ onXpChange }) => {
  const [txs, setTxs] = useState<Transaction[]>(StorageEngine.getFinance());
  const [budgets] = useState<BudgetLimit[]>(StorageEngine.getBudgets());
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDeleteTx = (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction? This cannot be undone.")) return;
    setTxs(StorageEngine.deleteTransaction(id));
  };

  // New transaction form
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState<Transaction["category"]>("Food");

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newTx: Transaction = {
      id: "tx_" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      title,
      amount: Number(amount),
      type,
      category,
    };

    const updated = [newTx, ...txs];
    setTxs(updated);
    StorageEngine.setFinance(updated);
    setShowAddModal(false);
    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("Food");
    onXpChange(10);
  };

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const inc = txs.filter((t) => t.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
    const exp = txs.filter((t) => t.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);
    return { totalIncome: inc, totalExpense: exp, balance: inc - exp };
  }, [txs]);

  // Recharts category breakdown data
  const pieData = useMemo(() => budgets.map((b) => {
    const spent = txs
      .filter((t) => t.type === "expense" && t.category === b.category)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { name: b.category, value: spent || 10 };
  }), [txs, budgets]);

  const COLORS = ["#5A6A5A", "#B07D62", "#8c9b8c", "#d19a7d", "#485348", "#87604b"];

  return (
    <div className="space-y-6 pb-12 text-[#2D2D2A]">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 bg-white p-5 sm:p-7 rounded-[32px] border border-[#EBE9E1] shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
          <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-[#F1EFEC] border border-[#EBE9E1] p-1 flex items-center justify-center overflow-hidden shadow-xs">
            <CharacterArtImage type="finance" className="w-full h-full" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-serif italic text-[#2D2D2A] leading-tight">
              Finance & Allowance Tracker
            </h2>
            <p className="text-xs text-[#6B6A65] mt-1 leading-normal">
              Manage allowance, stipend, expenses, savings, and category budget limits.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-2xl bg-[#5A6A5A] hover:bg-[#4f5f4f] text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance Card */}
        <div className="p-6 rounded-[28px] bg-white border border-[#EBE9E1] space-y-2 shadow-xs">
          <span className="text-xs text-[#6B6A65] font-semibold">Total Net Balance</span>
          <div className="text-3xl font-serif text-[#5A6A5A] font-bold">${balance.toFixed(2)}</div>
          <p className="text-[11px] text-[#6B6A65]">Available Allowance & Savings</p>
        </div>

        {/* Monthly Income */}
        <div className="p-6 rounded-[28px] bg-white border border-[#EBE9E1] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B6A65] font-semibold">
            <span>Total Income / Allowance</span>
            <ArrowUpRight className="w-4 h-4 text-[#5A6A5A]" />
          </div>
          <div className="text-2xl font-serif text-[#2D2D2A] font-bold">${totalIncome.toFixed(2)}</div>
          <p className="text-[11px] text-[#6B6A65]">Stipends & Research TA</p>
        </div>

        {/* Total Expenses */}
        <div className="p-6 rounded-[28px] bg-white border border-[#EBE9E1] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B6A65] font-semibold">
            <span>Total Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-[#B07D62]" />
          </div>
          <div className="text-2xl font-serif text-[#B07D62] font-bold">${totalExpense.toFixed(2)}</div>
          <p className="text-[11px] text-[#6B6A65]">Category Budgets Active</p>
        </div>
      </div>

      {/* Main Split: Category Budgets & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Category Budget Limits */}
        <div className="lg:col-span-2 rounded-[32px] bg-white border border-[#EBE9E1] p-6 sm:p-8 space-y-4 shadow-xs">
          <h3 className="text-base font-serif italic font-bold text-[#2D2D2A]">Category Budget Limits</h3>
          <div className="space-y-4">
            {budgets.map((b) => {
              const spent = txs
                .filter((t) => t.type === "expense" && t.category === b.category)
                .reduce((acc, curr) => acc + curr.amount, 0);
              const percent = Math.min(100, Math.round((spent / b.limit) * 100));

              return (
                <div key={b.category} className="p-4 rounded-2xl bg-[#F1EFEC] border border-[#EBE9E1] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#2D2D2A]">{b.category}</span>
                    <span className="text-[#6B6A65] font-semibold">
                      ${spent.toFixed(2)} / ${b.limit.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#EBE9E1] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        percent > 90 ? "bg-rose-500" : percent > 75 ? "bg-[#B07D62]" : "bg-[#5A6A5A]"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Spending Pie Chart */}
        <div className="rounded-[32px] bg-white border border-[#EBE9E1] p-6 sm:p-8 flex flex-col items-center justify-between space-y-4 shadow-xs">
          <div className="w-full text-left">
            <h3 className="text-base font-serif italic font-bold text-[#2D2D2A]">Expenses Breakdown</h3>
            <p className="text-xs text-[#6B6A65]">Monthly category proportion</p>
          </div>

          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} fill="#8884d8">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction History Log */}
      <div className="rounded-[32px] bg-white border border-[#EBE9E1] p-6 sm:p-8 space-y-4 shadow-xs">
        <h3 className="text-base font-serif italic font-bold text-[#2D2D2A]">Transaction History ({txs.length})</h3>
        <div className="space-y-2">
          {txs.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#6B6A65] italic bg-[#F1EFEC] rounded-2xl border border-[#EBE9E1]">
              No financial transactions recorded. Add your first transaction to track income, allowance, and expenses.
            </div>
          ) : (
            txs.map((t) => (
              <div key={t.id} className="p-3.5 rounded-2xl bg-[#F1EFEC] border border-[#EBE9E1] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#2D2D2A]">{t.title}</div>
                  <div className="text-[10px] text-[#6B6A65]">{t.category} • {t.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-xs font-bold ${t.type === "income" ? "text-[#5A6A5A]" : "text-[#B07D62]"}`}>
                    {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTx(t.id)}
                    className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    title="Delete Transaction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-[32px] bg-white border border-[#EBE9E1] space-y-4 shadow-xl">
            <h3 className="text-xl font-serif italic font-bold text-[#2D2D2A]">Record Transaction</h3>
            <form onSubmit={handleAddTx} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B6A65] font-semibold mb-1">Transaction Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Groceries or Allowance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F1EFEC] border border-[#EBE9E1] rounded-2xl px-3 py-2 text-[#2D2D2A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B6A65] font-semibold mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-[#F1EFEC] border border-[#EBE9E1] rounded-2xl px-3 py-2 text-[#2D2D2A]"
                  />
                </div>

                <div>
                  <label className="block text-[#6B6A65] font-semibold mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#F1EFEC] border border-[#EBE9E1] rounded-2xl px-3 py-2 text-[#2D2D2A]"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income / Allowance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#6B6A65] font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#F1EFEC] border border-[#EBE9E1] rounded-2xl px-3 py-2 text-[#2D2D2A]"
                >
                  {["Food", "Transport", "Education", "Entertainment", "Shopping", "Medical", "Allowance", "Savings", "Other"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-2xl bg-[#F1EFEC] text-[#2D2D2A] hover:bg-[#EBE9E1] font-semibold border border-[#EBE9E1]"
                >
                  Cancel
                </button>
                <button type="submit" className="w-1/2 py-2.5 rounded-2xl bg-[#5A6A5A] hover:bg-[#4f5f4f] text-white font-semibold shadow-xs">
                  Save Transaction (+10 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
