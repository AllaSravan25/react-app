import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { X } from 'lucide-react';
import { Select } from "./ui/select";

const initialEmployeeData = {
  userId: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  contactNumber: '',
  address: '',
  position: '',
  department: '',
  hireDate: '',
  status: 'present',
};

export default function AddEmployeeModal({ isOpen, onClose, onAddEmployee, initialData, isEditing }) {
  const [employeeData, setEmployeeData] = useState(initialEmployeeData);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        // Format dates for input fields
        const formattedData = {
          ...initialData,
          dateOfBirth: formatDateForInput(initialData.dateOfBirth),
          hireDate: formatDateForInput(initialData.hireDate),
        };
        setEmployeeData(formattedData);
        setDocuments(initialData.documents || []);
      } else {
        fetchLatestUserId();
      }
    } else {
      resetForm();
    }
  }, [isOpen, isEditing, initialData]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const resetForm = () => {
    setEmployeeData(initialEmployeeData);
    setDocuments([]);
  };

  const fetchLatestUserId = async () => {
    try {
      console.log('Fetching latest user ID...');
      const response = await fetch('http://localhost:5038/employees/latest-user-id');
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch latest user ID: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Received data:', data);
      const newUserId = (data.latestUserId || 1000) + 1;
      console.log('New user ID:', newUserId);
      setEmployeeData(prev => ({ ...prev, userId: newUserId }));
    } catch (error) {
      console.error('Error fetching latest user ID:', error);
      // Set a default userId if fetching fails
      setEmployeeData(prev => ({ ...prev, userId: 1001 }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setDocuments([...documents, ...Array.from(e.target.files)]);
  };

  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    Object.keys(employeeData).forEach(key => {
      if (key === 'dateOfBirth' || key === 'hireDate') {
        formData.append(key, employeeData[key] ? new Date(employeeData[key]).toISOString() : '');
      } else {
        formData.append(key, employeeData[key]);
      }
    });

    documents.forEach((doc) => {
      if (doc instanceof File) {
        formData.append('documents', doc);
      } else {
        formData.append('existingDocuments', JSON.stringify(doc));
      }
    });

    try {
      const url = isEditing ? `http://localhost:5038/employees/${employeeData.userId}` : 'http://localhost:5038/employees';
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add/update employee');
      }

      const result = await response.json();
      onAddEmployee(result.employee);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error adding/updating employee:', error);
      alert(`Error adding/updating employee: ${error.message}`);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" value={employeeData.firstName} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" value={employeeData.lastName} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input 
                id="dateOfBirth" 
                name="dateOfBirth" 
                type="date" 
                value={employeeData.dateOfBirth} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select id="gender" name="gender" value={employeeData.gender} onChange={handleInputChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input id="contactNumber" name="contactNumber" value={employeeData.contactNumber} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" value={employeeData.address} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input id="position" name="position" value={employeeData.position} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" value={employeeData.department} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input 
                id="hireDate" 
                name="hireDate" 
                type="date" 
                value={employeeData.hireDate} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" value={employeeData.status} onChange={handleInputChange} required>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="documents">Upload Documents</Label>
              <Input id="documents" type="file" onChange={handleFileChange} multiple />
            </div>
            {documents.length > 0 && (
              <div>
                <Label>Uploaded Documents:</Label>
                <ul className="list-disc pl-5">
                  {documents.map((doc, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span>{doc.name}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeDocument(index)}>
                        <X size={16} />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit">{isEditing ? 'Update Employee' : 'Add Employee'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}