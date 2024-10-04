import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { ArrowUpCircle, Filter, Plus, Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Label } from "../components/ui/label"
import AddLead from '../components/AddLead'; // Import the AddLead component
import { X } from 'lucide-react'; // Import the X icon

const API_BASE_URL = 'http://localhost:5038';

// Custom Modal component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
        {children}
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
      </div>
    </div>
  );
};

const CRM = () => {
  const [activeTab, setActiveTab] = useState('lead')
  const [contacts, setContacts] = useState({ lead: [], prospect: [], client: [] })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOptions, setFilterOptions] = useState({
    sector: '',
    apvMin: '',
    apvMax: '',
    location: ''
  })
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false)

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contacts`);
      console.log('Fetched contacts:', response.data);
      setContacts(response.data);
      // console.log('Contacts:', contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const filteredContacts = contacts[activeTab].filter(contact =>
    contact && contact.client && contact.client.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!filterOptions.sector || contact.sector === filterOptions.sector) &&
    (!filterOptions.apvMin || contact.apv >= parseInt(filterOptions.apvMin)) &&
    (!filterOptions.apvMax || contact.apv <= parseInt(filterOptions.apvMax)) &&
    (!filterOptions.location || contact.location.toLowerCase().includes(filterOptions.location.toLowerCase()))
  )

  const moveContact = async (id, from, to) => {
    try {
      await axios.put(`${API_BASE_URL}/contacts/${id}/status`, { from, to });
      fetchContacts();
    } catch (error) {
      console.error('Error moving contact:', error);
    }
  }

  const removeContact = async (id, from) => {
    try {
      await axios.delete(`${API_BASE_URL}/contacts/${id}`);
      fetchContacts();
    } catch (error) {
      console.error('Error removing contact:', error);
    }
  }

  const handleFilterChange = (key, value) => {
    setFilterOptions(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilterOptions({
      sector: '',
      apvMin: '',
      apvMax: '',
      location: ''
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">CRM</h1>
      
      <div className="flex space-x-4 mb-6">
        {['lead', 'prospect', 'client'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full ${
              activeTab === tab
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}s {contacts[tab].length}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-grow mr-4">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            className="pl-8"
            placeholder={`Search for ${activeTab}s`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="mr-2 flex items-center bg-red-100 text-red-600 hover:bg-red-200" onClick={() => setIsAddLeadOpen(true)}>
          <Plus size={20} className="mr-2" /> Add Lead
        </Button>

        <Button onClick={() => setIsFilterModalOpen(true)} variant="outline" className="flex items-center bg-blue-100 text-blue-600 hover:bg-blue-200">
          <Filter size={20} className="mr-2" /> Filter
        </Button>

        <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
          <h2 className="text-xl font-bold mb-4">Filter Options</h2>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sector" className="text-right">
                Sector
              </Label>
              <Select
                value={filterOptions.sector}
                onValueChange={(value) => handleFilterChange('sector', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apvMin" className="text-right">
                Min APV
              </Label>
              <Input
                id="apvMin"
                type="number"
                value={filterOptions.apvMin}
                onChange={(e) => handleFilterChange('apvMin', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apvMax" className="text-right">
                Max APV
              </Label>
              <Input
                id="apvMax"
                type="number"
                value={filterOptions.apvMax}
                onChange={(e) => handleFilterChange('apvMax', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={filterOptions.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button onClick={() => setIsFilterModalOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </Modal>
      </div>

      {isAddLeadOpen && (
        <div className="mb-6 relative bg-white p-6 rounded-lg shadow-md flex flex-col items-end gap-4">
          <button 
            onClick={() => setIsAddLeadOpen(false)} 
            className="text-gray-500 hover:text-gray-700 mb-4"
            style={{marginBottom: '20px'}}
          >
            <X  size={25} / >
          </button>
          <AddLead style={{marginBottom: '20px'}} onClose={() => setIsAddLeadOpen(false)} onLeadAdded={fetchContacts} / >
        </div>
      )}

      {filteredContacts.length > 0 ? (
        <Table style={{ width: '100%' }}>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>PIC</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>APV</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact._id}>
                <TableCell>{contact.client}</TableCell>
                <TableCell>{contact.pic}</TableCell>
                <TableCell>{contact.contact}</TableCell>
                <TableCell>{contact.sector}</TableCell>
                <TableCell>{contact.apv}</TableCell>
                <TableCell>{contact.location}</TableCell>
                <TableCell>{formatDate(contact.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {activeTab === 'lead' && (
                      <>
                        <Button size="sm" onClick={() => moveContact(contact._id, 'lead', 'prospect')}>
                          <ArrowUpCircle className="text-green-500" size={20} />
                        </Button>
                        <Button size="sm" onClick={() => moveContact(contact._id, 'lead', 'client')}>
                          <ArrowUpCircle className="text-blue-500" size={20} />
                        </Button>
                      </>
                    )}
                    {activeTab === 'prospect' && (
                      <Button size="sm" onClick={() => moveContact(contact._id, 'prospect', 'client')}>
                        <ArrowUpCircle className="text-green-500" size={20} />
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => removeContact(contact._id, activeTab)}>
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No contacts found for this category.</p>
      )}
    </div>
  )
}

export default CRM;