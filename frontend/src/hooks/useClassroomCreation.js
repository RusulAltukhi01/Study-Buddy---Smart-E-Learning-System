import { useState } from "react";
import { toast } from "sonner";
import classroomService from "../services/classroomService";
import { useNavigate } from "react-router-dom";

const useClassroomCreation = (options = {}) => {
  const { onSuccess, onClose, redirectTo = "/instructor/classrooms" } = options;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const saveClassroom = async (roomData, editingRoom = null) => {
    if (!roomData.name?.trim()) {
      toast.error("Please enter a room name");
      return false;
    }

    setLoading(true);

    try {
      let response;

      if (editingRoom) {
        response = await classroomService.updateClassroom(
          editingRoom._id,
          roomData
        );
        toast.success("Classroom updated successfully!");
      } else {
        response = await classroomService.createClassroom(roomData);
        toast.success("Classroom created successfully!");
        
        
        if (response?.data?.accessCode) {
          toast.info(`Access Code: ${response.data.accessCode}`, {
            duration: 8000,
            action: {
              label: "Copy",
              onClick: () => navigator.clipboard.writeText(response.data.accessCode),
            },
          });
        }
      }

      
      if (onSuccess) {
        await onSuccess(response.data, editingRoom);
      }

      
      if (onClose) {
        onClose();
      }

    
      if (response?.data?._id && redirectTo) {
        navigate(`${redirectTo}/${response.data._id}`);
      }

      return response.data;
    } catch (error) {
      console.error("Failed to save classroom:", error);
      toast.error(error.error || "Failed to save classroom");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveClassroom,
    loading,
  };
};

export default useClassroomCreation;