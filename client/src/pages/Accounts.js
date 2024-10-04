import React, { useState, useEffect, useMemo } from 'react'
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Card, CardContent} from "../components/ui/card"
import { Search, Filter } from 'lucide-react'
import './styles/home.css'
import RevenueChart from '../components/RevenueChart'
import SpendChart from '../components/SpendChart'
import ExpenseBreakdownChart from '../components/ExpenseBreakdownChart'

const Accounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [expensesBreakdown, setExpensesBreakdown] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchTransactions(),
          fetchMonthlyData(),
          fetchExpensesBreakdown()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5038/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const response = await fetch('http://localhost:5038/transactions/monthly');
      if (!response.ok) throw new Error('Failed to fetch monthly data');
      const data = await response.json();
      console.log('Monthly data received:', data);
      setMonthlyData(data);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    }
  };

  const fetchExpensesBreakdown = async () => {
    try {
      const response = await fetch('http://localhost:5038/transactions/expenses');
      if (!response.ok) throw new Error('Failed to fetch expenses breakdown');
      const data = await response.json();
      setExpensesBreakdown(data);
    } catch (error) {
      console.error('Error fetching expenses breakdown:', error);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction =>
      Object.values(transaction).some(value =>
        value !== null && value !== undefined && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, transactions]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const calculateTotalRevenue = () => {
    console.log('Calculating total revenue');
    console.log('Transactions:', transactions);
    const total = transactions
      .filter(t => t.type.toLowerCase() === 'received' || t.type.toLowerCase() === 'recieved')
      .reduce((sum, t) => {
        console.log(`Adding transaction: ${t.amount}`);
        return sum + (t.amount || 0)
      }, 0);
    console.log('Total revenue:', total);
    return total;
  };

  const calculateTotalSpend = () => {
    console.log('Calculating total spend');
    const total = transactions
      .filter(t => t.type.toLowerCase() === 'sent')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    console.log('Total spend:', total);
    return total;
  };

  const calculateAccountBalance = () => {
    const balance = calculateTotalRevenue() - calculateTotalSpend();
    console.log('Account balance:', balance);
    return balance;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Accounts</h1>

      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <RevenueChart 
          data={monthlyData} 
          totalRevenue={calculateTotalRevenue()} 
          formatCurrency={formatCurrency} 
        />
        <SpendChart 
          data={monthlyData} 
          totalSpend={calculateTotalSpend()} 
          formatCurrency={formatCurrency} 
        />
        <ExpenseBreakdownChart 
          data={expensesBreakdown} 
          totalExpenses={calculateTotalSpend()} 
          formatCurrency={formatCurrency} 
        />

        <Card>
          {/* <CardHeader>
            <CardTitle>Account Balance</CardTitle>
          </CardHeader> */}
          <CardContent>
            <div className="text-4xl font-bold">{formatCurrency(calculateAccountBalance())}</div>
            <div className="text-green-500 text-lg">
              {((calculateAccountBalance() / calculateTotalRevenue()) * 100).toFixed(2)}% ↑
            </div>
            <div className="text-sm text-gray-500">Current Balance</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Transactions</h2>
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-grow mr-4">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            className="pl-8"
            placeholder="Search for transaction"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter size={20} className="mr-2" /> Filter
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-600 p-4">Type</TableHead>
              <TableHead className="font-semibold text-gray-600 p-4">Category</TableHead>
              <TableHead className="font-semibold text-gray-600 p-4">Subcategory</TableHead>
              <TableHead className="font-semibold text-gray-600 p-4 w-1/4">Description</TableHead>
              <TableHead className="font-semibold text-gray-600 p-4">Recipient</TableHead>
              <TableHead className="font-semibold text-gray-600 p-4">Amount</TableHead>
              <TableHead className="font-semibold text-gray-600 p-4">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction, index) => (
              <TableRow 
                key={transaction.id}
                style={{
                  border: '1px solid #e0e0e0',
                  padding: '10px'
                }}
              >
                <TableCell className="py-4">{transaction.type}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.subcategory}</TableCell>
                <TableCell className="max-w-xs break-words">{transaction.description}</TableCell>
                <TableCell>{transaction.to}</TableCell>
                <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                <TableCell>{formatDate(transaction.date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Accounts;