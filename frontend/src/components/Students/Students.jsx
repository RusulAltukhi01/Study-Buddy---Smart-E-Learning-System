import {
  Calendar,
  Download,
  Filter,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import "./Students.css";
import { useEffect, useMemo, useState, useCallback } from "react";
import StudentsTable from "../StudentsTable/StudentsTable";
import Loader from "../../UI/Loader/Loader";
import { toast } from "sonner";
import classroomService from "../../services/classroomService";
import useExport from "../../hooks/useExport";
import { studentExportColumns } from "../../config/exportColumns";

const Students = ({ classroomId }) => {
  const initialFilters = {
    search: "",
    status: "all",
    sortBy: "name-asc",
  };

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classroomName, setClassroomName] = useState("");
  const [filters, setFilters] = useState(initialFilters);

  const fetchStudents = useCallback(async () => {
    if (!classroomId) return;
    setLoading(true);
    try {
  
      const response = await classroomService.getClassroomStudents(classroomId);

      console.log("API Response:", response);


      let studentsList = [];
      let className = "";

      if (response.data?.students) {
        studentsList = response.data.students;
        className = response.data.classroom?.name || "";
      } else if (response.students) {
        studentsList = response.students;
        className = response.classroom?.name || "";
      } else if (Array.isArray(response.data)) {
        studentsList = response.data;
      } else if (Array.isArray(response)) {
        studentsList = response;
      }

      console.log("Students list:", studentsList);
      console.log("First student data:", studentsList[0]);

      setStudents(studentsList);
      setClassroomName(className);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const displayedStudents = useMemo(() => {
    let filtered = [...students];

    if (filters.search) {
      filtered = filtered.filter((student) => {
        const fullName =
          `${student.firstName || ""} ${student.lastName || ""}`.toLowerCase();
        const email = (student.email || "").toLowerCase();
        const searchTerm = filters.search.toLowerCase();
        return fullName.includes(searchTerm) || email.includes(searchTerm);
      });
    }

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "name-asc":
          return `${a.firstName || ""} ${a.lastName || ""}`.localeCompare(
            `${b.firstName || ""} ${b.lastName || ""}`,
          );
        case "name-desc":
          return `${b.firstName || ""} ${b.lastName || ""}`.localeCompare(
            `${a.firstName || ""} ${a.lastName || ""}`,
          );
        case "date-newest":
          return (
            new Date(b.enrollmentDate || b.createdAt) -
            new Date(a.enrollmentDate || a.createdAt)
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [students, filters]);

  const { exporting, exportToExcel } = useExport(displayedStudents, {
    columns: studentExportColumns,
    filename: `${classroomName || "classroom"}_students_${classroomId}`,
  });

  const handleExportFiltered = () => {
    if (displayedStudents.length === 0) {
      toast.error("No students to export");
      return;
    }
    exportToExcel();
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this student?",
    );
    if (confirmed) {
      setStudents((prev) => prev.filter((s) => s._id !== id));
      toast.success("Student removed successfully!");
    }
  };

  const handleEdit = (id) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === id ? { ...s, name: "Updated Name" } : s)),
    );
  };

  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  }

  return (
    <section className="students w-full flex flex-col justify-center items-center">
      <header className="students-header w-full flex justify-between items-center px-4 mb-6">
        <h1 className="font-bold text-[2em] text-(--dark-navy)">
          Students List
        </h1>
        <div className="list-tools flex justify-between items-center gap-x-3">
          <button className="border-1 rounded-lg border-gray-400 text-gray-600 hover:text-gray-700">
            <Settings /> Settings
          </button>

          <div className="relative group">
            <button
              onClick={handleExportFiltered}
              disabled={exporting}
              className="border-1 border-dashed rounded-lg bg-cyan-50 text-cyan-600 hover:bg-cyan-100 transition-colors px-4 py-2"
            >
              <Download /> {exporting ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
      </header>

      <main className="w-full min-h-screen flex flex-col my-5">
        <nav className="w-full flex justify-end items-center p-4">
          <div className="list-tools flex justify-between items-center gap-x-3">
            <fieldset className="bg-gray-100 border-1 border-gray-200 py-2 px-4 flex justify-between items-center rounded-md">
              <input
                type="search"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search by name"
                className="border-none outline-none"
              />
              <Search color="var(--electric)" />
            </fieldset>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="students-filter w-full border border-gray-200 bg-gray-100 rounded-md py-3 px-8 text-sm text-gray-600 cursor-pointer transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-(--electric-dark) focus:border-(--electric-dark)"
              >
                <option value="name-asc">Student Name: A → Z</option>
                <option value="name-desc">Student Name: Z → A</option>
                <option value="highest-grades">Highest to lowest grades</option>
                <option value="date-newest">Recently joined</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 mx-3 flex items-center text-gray-400">
                <Filter color="var(--electric-dark)" size={18} />
              </div>
            </div>
          </div>
        </nav>

        <div className="students-list w-full h-auto bg-white rounded-lg">
          <StudentsTable
            displayedStudents={displayedStudents}
            loading={loading}
            onDelete={handleDelete}
            onEdit={handleEdit}
            classroomId={classroomId}
          />
        </div>
      </main>
    </section>
  );
};

export default Students;
