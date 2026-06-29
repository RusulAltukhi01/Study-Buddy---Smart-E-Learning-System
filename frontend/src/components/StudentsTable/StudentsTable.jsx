import Loader from "../../UI/Loader/Loader";
import StudentsList from "../Studentslist/Studentslist";

const StudentsTable = ({
  displayedStudents,
  loading,
  onDelete,
  onEdit,
}) => {
  if (loading)
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );

  return (
    <StudentsList
      students={displayedStudents}
      onDelete={onDelete}
      onEdit={onEdit}
      showProgress={true}
      showClassrooms={false}
    />
  );
};

export default StudentsTable;