import React from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Trash2, Eye, Plus } from 'lucide-react';

const EditModal = ({ 
  isOpen, 
  onClose, 
  title, 
  data, 
  onInputChange, 
  onFileUpload, 
  onDeleteDocument, 
  onViewDocument, 
  onRenameDocument,
  onSave,
  fields
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="grid gap-4 py-4">
          {fields.map((field) => (
            <div key={field.name} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={field.name} className="text-left font-bold">
                {field.label}
              </Label>
              {field.type === 'file' ? (
                <Input
                  id={field.name}
                  name={field.name}
                  type="file"
                  onChange={onFileUpload}
                  className="col-span-3"
                  multiple
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={data[field.name] || ''}
                  onChange={onInputChange}
                  className="col-span-3 p-2 border rounded"
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  value={data[field.name] || ''}
                  onChange={onInputChange}
                  className="col-span-3"
                  type={field.type || 'text'}
                />
              )}
            </div>
          ))}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignTeam" className="text-left font-bold">
              Assign Team
            </Label>
            <select
              id="assignTeam"
              name="assignTeam"
              value={data.assignTeam || ''}
              onChange={onInputChange}
              className="col-span-3 p-2 border rounded"
            >
              <option value="">Select team</option>
              <option value="team-a">Team A</option>
              <option value="team-b">Team B</option>
              <option value="team-c">Team C</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-left font-bold">Documents</Label>
            <div className="col-span-3">
              {data.documents && data.documents.length > 0 ? (
                <div className="space-y-2">
                  {data.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <Input
                        value={doc.originalName}
                        onChange={(e) => onRenameDocument(index, e.target.value)}
                        className="mr-2 flex-grow"
                      />
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDocument(doc)}
                          className="text-blue-500 hover:text-blue-700 mr-2"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteDocument(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No documents uploaded</p>
              )}
              <div className="mt-2">
                <Input
                  type="file"
                  onChange={onFileUpload}
                  className="hidden"
                  id="add-documents"
                  multiple
                />
                <Label htmlFor="add-documents" className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  <Plus size={16} className="mr-2" />
                  Add Documents
                </Label>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} className="mr-2">Cancel</Button>
          <Button onClick={onSave}>Save changes</Button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;