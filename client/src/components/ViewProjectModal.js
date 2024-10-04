import React from 'react';
import { Button } from "./ui/button";
import { ExternalLink } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5038'; // Add this line

const ViewProjectModal = ({ isOpen, onClose, project, onViewDocument }) => {
  if (!isOpen || !project) return null;

  console.log('Project in ViewProjectModal:', project);

  const handleViewDocument = (doc) => {
    const url = doc.path.startsWith('http') ? doc.path : `${API_BASE_URL}${doc.path}`;
    console.log('Viewing document:', doc);
    console.log('Constructed URL:', url);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Project Details</h2>
        <div className="grid gap-4">
          <div>
            <strong>Project ID:</strong> {project.ProjectId}
          </div>
          <div>
            <strong>Name:</strong> {project.name}
          </div>
          <div>
            <strong>Requirement:</strong> {project.requirement}
          </div>
          <div>
            <strong>Project Value:</strong> {project.projectValue}
          </div>
          <div>
            <strong>Assigned Team:</strong> {project.assignTeam}
          </div>
          <div>
            <strong>Sector:</strong> {project.sector}
          </div>
          <div>
            <strong>Date:</strong> {new Date(project.date).toLocaleDateString()}
          </div>
          <div>
            <strong>Status:</strong> {project.status}
          </div>
          <div>
            <strong>Documents:</strong>
            {project.documents && project.documents.length > 0 ? (
              <ul>
                {project.documents.map((doc, index) => {
                  console.log('Document in map:', doc);
                  return (
                    <li key={index} className="flex items-center space-x-2">
                      <span>{doc.originalName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDocument(doc)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink size={16} />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <span>No documents</span>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default ViewProjectModal;