import React, { useState, useEffect } from 'react'
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Avatar, AvatarFallback } from "../components/ui/Avatar"
import { Search, Plus, FileText } from 'lucide-react'
import AddEmployeeModal from '../components/AddEmployeeModal'

export default function Team() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewDocumentsModalOpen, setIsViewDocumentsModalOpen] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5038/employees')
      if (!response.ok) {
        throw new Error('Failed to fetch employees')
      }
      const data = await response.json()
      setTeamMembers(data)
      if (data.length > 0) {
        setSelectedMember(data[0])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleAddEmployee = (newEmployee) => {
    setTeamMembers([...teamMembers, newEmployee])
  }

  const handleEditEmployee = (updatedEmployee) => {
    setTeamMembers(teamMembers.map(member => 
      member.userId === updatedEmployee.userId ? updatedEmployee : member
    ))
    setSelectedMember(updatedEmployee)
  }

  const handleViewDocuments = () => {
    setIsViewDocumentsModalOpen(true)
  }

  const filteredMembers = teamMembers.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Employees <span className="text-4xl text-red-500">({teamMembers.length})</span></h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-grow mr-4">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            className="pl-8"
            placeholder="Search for Member"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-red-100 flex align-center text-red-600 hover:bg-red-200" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={20} className="mr-2" /> Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        <div className="lg:col-span-2 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card 
              key={member._id || member.userId} // Use a unique identifier
              className={`cursor-pointer hover:shadow-md transition-shadow ${selectedMember?.userId === member.userId ? 'ring-2 ring-blue-500' : ''} shadow rounded-lg`}
              onClick={() => setSelectedMember(member)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4" >
                  <Avatar className="w-12 h-12" style={{ backgroundColor: '#dceeff' }}>
                    <AvatarFallback>{`${member.firstName[0]}${member.lastName[0]}`}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{`${member.firstName} ${member.lastName}`}</h3>
                    <p className="text-sm text-gray-500">{member.department}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-500">
                  <span>ID: {member.userId}</span>
                  <span>{member.position}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {selectedMember && (
          <Card className="lg:row-span-2 shadow rounded-lg">
            <CardContent className="p-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="w-32 h-32 mb-4 " style={{ backgroundColor: '#dceeff' }}>
                  <AvatarFallback>{`${selectedMember.firstName[0]}${selectedMember.lastName[0]}`}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{`${selectedMember.firstName} ${selectedMember.lastName}`}</h2>
              </div>
              <div className="space-y-2">
                <p><strong>Department:</strong> {selectedMember.department}</p>
                <p><strong>Position:</strong> {selectedMember.position}</p>
                <p><strong>Contact number:</strong> {selectedMember.contactNumber || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedMember.address || 'N/A'}</p>
                <p><strong>Date of Birth:</strong> {selectedMember.dateOfBirth ? new Date(selectedMember.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Hire Date:</strong> {selectedMember.hireDate ? new Date(selectedMember.hireDate).toLocaleDateString() : 'N/A'}</p>
                <div className="flex items-center">
                  <strong className="mr-2">Documents:</strong>
                  <Button variant="outline" size="sm" onClick={handleViewDocuments}>
                    <FileText size={16} className="mr-2" />
                    View
                  </Button>
                </div>
              </div>
              <Button className="w-full mt-6" onClick={() => setIsEditModalOpen(true)}>Edit</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEmployee={handleAddEmployee}
      />

      <AddEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onAddEmployee={handleEditEmployee}
        initialData={selectedMember}
        isEditing={true}
      />

      {isViewDocumentsModalOpen && (
        <ViewDocumentsModal
          isOpen={isViewDocumentsModalOpen}
          onClose={() => setIsViewDocumentsModalOpen(false)}
          documents={selectedMember.documents}
        />
      )}
    </div>
  )
}

function ViewDocumentsModal({ isOpen, onClose, documents }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Employee Documents</h2>
        {documents && documents.length > 0 ? (
          <ul className="list-disc pl-5">
            {documents.map((doc, index) => (
              <li key={index} className="mb-2">
                <a href={doc.path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {doc.originalName}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No documents available.</p>
        )}
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    </div>
  );
}