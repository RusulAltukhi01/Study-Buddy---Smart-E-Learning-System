import { CirclePlus } from "lucide-react";
import "./Todo.css";
import { useState } from "react";
import TaskItem from "../TaskItem/TaskItem";
import OverlayForm from "../OverlayForm/OverlayForm";

const Todo = ({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskComplete,
  onClearAllTasks,
}) => {
  const [activeTab, setActiveTab] = useState("all-tasks");
  // const [tasks, setTasks] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const getFilteredTasks = () => {
    switch (activeTab) {
      case "completed":
        return tasks.filter((task) => task.status === "completed");
      case "to-do":
        return tasks.filter((task) => task.status === "incomplete");
      case "submitted":
        return tasks.filter((task) => task.status === "submitted");
      default:
        return tasks;
    }
  };

  const handleActiveTab = (tabName) => {
    setActiveTab(tabName);
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      const updatedTask = {
        ...editingTask,
        title: taskData.title,
        description: taskData.description,
        dateTime: taskData.dateTime,
        date: taskData.dateTime.toISOString().split("T")[0],
        time: taskData.dateTime
          .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .toUpperCase(),
      };

      // if (onEditTask) {
      //   onEditTask(updatedTask.id, updatedTask);
      // } else {
      //   setTasks(
      //     tasks.map((task) =>
      //       task.id === updatedTask.id ? updatedTask : task
      //     )
      //   );
      // }
      onEditTask(updatedTask.id, updatedTask);
      setEditingTask(null);
    } else {
      const timeString = taskData.dateTime
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .toUpperCase();

      const newTask = {
        id: Date.now(),
        time: timeString,
        title: taskData.title,
        description: taskData.description,
        status: "incomplete",
        date: taskData.dateTime.toISOString().split("T")[0],
        dateTime: taskData.dateTime,
      };

      // if (onAddTask) {
      //   onAddTask(newTask);
      // } else {
      //   setTasks([...tasks, newTask]);
      // }

      onAddTask(newTask);
    }

    setOpenPopup(false);
  };

  const handleEditTask = (taskId) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (taskToEdit) {
      setEditingTask(taskToEdit);
      setOpenPopup(true);
    }

    // if (onEditTask) {
    //   onEditTask(taskId);
    // }
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId) => {
    onDeleteTask(taskId);
    // if (onDeleteTask) {
    // } else {
    //   setTasks(tasks.filter((task) => task.id !== taskId));
    // }
  };

  const handleToggleComplete = (taskId) => {
    onToggleTaskComplete(taskId);
    // if (onToggleTaskComplete) {
    // } else {
    //   setTasks(
    //     tasks.map((task) =>
    //       task.id === taskId
    //         ? {
    //             ...task,
    //             status:
    //               task.status === "completed" ? "incomplete" : "completed",
    //           }
    //         : task
    //     )
    //   );
    // }
  };

  const handleClearAll = () => {
    if (onClearAllTasks) {
      onClearAllTasks();
    }
  };

  return (
    <div className="todo w-full h-full flex flex-col justify-between items-center">
      <header className="todo-header w-full h-[10vh] p-5 my- flex justify-between items-center">
        <h1 className="font-bold text-4xl px-4 text-(--dark-navy)">Tasks</h1>

        <ul className="tasks-btns  p-4 flex justify-center items-center gap-x-4 ">
          <li
            title="Add new task"
            onClick={() => setOpenPopup(true)}
            className="rounded-lg p-3 bg-[var(--electric)] cursor-pointer border-1 border-cyan-100 cursor-pointer"
          >
            <CirclePlus color="white" />
          </li>
          <li title="Delete all tasks">
            <button
              onClick={handleClearAll}
              className="bg-[var(--electric)] px-4 py-3 rounded-lg text-white font-bold border-1 border-cyan-100 cursor-pointer"
            >
              Clear All
            </button>
          </li>
        </ul>
      </header>

      <nav className="todo-tabs w-full h-auto flex items-center 0">
        <ul className="w-full flex items-center gap-x-15 px-8 py-5 font-semibold">
          <li
            name="all-tasks"
            onClick={() => handleActiveTab("all-tasks")}
            className={activeTab === "all-tasks" ? "active" : ""}
          >
            All tasks
          </li>
          <li
            name="to-do"
            onClick={() => handleActiveTab("to-do")}
            className={activeTab === "to-do" ? "active" : ""}
          >
            To do
          </li>
          <li
            name="completed"
            onClick={() => handleActiveTab("completed")}
            className={activeTab === "completed" ? "active" : ""}
          >
            Completed
          </li>
        </ul>
      </nav>

      {openPopup && (
        <div className="overlay-backdrop" onClick={handleClosePopup}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full flex justify-center items-center"
          >
            <OverlayForm
              onClose={handleClosePopup}
              onSaveTask={handleSaveTask}
              editingTask={editingTask}
            />
          </div>
        </div>
      )}

      <div className="tasks-container w-full h- overflow-y-scroll p-2 m-2 md:p-4 md:m-4 font-semibold w-full flex flex-col h-full gap-3 md:gap-y-5 items-center">
        <div className="tasks-list flex-1   w-full flex flex-col gap-y-10 items-center">
          {getFilteredTasks().length > 0 ? (
            getFilteredTasks().map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={() => handleEditTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
                onToggleComplete={() => handleToggleComplete(task.id)}
              />
            ))
          ) : (
            <div className="empty-state w-full h-full flex justify-center items-center">
              {activeTab === "all-tasks" && tasks.length === 0 ? (
                <h1 className="text-[2rem] text-[var(--electric)]">
                  No tasks found. Add a new task to get started!
                </h1>
              ) : activeTab === "completed" &&
                tasks.filter((task) => task.status === "completed").length ===
                  0 ? (
                <h1 className="text-[2rem] text-[var(--electric)]">
                  No tasks completed. Complete some tasks first!
                </h1>
              ) : activeTab === "to-do" &&
                tasks.filter((task) => task.status === "incomplete").length ===
                  0 ? (
                <h1 className="text-[2rem] text-[var(--electric)]">
                  No tasks to do. All tasks are completed or submitted!
                </h1>
              ) : activeTab === "submitted" &&
                tasks.filter((task) => task.status === "submitted").length ===
                  0 ? (
                <h1 className="text-[2rem] text-[var(--electric)]">
                  No submitted tasks yet.
                </h1>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Todo;
