import { useEffect, useState } from "react";
import { Plus, X, BookOpen, FileText, Layers } from "lucide-react";
import CurriculumCard from "../../components/CurriculumCard/CurriculumCard";
import CreateCourseForm from "../../../forms/CreateCourseForm/CreateCourseForm";
import { validateCourseForm } from "../../utils/validateCourseForm";
import courseService from "../../services/courseService";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";


function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-5 bg-gray-100 rounded w-1/3" />
          <div className="h-3.5 bg-gray-100 rounded w-2/3" />
        </div>
        <div className="w-20 h-7 bg-gray-100 rounded-full" />
      </div>
      <div className="flex gap-4">
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-3 bg-gray-100 rounded w-16" />
      </div>
    </div>
  );
}

function EmptyState({ onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)" }}>
        <BookOpen size={32} className="text-white/30" />
      </div>
      <div className="text-center">
        <p className="text-gray-700 font-bold text-base">No curricula yet</p>
        <p className="text-gray-400 text-sm mt-1 max-w-xs">
          Create your first course to start building structured learning content for your students.
        </p>
      </div>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#0d1b2a] transition-opacity hover:opacity-90 cursor-pointer"
        style={{ background: "#5bc0be" }}
      >
        <Plus size={15} /> Create First Course
      </button>
    </div>
  );
}


const Curriculums = () => {
  const [courseForm, setCourseForm]     = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({});
  const [courses, setCourses]           = useState([]);
  const [loading, setLoading]           = useState(true);

  const location = useLocation();
  const [highlightId, setHighlightId]   = useState(location.state?.highlightId || null);

  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => setHighlightId(null), 1000);
    return () => clearTimeout(timer);
  }, [highlightId]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await courseService.getMyCourses();
        setCourses(res.data || []);
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  async function handlePublish(data) {
    const errors = validateCourseForm(data);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      Object.values(errors).forEach((msg) => toast.error(msg));
      return;
    }
    setSubmitting(true);
    setFieldErrors({});
    try {
      const res = await courseService.createCourse({ ...data, status: "active" });
      setCourses((prev) => [res.data, ...prev]);
      setCourseForm(false);
    } catch (err) {
      if (err?.errors) {
        const mapped = {};
        err.errors.forEach(({ field, message }) => { mapped[field] = message; });
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
      const res = await courseService.saveDraft(data);
      setCourses((prev) => [res.data, ...prev]);
      setCourseForm(false);
    } catch (err) {
      if (err?.errors) {
        const mapped = {};
        err.errors.forEach(({ field, message }) => { mapped[field] = message; });
        setFieldErrors(mapped);
      }
    } finally {
      setSubmitting(false);
    }
  }


  const published = courses.filter((c) => c.status === "published" || c.status === "active").length;
  const drafts    = courses.filter((c) => c.status === "draft").length;

  return (
    <>
     
      {courseForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(15,20,40,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setCourseForm(false)}
        >
          <button
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
            onClick={() => setCourseForm(false)}
          >
            <X size={18} />
          </button>
          <div
            className="relative z-10 w-full max-w-2xl mx-4"
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

  
      <div
        className="w-full min-h-screen px-6 py-8"
        style={{ backgroundColor: "var(--primary-background, #f3f4f6)" }}
      >
       
        <div
          className="rounded-2xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#0d1b2a 0%,#1a2e45 100%)" }}
        >
         
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle,#5bc0be 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />
          <div className="absolute left-1/3 bottom-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle,#6c63ff 0%,transparent 70%)", transform: "translateY(50%)" }} />

         
          <div className="relative z-10 flex flex-col gap-3">
            <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full w-fit">
              Content Library
            </span>
            <h1 className="text-white text-2xl font-extrabold italic leading-tight">
              Curricula
            </h1>
            <p className="text-gray-400 text-[13px]">
              Build and manage structured learning content for your students.
            </p>

           
            {!loading && courses.length > 0 && (
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {[
                  { icon: Layers,   label: "Total",     value: courses.length, color: "text-white",       bg: "bg-white/10"          },
                  { icon: BookOpen, label: "Published",  value: published,      color: "text-cyan-400",    bg: "bg-cyan-400/10"       },
                  { icon: FileText, label: "Drafts",     value: drafts,         color: "text-amber-400",   bg: "bg-amber-400/10"      },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl px-4 py-2 flex items-center gap-2`}>
                    <Icon size={13} className={color} />
                    <span className={`text-sm font-bold ${color}`}>{value}</span>
                    <span className="text-gray-500 text-xs">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          
          <button
            onClick={() => setCourseForm(true)}
            className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#0d1b2a] transition-opacity hover:opacity-90 cursor-pointer flex-shrink-0 self-start sm:self-center"
            style={{ background: "#5bc0be" }}
          >
            <Plus size={16} /> Create New Course
          </button>
        </div>

       
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <EmptyState onCreateClick={() => setCourseForm(true)} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {courses.map((course, i) => (
              <CurriculumCard
                key={course._id}
                course={course}
                index={i}
                highlighted={course._id?.toString() === highlightId?.toString()}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Curriculums;