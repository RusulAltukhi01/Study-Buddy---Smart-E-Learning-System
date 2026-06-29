import { useState } from "react";
import { Edit, Eye, Trash2 } from "lucide-react";
import StudentDetails from "../StudentDetails/StudentDetails";
import "./StudentsList.css";
import { getImageUrl } from "../../utils/getImageUrl";

const avatarColors = [
  "#4F86C6",
  "#E07B54",
  "#5BAD8F",
  "#9B6BB5",
  "#D4A843",
  "#C45B7A",
];

function getInitials(firstName, lastName) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function ProgressBar({ value = 0 }) {
  const pct = value ?? 0;
  let color = "#e5e7eb";
  if (pct >= 75) color = "#1fcfad";
  else if (pct >= 40) color = "#f59e0b";
  else if (pct > 0) color = "#f87171";

  return (
    <div className="sl-progress-wrap">
      <div className="sl-progress-track">
        <div
          className="sl-progress-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="sl-progress-label" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

const StudentsList = ({
  students,
  onDelete = () => {},
  onEdit = () => {},
  showProgress = true,
  showClassrooms = false,
}) => {
  const [selected, setSelected] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleSelectAll = () =>
    setSelected(
      selected.length === students.length ? [] : students.map((s) => s._id),
    );

  function viewStudent(id) {
    const found = students.find((s) => s._id === id);
    setSelectedStudent(found || null);
  }

  

  return (
    <>
      {selectedStudent && (
        <StudentDetails
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      

      {selected.length > 0 && (
        <div className="sl-bulk-bar">
          <span className="sl-bulk-count">{selected.length} selected</span>
          <button
            className="sl-bulk-btn sl-bulk-btn--danger"
            onClick={() => {
              selected.forEach((id) => onDelete(id));
              setSelected([]);
            }}
          >
            <Trash2 size={13} /> Delete Selected
          </button>
          <button className="sl-bulk-btn" onClick={() => setSelected([])}>
            Clear
          </button>
        </div>
      )}

      <div className="sl-table-wrap">
        <table className="sl-table">
          <thead>
            <tr>
              <th className="sl-th-check">
                <input
                  type="checkbox"
                  className="sl-checkbox"
                  checked={
                    students.length > 0 && selected.length === students.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Student</th>
              <th>Email</th>
              {showProgress && <th>Progress</th>}
              <th>Enrolled</th>
              <th>Last Active</th>
              {showClassrooms && <th>Classes</th>}
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {students.length > 0 ? (
              students.map((student, idx) => {
                const fullName = `${student.firstName} ${student.lastName}`;
                const color = getAvatarColor(fullName);
                return (
                  <tr
                    key={student._id}
                    className={`sl-row ${selected.includes(student._id) ? "sl-row--selected" : ""}`}
                    style={{ animationDelay: `${idx * 25}ms` }}
                    onClick={() => viewStudent(student._id)}
                  >
            
                    <td
                      className="sl-td-check"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="sl-checkbox"
                        checked={selected.includes(student._id)}
                        onChange={() => toggleSelect(student._id)}
                      />
                    </td>

                    <td>
                      <div className="sl-name-cell">
                        {student.profilePicture ? (
                          <img
                            src={getImageUrl(student.profilePicture)}
                            alt={fullName}
                            className="sl-avatar"
                          />
                        ) : (
                          <div
                            className="sl-avatar sl-avatar--initials"
                            style={{ background: color }}
                          >
                            {getInitials(student.firstName, student.lastName)}
                          </div>
                        )}
                        <div>
                          <div className="sl-name">{fullName}</div>
                          <div className="sl-name-sub">
                            {student.educationLevel?.replace("_", " ") ||
                              "Student"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="sl-email">{student.email}</span>
                    </td>

                    {showProgress && (
                      <td>
                        <ProgressBar value={student.progress} />
                      </td>
                    )}

                    <td>
                      <span className="sl-date">
                        {formatDate(student.enrolledAt || student.enrollmentDate)}
                      </span>
                    </td>

                    <td>
                      {student.lastActive ? (
                        <div className="sl-active-cell">
                          <span className="sl-active-dot" />
                          <span className="sl-date">
                            {formatDate(student.lastActive)}
                          </span>
                        </div>
                      ) : (
                        <span className="sl-inactive">Never</span>
                      )}
                    </td>

                    {showClassrooms && (
                      <td>
                        <div className="sl-badges">
                          {student.classrooms?.length > 0 ? (
                            student.classrooms.map((cls, i) => (
                              <span
                                key={i}
                                className={`sl-badge sl-badge--${i % 3}`}
                              >
                                {cls}
                              </span>
                            ))
                          ) : (
                            <span className="sl-no-class">—</span>
                          )}
                        </div>
                      </td>
                    )}

                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="sl-actions">
                        <button
                          className="sl-action-btn sl-action-btn--view"
                          title="View"
                          onClick={() => viewStudent(student._id)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="sl-action-btn sl-action-btn--edit"
                          title="Edit"
                          onClick={() => onEdit(student._id)}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="sl-action-btn sl-action-btn--delete"
                          title="Delete"
                          onClick={() => onDelete(student._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="sl-empty">
                  <div className="sl-empty-icon">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <p className="sl-empty-title">No students found</p>
                  <p className="sl-empty-sub">
                    Try adjusting your search criteria
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StudentsList;
