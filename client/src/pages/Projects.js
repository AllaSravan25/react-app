import React, { useState, useEffect } from 'react';
// import { LineChart } from '@mui/x-charts';
import axios from 'axios';

// Update these imports to use the correct paths
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Avatar, AvatarFallback } from "../components/ui/Avatar"
import { CheckCircle, Edit, Filter, Plus, Search } from 'lucide-react'
import AddProject from '../components/AddProject';
import EditModal from '../components/EditModal';
import ViewProjectModal from '../components/ViewProjectModal'; // Add this import

// const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
// const xLabels = [
//   'Page A',
//   'Page B',
//   'Page C',
//   'Page D',
//   'Page E',
//   'Page F',
//   'Page G',
// ];

// const TinyLineChart = () => {
//   return (
//     <LineChart
//       width={1300}
//       height={300}
//       series={[{ data: pData }]}
//       xAxis={[{ scaleType: 'point', data: xLabels }]}
//     />
//   );
// };

const API_BASE_URL = 'http://localhost:5038';

function ProjectsPage() {
  const [activeProjects, setActiveProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [activeSearch, setActiveSearch] = useState('');
  const [completedSearch, setCompletedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(1000000000);  // New state variable
  const [showAddProject, setShowAddProject] = useState(false);
  const [markAsCompleted, setMarkAsCompleted] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editedProject, setEditedProject] = useState({});
  const [viewingProject, setViewingProject] = useState(null);


  const projectFields = [
    { name: 'name', label: 'Name' },
    { name: 'requirement', label: 'Requirement' },
    { name: 'projectValue', label: 'Project Value' },
    // Add other fields as needed, but not assignTeam as we're handling it separately
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching projects from:', `${API_BASE_URL}/projectslist`);
        const response = await axios.get(`${API_BASE_URL}/projectslist`);
        console.log('Response:', response.data);
        console.log('Active Projects:', response.data.activeProjects);
        console.log('Completed Projects:', response.data.completedProjects);
        setActiveProjects(response.data.activeProjects);
        setCompletedProjects(response.data.completedProjects);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        if (err.response) {
          console.error('Error response:', err.response.data);
          console.error('Error status:', err.response.status);
          console.error('Error headers:', err.response.headers);
        } else if (err.request) {
          console.error('Error request:', err.request);
        } else {
          console.error('Error message:', err.message);
        }
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleAddProject = () => {
    setShowAddProject(true);
  };

  const handleRowClick = (project) => {
    setMarkAsCompleted(project.ProjectId);
    setSelectedProject(project.ProjectId);
    // console.log('Project ID:', project.ProjectId || 'No ID found');
  };


  const handleMarkAsCompleted = async () => {
    if (!markAsCompleted) {
      console.log('No project selected');
      return;
    }
    
    console.log('Mark as completed clicked', markAsCompleted);
    try {
      const response = await axios.put(`${API_BASE_URL}/projectslist/activeProjects/markAsCompleted`, { id: parseInt(markAsCompleted, 10) });
      console.log('Response:', response.data);
      
      // Update the local state to reflect the change
      setActiveProjects(prevProjects => 
        prevProjects.filter(project => project.ProjectId !== markAsCompleted)
      );
      setCompletedProjects(prevProjects => [
        ...prevProjects,
        activeProjects.find(project => project.ProjectId === markAsCompleted)
      ]);
      
      // Reset the selected project
      setMarkAsCompleted(null);
      
      // Optionally, show a success message
      // toast.success("Project marked as completed successfully");
    } catch (error) {
      console.error('Error marking project as completed:', error);
      // toast.error("Failed to mark project as completed");
    }
  };

  const handleEditClick = async (projectId) => {
    try {
      console.log('Fetching project details for ID:', projectId);
      const response = await axios.get(`${API_BASE_URL}/projectslist/ProjectDetails/${projectId}`);
      console.log('Received project details:', response.data);
      setEditingProject(response.data);
      setEditedProject(response.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      // Optionally, show an error message to the user
      // toast.error("Failed to fetch project details");
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocuments = files.map(file => ({
      file,
      filename: file.name,
      originalName: file.name,
    }));
    
    setEditedProject(prev => ({
      ...prev,
      documents: [...(prev.documents || []), ...newDocuments]
    }));
  };

  const handleDeleteDocument = (index) => {
    setEditedProject(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleViewDocument = (doc) => {
    const url = doc.path.startsWith('http') ? doc.path : `${API_BASE_URL}${doc.path}`;
    console.log('Document object:', doc);
    console.log('Constructed URL:', url);
    window.open(url, '_blank');
  };

  const handleRenameDocument = (index, newName) => {
    setEditedProject(prev => ({
      ...prev,
      documents: prev.documents.map((doc, i) => 
        i === index ? { ...doc, originalName: newName } : doc
      )
    }));
  };

  const handleUpdateProject = async () => {
    try {
      console.log('Updating project:', editingProject.ProjectId);
      console.log('Updated project data:', editedProject);

      // Create a copy of editedProject without the _id field
      const { _id, ...projectDataWithoutId } = editedProject;

      const formData = new FormData();
      formData.append('projectData', JSON.stringify(projectDataWithoutId));

      // Append all documents, including existing ones and new ones
      if (projectDataWithoutId.documents) {
        projectDataWithoutId.documents.forEach((doc, index) => {
          if (doc.file) {
            formData.append('newDocuments', doc.file);
            formData.append(`newDocumentLabels`, doc.originalName);
          } else {
            // For existing documents, just update the name if it has changed
            formData.append(`existingDocuments`, JSON.stringify(doc));
          }
        });
      }

      const response = await axios.put(
        `${API_BASE_URL}/projectslist/${editingProject.ProjectId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Update response:', response.data);
      setActiveProjects(prevProjects => prevProjects.map(p => p.ProjectId === editingProject.ProjectId ? {...p, ...response.data.project} : p));
      setEditingProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };



const handleViewClick = async (projectId) => {
  console.log('Viewing project:', projectId);
  try {
    const response = await axios.get(`${API_BASE_URL}/projectslist/ProjectDetails/${projectId}`);
    console.log('Received project details:', response.data);
    setViewingProject(response.data);
  } catch (error) {
    console.error('Error fetching project details:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    // Optionally, show an error message to the user
    // toast.error("Failed to fetch project details");
  }
  // Add your logic here to handle the view action
};


  const displayedActiveProjects = activeProjects
    .filter(p => p.name ? p.name.toLowerCase().includes(activeSearch.toLowerCase()) : true)
    .slice(0, displayLimit);

  const displayedCompletedProjects = completedProjects
    .filter(p => p.name ? p.name.toLowerCase().includes(completedSearch.toLowerCase()) : true)
    .slice(0, displayLimit);

  const handleLoadMore = () => {
    setDisplayLimit(prevLimit => prevLimit + 7);
  };

  

  return (
    <div className="container mx-auto p-6 space-y-8">
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Active Projects</h2>
          <div className="flex space-x-2" >
          <Button style={{display: 'flex', alignItems: 'center'}} onClick={handleMarkAsCompleted}>
                <Plus size={20} className="mr-2" /> mark as completed
          </Button>
            <div className="relative flex bg-grey-100">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                className="pl-8"
                placeholder="Search for project"
                value={activeSearch}
                onChange={(e) => setActiveSearch(e.target.value)}
                style={{backgroundColor: '#f0f0f0'}}
              />
            </div>
            <div>
              
            <Button className="flex bg-red-100 text-red-600 hover:bg-red-200" onClick={handleAddProject}>
              <Plus size={20} className="mr-2" /> Add Project
            </Button>
            <div>
             
              </div>
            </div>
          </div>
        </div>
        
        {showAddProject && (
          <div className="mb-4 shadow" style={{  padding: '20px', borderRadius: '24px' }}>
            <div className="flex justify-end">
              <Button onClick={() => setShowAddProject(false)} className="mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="mt-1 mb-4">
              <AddProject />
            </div>
          </div>
        )}
        <div className="table-container">
          <div className="table-wrapper">
            <Table>
              <TableHeader className="sticky-header">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Project value</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedActiveProjects.map((project) => (
                  <TableRow 
                    key={project.ProjectId} 
                    onClick={() => handleRowClick(project)}
                    className={selectedProject === project.ProjectId ? 'bg-blue-100' : ''}
                  >
                    <TableCell>{project.ProjectId}</TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.requirement}</TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {project.assignTeam && project.assignTeam.map ? (
                          project.assignTeam.map((member, index) => (
                            <Avatar key={index} className="border-2 border-white">
                              <AvatarFallback>{member}</AvatarFallback>
                            </Avatar>
                          ))
                        ) : (
                          <span>{project.assignTeam}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{project.projectValue}</TableCell>
                    <TableCell>{project.documents && <CheckCircle className="text-green-500" />}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(project.ProjectId)}>
                        <Edit size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        {activeProjects.length > displayLimit && (
          <div className="mt-4 text-center text-blue-500 cursor-pointer" onClick={handleLoadMore}>
            Load More
          </div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Completed Projects</h2>
          <div className="flex space-x-2">
            <div className="relative flex items-center">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                className="pl-8"
                placeholder="Search for project"
                value={completedSearch}
                onChange={(e) => setCompletedSearch(e.target.value)}
              />
            </div>
            <Button className="bg-red-100 text-red-600 hover:bg-red-200 flex items-center">
              <Filter size={20} className="mr-2" /> Filter
            </Button>
          </div>
        </div>
        <div className="table-container">
          <div className="table-wrapper">
            <Table>
              <TableHeader className="sticky-header">
                <TableRow
                >
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Work</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Project value</TableHead>
                  <TableHead>Documents</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedCompletedProjects.map((project) => (
                  <TableRow 
                    key={project.ProjectId} 
                    onClick={() => handleViewClick(project.ProjectId)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <TableCell>{project.ProjectId}</TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.requirement}</TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {project.team && project.team.map ? (
                          project.team.map((member, index) => (
                            <Avatar key={index} className="border-2 border-white">
                              <AvatarFallback>{member}</AvatarFallback>
                            </Avatar>
                          ))
                        ) : (
                          <span>No team assigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{project.projectValue}</TableCell>
                    <TableCell>{project.documents && <CheckCircle className="text-green-500" />}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleViewClick(project.ProjectId)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>


                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        {completedProjects.length > displayLimit && (
          <div className="mt-4 text-center text-blue-500 cursor-pointer" onClick={handleLoadMore}>
            Load More
          </div>
        )}
      </section>

      <EditModal
        isOpen={editingProject !== null}
        onClose={() => setEditingProject(null)}
        title="Edit Project"
        data={editedProject}
        onInputChange={handleEditInputChange}
        onFileUpload={handleFileUpload}
        onDeleteDocument={handleDeleteDocument}
        onViewDocument={handleViewDocument}
        onRenameDocument={handleRenameDocument}
        onSave={handleUpdateProject}
        fields={projectFields}
      />

      <ViewProjectModal
        isOpen={viewingProject !== null}
        onClose={() => setViewingProject(null)}
        project={viewingProject}
        onViewDocument={handleViewDocument}
      />
    </div>
  )
}

const Projects = () => {
  return (
    <div>
      <h1>Projects</h1>
      {/* <TinyLineChart /> */}
      
        <ProjectsPage />

    </div>
  );
};

export default Projects;