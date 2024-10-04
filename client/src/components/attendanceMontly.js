import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../components/styles/Attendancecalendar.css';

const API_BASE_URL = 'http://localhost:5038';

const AttendanceCalendar = ({ updateTrigger }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchAttendanceData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance/monthly`, {
        params: {
          year: currentMonth.getFullYear(),
          month: currentMonth.getMonth() + 1
        }
      });
      console.log('Fetched attendance data:', response.data);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      // ... (error handling)
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData, updateTrigger]);  // Add updateTrigger to the dependency array

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getAttendanceStatus = (employeeId, day) => {
    const record = attendanceData.find(
      (employee) => employee.userId === employeeId &&
      employee.attendance.some(att => new Date(att.date).getDate() === day)
    );
    
    if (record) {
      const attendance = record.attendance.find(att => new Date(att.date).getDate() === day);
      return attendance ? attendance.status : 'NotMarked';
    }
    
    return 'NotMarked';
  };

  const getTooltipText = (status, day, employeeName) => {
    switch(status) {
      case 'Present':
        return `${day} - ${employeeName} - Present`;
      case 'Absent':
        return `${day} - ${employeeName} - Absent`;
      case 'Leave':
        return `${day} - ${employeeName} - On Leave`;
      case 'NotMarked':
        return `${day} - ${employeeName} - Attendance Not Marked`;
      default:
        return 'Unknown Status';
    }
  };

  const renderLegend = () => (
    <div className="attendance-legend">
      <div className="legend-item">
        <div className="attendance-circle Present"></div>
        <span>Present </span>
      </div>
      <div className="legend-item">
        <div className="attendance-circle Absent"></div>
        <span>Absent </span>
      </div>
      <div className="legend-item">
        <div className="attendance-circle Leave"></div>
        <span>On Leave</span>
      </div>
      <div className="legend-item">
        <div className="attendance-circle NotMarked"></div>
        <span>Not Marked</span>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className='p-6 shadow rounded-lg'>
         <div className="calendar-header">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
</svg>

          </button>
          <h2>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
</svg>

          </button>
        </div>
     <div className="attendance-calendar">
       
        <table>
          <thead>
            <tr>
              <th></th>
              {days.map((day) => (
                <th key={day}>{day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((employee) => (
              <tr key={employee.userId}>
                <td>{employee.userName}</td>
                {days.map((day) => {
                  const status = getAttendanceStatus(employee.userId, day);
                  return (
                    <td key={day}>
                      <div
                        className={`attendance-circle ${status}`}
                        title={getTooltipText(status, day, employee.userName)} // Add this line for the tooltip
                      ></div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderLegend()} {/* Add this line to render the legend */}
      </div> 
    );
  };

  return (
    <div>
      <h2 className='text-lg font-bold'>Attendance Calendar</h2>
      {renderCalendar()}
    </div>
  );
};

export default AttendanceCalendar;