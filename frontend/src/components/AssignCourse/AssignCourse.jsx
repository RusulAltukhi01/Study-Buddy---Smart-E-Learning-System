import { useNavigate, useParams } from "react-router-dom";
import "./AssignCourse.css";
import { useState, useEffect } from "react";
import courseService from "../../services/courseService";
import { toast } from "sonner";
import { validateCourseForm } from "../../utils/validateCourseForm";
import CreateCourseForm from "../../../forms/CreateCourseForm/CreateCourseForm";
import { BookOpen, ChevronRight, Loader2, X } from "lucide-react";

const AssignCourse = () => {
  const navigate = useNavigate();
  const { classroomId } = useParams();
  const [courseForm, setCourseForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);


  const [showPicker, setShowPicker] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await courseService.getCoursesByClassroom(classroomId);
        setCourses(res.data);
      } catch {
        toast.error("Failed to load classroom courses");
      } finally {
        setLoadingCourses(false);
      }
    }
    if (classroomId) fetchCourses();
  }, [classroomId]);

  async function handlePublish(data) {
    const errors = validateCourseForm(data);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      Object.values(errors).forEach((message) => toast.error(message));
      return;
    }
    setSubmitting(true);
    setFieldErrors({});
    try {
      const res = await courseService.createCourse({
        ...data,
        classroomId,
        status: "active",
      });
      setCourses((prev) => [...prev, res.data]);
      setCourseForm(false);
    } catch (err) {
      if (err?.errors) {
        const mapped = {};
        err.errors.forEach(({ field, message }) => {
          mapped[field] = message;
        });
        setFieldErrors(mapped);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveDraft(data) {
    setSubmitting(true);
    setFieldErrors({});
    try {
      await courseService.saveDraft({ ...data, classroomId, status: "draft" });
      setCourseForm(false);
    } catch (err) {
      if (err?.errors) {
        const mapped = {};
        err.errors.forEach(({ field, message }) => {
          mapped[field] = message;
        });
        setFieldErrors(mapped);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const handleBrowseLib = async () => {
    setShowPicker(true);
    setLoadingAll(true);
    try {
      const res = await courseService.getMyCourses();
     
      const assignedIds = new Set(courses.map((c) => c._id?.toString()));
      setAllCourses(
        (res.data || []).filter((c) => !assignedIds.has(c._id?.toString())),
      );
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoadingAll(false);
    }
  };
  const handleAssignExisting = async (courseId) => {
    setAssigning(courseId);
    try {
      await courseService.assignCourseToClassroom(classroomId,courseId);
      const res = await courseService.getCoursesByClassroom(classroomId);
      console.log("after assign, courses:", res); 
      setCourses(res.data);
      setShowPicker(false);

    } catch {
      toast.error("Failed to assign course");
    } finally {
      setAssigning(null);
    }
  };

  const handleUnassign = async (courseId) => {
    try {
      await courseService.unassignCourseFromClassroom(classroomId, courseId);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch {
      toast.error("Failed to unassign course");
    }
  };

  return (
    <>
    
      {courseForm && (
        <div className="cf-overlay" onClick={() => setCourseForm(false)}>
          <button
            className="cf-overlay-close"
            onClick={() => setCourseForm(false)}
          >
            <X size={20} />
          </button>
          <div
            className="cf-overlay-content"
            onClick={(e) => e.stopPropagation()}
          >
            <CreateCourseForm
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
              submitting={submitting}
              fieldErrors={fieldErrors}
            />
          </div>
        </div>
      )}

    
      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowPicker(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
          >
           
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-lg text-(--dark-navy)">
                  Assign Existing Course
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Select a course from your library to assign to this classroom
                </p>
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

          
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
              {loadingAll ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
              ) : allCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <BookOpen size={22} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">
                    No available courses
                  </p>
                  <p className="text-xs text-gray-400">
                    All your courses are already assigned, or you haven't
                    created any yet.
                  </p>
                  <button
                    onClick={() => {
                      setShowPicker(false);
                      setCourseForm(true);
                    }}
                    className="mt-2 text-xs font-bold text-(--electric) hover:underline cursor-pointer"
                  >
                    Create a new course instead →
                  </button>
                </div>
              ) : (
                allCourses.map((course) => (
                  <div
                    key={course._id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-(--electric) transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={16} className="text-(--royal-blue)" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-(--dark-navy) truncate">
                          {course.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {course.category}
                          {course.level && ` • ${course.level}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          course.status === "active"
                            ? "bg-green-100 text-green-600"
                            : course.status === "draft"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {course.status === "active"
                          ? "Published"
                          : course.status}
                      </span>
                      <button
                        onClick={() => handleAssignExisting(course._id)}
                        disabled={assigning === course._id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-(--electric) text-white text-xs font-bold cursor-pointer hover:opacity-90 disabled:opacity-50 transition-opacity"
                      >
                        {assigning === course._id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : null}
                        {assigning === course._id ? "Assigning..." : "Assign →"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <section className="assign-course w-full min-h-screen flex flex-col p-3">
        <div className="mb-4">
          <h1 className="text-[2em] font-bold text-(--dark-navy)">
            Classroom Curriculums
          </h1>
          <p className="mt-2 my-1 mx-2 text-sm max-w-md text-gray-400">
            Manage your teaching schedule, assign course materials, and track
            student progress through structured learning paths.
          </p>
        </div>

        {loadingCourses ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Loading courses...</p>
          </div>
        ) : courses.length > 0 ? (
          <div className="flex-1 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course._id}
                  onClick={() =>
                    navigate("/instructor/courses", {
                      state: { highlightId: course._id },
                    })
                  }
                  className="rounded-xl border border-gray-200 shadow-md p-5 bg-white flex flex-col gap-3 cursor-pointer hover:border-(--electric) transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        course.status === "active"
                          ? "bg-green-100 text-green-600"
                          : course.status === "draft"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {course.status === "active" ? "Published" : course.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnassign(course._id);
                      }}
                      className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
                      title="Unassign course"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <BookOpen size={16} className="text-(--royal-blue)" />
                    </div>
                    <h3 className="font-bold text-sm text-(--dark-navy) line-clamp-1">
                      {course.title}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2">
                    {course.description}
                  </p>

                  {course.category && (
                    <span className="text-xs text-gray-400 mt-auto">
                      {course.category}
                    </span>
                  )}
                </div>
              ))}

              
              <button
                onClick={handleBrowseLib}
                className="rounded-xl border-2 border-dashed border-(--electric) flex flex-col items-center justify-center gap-2 text-sm text-(--electric) font-semibold hover:bg-blue-50 transition-colors min-h-[160px] cursor-pointer"
              >
                <BookOpen size={20} />
                Assign Existing
              </button>

              <button
                onClick={() => setCourseForm(true)}
                className="rounded-xl border-2 border-dashed border-(--bright-violet) flex flex-col items-center justify-center gap-2 text-sm text-(--bright-violet) font-semibold hover:bg-purple-50 transition-colors min-h-[160px] cursor-pointer"
              >
                <span className="text-2xl leading-none">+</span>
                Create New
              </button>
            </div>
          </div>
        ) : (
          
          <div className="flex-1 rounded-2xl flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-(--electric) bg-white">
            <div className="w-25 h-25 rounded-full flex items-center justify-center mb-5 bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--royal-blue)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h2 className="text-[1.8em] font-bold mb-2 text-(--dark-navy)">
              No curriculum assigned yet
            </h2>
            <p className="text-sm text-center max-w-xs mb-10 text-gray-400">
              Your classroom currently has no active learning path. Choose one
              of the options below to get started.
            </p>

            <div className="flex gap-4 w-full max-w-2xl min-h-[30vh]">
              
              <div className="flex-1 rounded-xl p-5 flex flex-col gap-3 border-1 border-gray-200 shadow-md w-full h-full">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-(--electric-pastel)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--electric)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </div>
                <div>
                  <p
                    className="font-bold text-sm mb-1"
                    style={{ color: "#1e293b" }}
                  >
                    Assign Existing
                  </p>
                  <p className="text-xs leading-relaxed text-gray-400 px-1">
                    Select from courses you've already created in your library.
                  </p>
                </div>
                <button
                  onClick={handleBrowseLib}
                  className="text-xs font-semibold flex items-center gap-1 mt-1 w-fit text-(--electric) px-3 py-2 rounded-full cursor-pointer hover:bg-gray-100"
                >
                  Browse Library
                  <ChevronRight size={13} />
                </button>
              </div>

            
              <div className="flex-1 rounded-xl p-5 flex flex-col gap-3 border-1 border-gray-200 shadow-md w-full h-full">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-(--violete-pastel)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--bright-violet)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                </div>
                <div>
                  <p
                    className="font-bold text-sm mb-1"
                    style={{ color: "#1e293b" }}
                  >
                    Create New
                  </p>
                  <p className="text-xs leading-relaxed text-gray-400 px-1">
                    Build a custom learning path from scratch for this class.
                  </p>
                </div>
                <button
                  onClick={() => setCourseForm(true)}
                  className="text-xs font-semibold flex items-center gap-1 mt-1 w-fit text-(--bright-violet) cursor-pointer px-3 py-2 rounded-full hover:bg-gray-100"
                >
                  Create Course
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default AssignCourse;
