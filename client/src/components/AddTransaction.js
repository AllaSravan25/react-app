import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

const API_BASE_URL = 'http://localhost:5038';

export default function AddTransaction({ onTransactionAdded }) {
  const [newTransaction, setNewTransaction] = useState({
    type: 'received',
    category: '',
    subcategory: '',
    description: '',
    to: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleTransactionSubmit = async (e) => {
    e.preventDefault()
    try {
      const transactionData = {
        type: newTransaction.type,
        category: newTransaction.category,
        subcategory: newTransaction.subcategory,
        description: newTransaction.description,
        to: newTransaction.to,
        amount: parseFloat(newTransaction.amount),
        date: new Date(newTransaction.date)
      }
      
      console.log('AddTransaction: Sending transaction data:', transactionData);

      const response = await axios.post(`${API_BASE_URL}/transactions`, transactionData)
      console.log('AddTransaction: Server response:', response.data);

      setNewTransaction({
        type: 'received',
        category: '',
        subcategory: '',
        description: '',
        to: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      })
      toast.success("Transaction added successfully", {
        description: "Your new transaction has been recorded.",
      })
      
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (error) {
      console.error('AddTransaction: Error adding transaction:', error)
      console.error('AddTransaction: Error response:', error.response?.data)
      toast.error("Failed to add transaction", {
        description: error.response?.data?.message || "Please try again.",
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTransaction(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e) => {
    const { name, value } = e.target
    setNewTransaction(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleTransactionSubmit}>
      <div className="grid grid-cols-7 gap-4 mb-4">
        <div className="flex flex-col">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            value={newTransaction.type}
            onChange={handleSelectChange}
            className="w-full p-2 border rounded"
          >
            <option value="received">Received</option>
            <option value="sent">Sent</option>
          </select>
        </div>
        <div className="flex flex-col">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            value={newTransaction.category}
            onChange={handleInputChange}
            placeholder="Enter category"
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="subcategory">Subcategory</Label>
          <Input
            id="subcategory"
            name="subcategory"
            value={newTransaction.subcategory}
            onChange={handleInputChange}
            placeholder="Enter subcategory"
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={newTransaction.description}
            onChange={handleInputChange}
            placeholder="Enter description"
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="to">To/From</Label>
          <Input
            id="to"
            name="to"
            value={newTransaction.to}
            onChange={handleInputChange}
            placeholder="Enter recipient/sender"
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={newTransaction.amount}
            onChange={handleInputChange}
            placeholder="Enter amount"
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={newTransaction.date}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit">Add Transaction</Button>
      </div>
    </form>
  );
}