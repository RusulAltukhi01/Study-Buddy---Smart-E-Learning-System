import CreateRoomForm from "../../../forms/CreateRoomForm/CreateRoomForm";

const ClassroomModal = ({ isOpen, onClose, editingRoom, onSave, loading }) => {
  if (!isOpen) return null;

  return (
    <CreateRoomForm
      onClose={onClose}
      editingRoom={editingRoom}
      onSave={onSave}
      isLoading={loading}
    />
  );
};

export default ClassroomModal;