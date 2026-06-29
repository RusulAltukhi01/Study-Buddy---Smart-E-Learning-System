import { useParams, useNavigate } from "react-router-dom";
import "./InstructorPage.css";
import { useEffect, useState } from "react";
import userService from "../../services/userService";
import Loader from "../../UI/Loader/Loader";
import classroomService from "../../services/classroomService";
import MyClassroomCard from "../../components/MyClassroomCard/MyClassroomCard";
import { toast } from "sonner";

const InstructorPage = () => {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [instructorLoading, setInstructorLoading] = useState(true);
  const [classroomsLoading, setClassroomsLoading] = useState(true);
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        setInstructorLoading(true);

        const response = await userService.getInstructorById(instructorId);

        if (response.data) {
          setInstructor(response.data);
        } else {
          setInstructor(response);
        }
      } catch (err) {
        console.error("Error fetching instructor:", err);

        if (err.response?.status === 401) {
          toast.error("Please log in to view instructor profiles");
        } else if (err.response?.status === 404) {
          toast.error("Instructor not found");
        } else {
          toast.error(
            "Failed to load instructor information. Please try again later.",
          );
        }
      } finally {
        setInstructorLoading(false);
      }
    };

    if (instructorId) {
      fetchInstructor();
    }
  }, [instructorId]);

  useEffect(() => {
    const fetchClassrooms = async () => {
      if (!instructorId) return;

      try {
        setClassroomsLoading(true);

        const response = await classroomService.getMyClassrooms({
          instructor: instructorId,
        });

        let classroomsData = [];
        if (Array.isArray(response.data)) {
          classroomsData = response.data;
        } else if (response.data?.enrolled) {
          classroomsData = response.data.enrolled;
        }
        setClassrooms(classroomsData);
      } catch (err) {
        console.error("Error fetching classrooms:", err);
      } finally {
        setClassroomsLoading(false);
      }
    };

    if (instructorId) {
      fetchClassrooms();
    }
  }, [instructorId]);

  const navigateToClassroom = (classroomID) => {
    navigate(`/student/classrooms/${classroomID}`);
  };

  if (instructorLoading || classroomsLoading) {
    return (
      <div className="instructor-page w-full min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="instructor-page w-full min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No instructor data available</p>
      </div>
    );
  }

  return (
    <div className="instructor-page w-full min-h-screen flex flex-col items-center p-6">
      <header className="flex gap-x-6  w-full bg-white rounded-lg shadow-md p-8 border boder-1 border-gray-200">
        <div className="instructor-avatar w-[180px] h-[180px] border-2 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
          {instructor.profilePicture ? (
            <img
              src={instructor.profilePicture}
              alt={`${instructor.firstName || ""} ${instructor.lastName || ""}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl text-gray-400">
              {instructor.firstName?.charAt(0) || ""}
              {instructor.lastName?.charAt(0) || ""}
            </span>
          )}
        </div>

        <nav className="instructor-info flex-1 flex  justify-between items-center">
          <div className="instructor-titles flex-1 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {instructor.firstName || ""} {instructor.lastName || ""}
            </h1>
            <h3 className="text-xl text-gray-600 mb-4">
              {instructor.headline || "Instructor"}
            </h3>
            <p className="text-gray-700">{instructor.bio || ""}</p>
          </div>

          <div className="instructor-nav-btns">
            <button className="bg-(--electric) text-white px-6 py-5 rounded-lg border border-1 border-teal-200 font-semibold tracking-wider cursor-pointer hover:bg-white hover:text-(--electric) hover:border-(--electric)">
              Message Instructor
            </button>
          </div>
        </nav>
      </header>

      <section className="instructor-section-content w-full min-h-screen m-4 flex">
        <main className="instructor-profile-main  flex flex-col">
          <div className="about-instructor flex flex-col gap-y-3 p-5 bg-white rounded-xl border border-1 border-gray-200 py-10 max-h-screen">
            <div className="about-titles p-2 gap-y-3 flex-1">
              <h1 className="font-bold text-[2em] text-(--dark-navy) py-4">
                About
              </h1>
              <h3 className="font-semibold text-gray-400 tracking-[3px]">
                Bio
              </h3>
              <p className="w-[95%] text-gray-700">
                Dr. James Wellington is a renowned computer scientist with over
                18 years of experience in artificial intelligence and software
                engineering. He leads the AI Research Lab at the Institute of
                Technology and has published over 45 peer-reviewed papers on
                machine learning, neural networks, and human-computer
                interaction. His groundbreaking work on explainable AI has been
                cited by researchers worldwide and implemented in production
                systems by major tech companies. Dr. Wellington is also the
                author of 'Practical Deep Learning' and 'The Ethical Algorithm',
                both bestsellers in the tech education space. He's known for
                making complex topics accessible and engaging for students of
                all levels.
              </p>
            </div>

            <div className="about-privileges flex w-full mt-10 ">
              <div className="education-section flex flex-col flex-1">
                <h2 className="uppercase text-gray-400 font-semibold text-sm tracking-wider mb-4">
                  EDUCATION
                </h2>
                <div className="flex flex-col gap-y-4">
                  {instructor?.qualifications &&
                  instructor.qualifications.length > 0 ? (
                    instructor.qualifications.map((edu, index) => (
                      <div key={index} className="education-item">
                        <h3 className="qualification-degree font-bold text-gray-800 text-lg">
                          {edu.degree}
                        </h3>
                        <p className="text-gray-600 ml-5">
                          {edu.institution} • {edu.year}
                        </p>
                        {edu.description && (
                          <p className="text-gray-500 text-sm mt-1">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    // Default/fake data for testing
                    <>
                      <div className="education-item">
                        <h3 className="qualification-degree font-bold text-gray-800 text-lg ">
                          Ph.D. in Computer Science
                        </h3>
                        <p className="text-gray-600 ml-5">MIT • 2012</p>
                      </div>
                      <div className="education-item">
                        <h3 className="qualification-degree  font-bold text-gray-800 text-lg ">
                          M.Sc. in Software Engineering
                        </h3>
                        <p className="text-gray-600 ml-5">
                          University of Oxford • 2008
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="expertise-section flex flex-col flex-1">
                <h2 className="uppercase text-gray-400 font-semibold text-sm tracking-wider mb-4">
                  EXPERTISE
                </h2>
                <div className="flex flex-wrap gap-2">
                  {instructor?.expertise && instructor.expertise.length > 0 ? (
                    instructor.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    // Default/fake data for testing
                    <>
                      <span className="expertise-badge">React & Next.js</span>
                      <span className="expertise-badge">Python AI</span>
                      <span className="expertise-badge">UI/UX Design</span>
                      <span className="expertise-badge">
                        Cloud Architecture
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="shared-resources w-full flex flex-col gap-y-4 my-6 p-4">
            <h1 className="capitalize font-bold text-[1.8em] text-(--dark-navy)">
              Shared course materials & top resources
            </h1>
            <div className="materials-card w-[280px] h-[280px] bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4 bg-amber-200 w-fit px-4 py-2 rounded-lg">
                  <span className="text-gray-700">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="text-xs font-semibold text-gray-500 tracking-wider">
                    VIDEO
                  </span>
                </div>

                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  Advanced AI Ethics Video
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  A 45-minute deep dive into the ethical implications of LLM
                  deployment.
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-gray-400 cursor-pointer">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM7 12H12V17H7V12Z"
                        fill="currentColor"
                      />
                    </svg>
                    Published: Mar 15, 2024
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="classrooms-container px-6 py-12 w-full flex flex-col">
            <h1 className="font-bold text-[2em] text-(--dark-navy) pb-4">Enrolled Classes with Dr.{instructor.firstName}</h1>
            <ul className="flex w-full items-center">
              {classrooms.length > 0 ? (
                classrooms.map((classroom) => (
                  <MyClassroomCard
                    key={classroom._id}
                    classId={classroom._id}
                    classroomName={classroom.name}
                    classInstructor={classroom.instructor}
                    onClick={() => navigateToClassroom(classroom._id)}
                  />
                ))
              ) : (
                <h1>No classrooms yet. Start or enroll in one!</h1>
              )}
            </ul>
          </div>
        </main>
        <aside>sdfjkjs</aside>
      </section>
    </div>
  );
};

export default InstructorPage;
