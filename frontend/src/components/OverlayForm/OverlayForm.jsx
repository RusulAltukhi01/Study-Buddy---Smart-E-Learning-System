import { useState } from "react";
import { DateTimePicker } from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import "./OverlayForm.css";

export const OverlayForm = ({ onClose, onSaveTask, editingTask }) => { 
  const [title, setTitle] = useState(editingTask?.title || "");
  const [description, setDescription] = useState(editingTask?.description || "");
  const [dateTime, setDateTime] = useState(editingTask?.dateTime || new Date());


  const resetForm = () => {
    setTitle(editingTask?.title || "");
    setDescription(editingTask?.description || "");
    setDateTime(editingTask?.dateTime || new Date());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      dateTime: dateTime,
    };


    onSaveTask(taskData);
    resetForm();

  };

  return (
    <form onSubmit={handleSubmit} className="overlay-form w-[80%] min-h-[60vh] flex flex-col justify-between gap-y-10 p-8 rounded-xl">
      <button
        type="button"
        className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer"
        onClick={onClose}
      >
        ✕
      </button>
      

      <h1 className="font-bold text-4xl text-center text-(--dark-navy)">
        {editingTask ? "Edit Task" : "Add New Task"}
      </h1>
      
      <fieldset>
        <label>Title</label>
        <input 
          type="text" 
          name="task-title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter task title"
        />
      </fieldset>
      
      <fieldset>
        <label>Description</label>
        <input 
          type="text" 
          name="task-description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (optional)"
        />
      </fieldset>
      
      <fieldset>
        <label>Date & Time</label>
        <DateTimePicker
          value={dateTime}
          onChange={setDateTime}
          input={true}
          clearIcon={null}
          className="date-picker"
          required
        />
      </fieldset>


      <button 
        type="submit" 
        className="bg-(--bright-violet) text-white py-4 rounded-lg font-bold hover:bg-(--bright-violet-dark) transition-colors cursor-pointer"
      >
        {editingTask ? "Update Task" : "Add Task"}
      </button>
    </form>
  );
};

export default OverlayForm;


