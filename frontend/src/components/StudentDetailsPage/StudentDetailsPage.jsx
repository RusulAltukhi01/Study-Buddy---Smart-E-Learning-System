import { useParams } from "react-router-dom";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import "./StudentDetailsPage.css";
import classroomService from "../../services/classroomService";
import { useEffect, useState } from "react";

const StudentDetailsPage = () => {
  const { classroomId, studentId } = useParams();

  const [classroom, setClassroom] = useState(null);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await classroomService.getClassroomById(classroomId);
        const classroomData = response.data || response;

        setClassroom(classroomData);

        const foundStudent = classroomData.students.find(
          (s) => s.id === studentId,
        );

        setStudent(foundStudent);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [classroomId, studentId]);

  return (
    <div className="student-details-page w-full min-h-screen flex flex-col justify-between pt-15 px-5">
      <Breadcrumb
        dynamicData={{
          classroomName: classroom?.name,
          studentName: student?.name,
        }}
      />
    </div>
  );
};

export default StudentDetailsPage;
