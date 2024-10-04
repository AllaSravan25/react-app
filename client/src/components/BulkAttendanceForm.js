import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

const API_BASE_URL = 'http://localhost:5038';

function BulkAttendanceForm({ employees, onAttendanceUpdate }) {
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkAttendance, setBulkAttendance] = useState({});
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const initialAttendance = employees.reduce((acc, employee) => {
      acc[employee.userId] = 'Present';
      return acc;
    }, {});
    setBulkAttendance(initialAttendance);
    console.log('Initial bulkAttendance state:', initialAttendance);
  }, [employees]);

  const handleBulkAttendanceChange = (userId, status) => {
    console.log(`Attempting to change attendance for user ${userId} to ${status}`);
    setBulkAttendance(prev => {
      const newState = {
        ...prev,
        [userId]: status
      };
      console.log('New bulkAttendance state:', newState);
      return newState;
    });
  };

  const handleBulkAttendanceSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const attendanceData = Object.entries(bulkAttendance).map(([userId, status]) => {
      // Ensure the date is in UTC and formatted correctly
      const date = new Date(attendanceDate);
      date.setUTCHours(0, 0, 0, 0);
      return {
        userId: userId.toString(),
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        status: status,
      };
    });

    console.log('Formatted attendance data:', attendanceData);

    if (attendanceData.length === 0) {
      setError('No attendance data to submit');
      return;
    }

    console.log('Sending attendance data:', JSON.stringify(attendanceData, null, 2));

    try {
      const response = await axios.post(`${API_BASE_URL}/attendance/bulk`, attendanceData);
      console.log('Bulk attendance submission response:', response.data);
      onAttendanceUpdate(); // Call the refresh function
      setSuccessMessage('Attendance submitted successfully');
    } catch (error) {
      console.error('Error marking bulk attendance:', error);
      if (error.response) {
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response status:', error.response.status);
        console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
        setError(`Failed to mark bulk attendance: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('Failed to mark bulk attendance: No response received from server');
      } else {
        console.error('Error setting up request:', error.message);
        setError(`Failed to mark bulk attendance: ${error.message}`);
      }
    }
  };

//   const handleSingleAttendanceSubmit = async (userId) => {
//     try {
//       const singleAttendanceData = [{
//         userId: userId,
//         date: attendanceDate,
//         status: bulkAttendance[userId] || 'Present'
//       }];
//       console.log('Sending single attendance data:', JSON.stringify(singleAttendanceData, null, 2));
//       const response = await axios.post(`${API_BASE_URL}/attendance/bulk`, singleAttendanceData);
//       console.log('Single attendance submission response:', response.data);
//       setSuccessMessage(`Attendance for user ${userId} submitted successfully`);
//       onAttendanceUpdate(); // Call the refresh function
//     } catch (error) {
//       console.error('Error marking single attendance:', error);
//       setError(`Failed to mark attendance for user ${userId}: ${error.response?.data?.message || error.message}`);
//     }
//   };

  // Call this function for a single employee to test
  // handleSingleAttendanceSubmit('1001', 'Present');

  return (
    <div>
      {/* <h2 className="text-xl font-semibold mb-4">Bulk Attendance Marking</h2> */}
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {successMessage && <p className="text-green-600 mb-2">{successMessage}</p>}
      <form onSubmit={handleBulkAttendanceSubmit}>
        <div className="mb-4">
          {/* <Label htmlFor="attendanceDate" className="block mb-2">Date</Label> */}
          <Input
            id="attendanceDate"
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            // className="w-full"
          />
        </div>
        <div className="flex justify-between gap-4 " style={{overflowX:'scroll'}}>
          {employees.map((employee) => (
            <div key={employee.userId} className="flex flex-col">
              <Label className="mb-1 text-center font-semibold">{`${employee.firstName} `}</Label>
              <select 
                value={bulkAttendance[employee.userId] || ''}
                onChange={(e) => handleBulkAttendanceChange(employee.userId, e.target.value)}
                className="w-full pl-8 pr-8 py-2  border rounded"
              style={{borderRadius:'8px'}}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
              {/* <p className="mt-1 text-sm">Current status: {bulkAttendance[employee.userId] || 'Not set'}</p> */}
              {/* <Button 
                type="button" 
                onClick={() => handleSingleAttendanceSubmit(employee.userId)}
                className="mt-2"
              >
                Submit
              </Button> */}
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button type="submit" className="submitButtons" >Submit Attendance <span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
</svg>
</span></Button>
        </div>
      </form>
      {/* <div className="mt-4">
        <h3 className="text-lg font-semibold">Current Bulk Attendance State:</h3>
        <pre className="bg-gray-100 p-2 rounded mt-2">
          {JSON.stringify(bulkAttendance, null, 2)}
        </pre>
      </div> */}
    </div>
  );
}

export default BulkAttendanceForm;