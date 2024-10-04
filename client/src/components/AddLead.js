import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select"

const API_BASE_URL = 'http://localhost:5038';

export default function AddLead() {
  console.log('Rendering AddLead component');
  const [newLead, setNewLead] = useState({
    client: '',
    pic: '',
    contact: '',
    sector: '',
    apv: '',
    location: ''
  });
  console.log('Current newLead state:', newLead);

  const handleLeadSubmit = async (e) => {
    e.preventDefault()
    try {
      const leadData = {
        client: newLead.client,
        pic: newLead.pic,
        contact: newLead.contact,
        sector: newLead.sector,
        apv: parseFloat(newLead.apv),
        location: newLead.location,
        status: 'lead'
      }
      
      console.log('AddLead: Sending lead data:', leadData);

      const response = await axios.post(`${API_BASE_URL}/leads`, leadData)
      console.log('AddLead: Server response:', response.data);

      setNewLead({
        client: '',
        pic: '',
        contact: '',
        sector: '',
        apv: '',
        location: ''
      })
      toast.success("Lead added successfully", {
        description: "Your new lead has been added to CRM.",
      })
    } catch (error) {
      console.error('AddLead: Error adding lead:', error)
      console.error('AddLead: Error response:', error.response?.data)
      toast.error("Failed to add lead", {
        description: error.response?.data?.message || "Please try again.",
      })
    }
  }

  const handleLeadInputChange = (e) => {
    const { name, value } = e.target
    setNewLead(prev => ({ ...prev, [name]: value }))
  }

  const handleSectorChange = (e) => {
    const value = e.target.value;
    console.log('Sector selected:', value);
    setNewLead(prev => {
      const updated = { ...prev, sector: value };
      console.log('Updated newLead state:', updated);
      return updated;
    });
  };

  return (
    <form onSubmit={handleLeadSubmit}>
      <div className="flex justify-between gap-4 mb-4" style={{overflowX:'scroll'}}>
        <div className="flex flex-col">
          <Label htmlFor="client" className="mb-1">Client</Label>
          <Input 
            id="client" 
            name="client"
            value={newLead.client}
            onChange={handleLeadInputChange}
            placeholder="Enter your client name" 
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="pic" className="mb-1">Person in contact</Label>
          <Input 
            id="pic" 
            name="pic"
            value={newLead.pic}
            onChange={handleLeadInputChange}
            placeholder="Person in contact" 
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="contact" className="mb-1">Contact no</Label>
          <Input 
            id="contact" 
            name="contact"
            value={newLead.contact}
            onChange={handleLeadInputChange}
            placeholder="Contact number" 
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="sector" className="mb-1">Sector</Label>
          <select
            id="sector"
            name="sector"
            value={newLead.sector}
            onChange={handleSectorChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select sector</option>
            <option value="technology">Technology</option>
            <option value="finance">Finance</option>
            <option value="healthcare">Healthcare</option>
            <option value="education">Education</option>
          </select>
        </div>
        <div className="flex flex-col">
          <Label htmlFor="apv" className="mb-1">APV</Label>
          <Input 
            id="apv" 
            name="apv"
            value={newLead.apv}
            onChange={handleLeadInputChange}
            placeholder="Enter approx project value" 
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="location" className="mb-1">Location</Label>
          <Input 
            id="location" 
            name="location"
            value={newLead.location}
            onChange={handleLeadInputChange}
            placeholder="Project location" 
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" className="submitButtons">
          Add lead
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </span>
        </Button>
      </div>
    </form>
  );
}