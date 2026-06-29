import { useState } from "react";
import { toast } from "sonner";
import classroomService from "../services/classroomService";
import { useNavigate } from "react-router-dom";

export const useRoomCode = () => {
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const generateCode = (options = {}) => {
    const {
      prefix = "SB",
      length = 8,
      includeTimestamp = false,
      separator = "-",
    } = options;

    let code = "";
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

    if (includeTimestamp) {
      const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
      const random = Array.from({ length: 4 }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      ).join("");

      code = `${prefix}${separator}${timestamp}${separator}${random}`;
    } else {
      const random = Array.from(
        { length: length - prefix.length - 1 },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join("");

      code = `${prefix}${separator}${random}`;
    }

    setGeneratedCode(code);
    return code;
  };

  const copyCode = async (code = generatedCode) => {
    if (!code) {
      toast.error("No code to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied!");

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Failed to copy code");
    }
  };

  return {
    generateCode,
    copied,
    generatedCode,
    copyCode,
    setGeneratedCode
  };
};

const RoomCreator = () => {
  const { generateCode, copied, generatedCode, copyCode, setGeneratedCode } = useRoomCode();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    level: '',
    isPrivate: true,
    settings: {
      allowLateSubmissions: false,
      autoGrade: false,
      showGradesToStudents: false,
      allowStudentDiscussion: false
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      // Handle nested settings
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCreateRoom = async () => {
    
    const code = generatedCode || generateCode({ 
      prefix: 'SB', 
      includeTimestamp: true 
    });

    
    const classroomData = {
      ...formData,
      accessCode: code 
    };

    setIsSubmitting(true);
    try {
      
      const response = await classroomService.createClassroom(classroomData);
      
      toast.success('Classroom created successfully!');
      console.log('Classroom created:', response.data);
      
     
      navigate(`/classrooms/${response.data._id}`);
      
    } catch (error) {
      toast.error(error.message || 'Failed to create classroom');
      console.error('Creation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Classroom</h2>
      
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Room Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

      
        <div className="bg-gray-50 p-4 rounded">
          <label className="block text-sm font-medium mb-2">Access Code</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={generatedCode || 'Click generate to create code'}
                readOnly
                className="w-full p-2 bg-white border rounded font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => generateCode({ prefix: 'SB', includeTimestamp: true })}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Generate
            </button>
            {generatedCode && (
              <button
                type="button"
                onClick={() => copyCode()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
        </div>

       
        <div className="space-y-2">
          <h3 className="font-medium">Settings</h3>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="settings.allowLateSubmissions"
              checked={formData.settings.allowLateSubmissions}
              onChange={handleInputChange}
            />
            <span>Allow late submissions</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="settings.allowStudentDiscussion"
              checked={formData.settings.allowStudentDiscussion}
              onChange={handleInputChange}
            />
            <span>Allow student discussions</span>
          </label>

          <div>
            <label className="block text-sm font-medium mb-1">Max Students</label>
            <input
              type="number"
              name="maxStudents"
              value={formData.maxStudents}
              onChange={handleInputChange}
              min="1"
              max="3000"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

   
        <button
          onClick={handleCreateRoom}
          disabled={isSubmitting || !formData.name || !generatedCode}
          className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Classroom'}
        </button>
      </div>
    </div>
  );
};

export default RoomCreator;