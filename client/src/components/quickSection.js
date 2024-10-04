import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Card, CardContent } from "./ui/card"

import { Tabs, TabsList } from "./ui/tabs"
import BulkAttendanceForm from './BulkAttendanceForm'
import AddLead from './AddLead'
import AddProject from './AddProject'
import AddTransaction from './AddTransaction'

const API_BASE_URL = 'http://localhost:5038';

// Removed unused CustomTabsTrigger component

export default function QuickSection({ onTransactionAdded }) {
  const [employees, setEmployees] = useState([]);
  const [attendanceUpdateMessage, setAttendanceUpdateMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState('attendance');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/employees`);
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  const handleAttendanceUpdate = () => {
    setAttendanceUpdateMessage('Attendance updated successfully');
    setTimeout(() => setAttendanceUpdateMessage(''), 3000);
  };

  const renderTabContent = () => {
    switch(selectedTab) {
      case 'attendance':
        return (
          <Card className="bg-blue-50 radiusTabs">
            <CardContent className="p-6">
              <BulkAttendanceForm 
                employees={employees} 
                onAttendanceUpdate={handleAttendanceUpdate} 
              />
            </CardContent>
          </Card>
        );
      case 'lead':
        return (
          <Card className="bg-blue-50 radiusTabs">
            <CardContent className="p-6">
              <AddLead />
            </CardContent>
          </Card>
        );
      case 'expense':
        return (
          <Card className="bg-blue-50 radiusTabs">
            <CardContent className="p-6">
              <AddTransaction onTransactionAdded={onTransactionAdded} />
            </CardContent>
          </Card>
        );
      case 'project':
        return (
          <Card className="bg-blue-50 radiusTabs">
            <CardContent className="p-6">
              <AddProject />
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto rounded-lg" style={{ borderRadius: '25px' }}>
      <h2 className="text-2xl font-bold mb-6">Quick section</h2>
      {attendanceUpdateMessage && (
        <p className="text-green-600 mb-4">{attendanceUpdateMessage}</p>
      )}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="quickTabOptions mb-6">
          {['attendance', 'lead', 'expense', 'project'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full ${
                selectedTab === tab
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab === 'attendance' && 'Mark attendance'}
              {tab === 'lead' && 'Add Lead to CRM'}
              {tab === 'expense' && 'Add Transaction'}
              {tab === 'project' && 'Add Project'}
            </button>
          ))}
        </TabsList>
        {renderTabContent()}
      </Tabs>
    </div>
  );
  
}