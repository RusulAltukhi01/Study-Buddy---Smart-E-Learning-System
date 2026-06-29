import React, { createContext, useContext, useState, useCallback } from "react";
import useClassroomCreation from "../hooks/useClassroomCreation";
import ClassroomModal from "../components/ClassroomModal/ClassroomModal";


const ClassroomContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useClassroom = () => {
  const context = useContext(ClassroomContext);
  if (!context) {
    throw new Error("useClassroom must be used within ClassroomProvider");
  }
  return context;
};

export const ClassroomProvider = ({ children, onClassroomChange }) => {
    console.log("ClassroomProvider mounted");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const handleSuccess = useCallback(async (data, editedRoom) => {
    setIsModalOpen(false);
    setEditingRoom(null);
    
    
    if (onClassroomChange) {
      await onClassroomChange(data, editedRoom);
    }
  }, [onClassroomChange]);

  const { saveClassroom, loading } = useClassroomCreation({
    onSuccess: handleSuccess,
    onClose: () => {
      setIsModalOpen(false);
      setEditingRoom(null);
    },
    redirectTo: "/instructor/classrooms",
  });

  const openCreateModal = useCallback(() => {
    setEditingRoom(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRoom(null);
  }, []);

  const value = {
    openCreateModal,
    openEditModal,
    closeModal,
    loading,
  };

  return (
    <ClassroomContext.Provider value={value}>
      {children}
      <ClassroomModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingRoom={editingRoom}
        onSave={saveClassroom}
        loading={loading}
      />
    </ClassroomContext.Provider>
  );
};