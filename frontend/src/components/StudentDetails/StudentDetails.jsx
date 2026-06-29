  import { getImageUrl } from "../../utils/getImageUrl";
import "./StudentDetails.css";

  const StudentDetails = ({
    student,
    onMessage = () => {},
    onClose = () => {},
    // onViewAll = () => {},
  }) => {
    const {
      firstName,
      lastName,
      email,
      profilePicture,
      lastActive,
      enrollmentDate,
      submissions = [],
    } = student;

    const initials =
      `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
    console.log(student);

    const formatDate = (date) => {
      if (!date) return "—";

      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();

      return `${day}-${month}-${year}`;
    };

    const recentSubmissions = submissions
      .filter((s) => s.status === "graded")
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 2);

    return (
      <div
        className="modal-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="student-details"
          role="dialog"
          aria-modal="true"
          aria-label="Student Details"
        >

          <div className="sd-avatar-wrap">
            {profilePicture ? (
              <img
                src={getImageUrl(profilePicture)}
                alt={`${firstName} ${lastName}`}
                className="sd-avatar"
              />
            ) : (
              <div className="sd-avatar-placeholder">{initials}</div>
            )}
            <span className="sd-online-dot" />
          </div>


          <div className="sd-identity">
            <div className="sd-name">
              {firstName} {lastName}
            </div>
            <div className="sd-email">{email}</div>
          </div>

          <hr className="sd-divider" />

          <div className="sd-section-row">
            <div className="sd-section-label">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Quick Stats
            </div>
          </div>

          <div className="sd-stats-grid">
            <div className="sd-stat-card">
              <div className="sd-stat-value">{formatDate(enrollmentDate)}</div>
              <div className="sd-stat-label">Enrolled At</div>
            </div>
            <div className="sd-stat-card">
              <div className="sd-stat-value">
                {submissions.length}/{submissions.length}
              </div>
              <div className="sd-stat-label">Assignments</div>
            </div>
            <div className="sd-stat-card">
              <div className="sd-stat-value">{formatDate(lastActive)}</div>
              <div className="sd-stat-label">Last Active</div>
            </div>
          </div>

          <hr className="sd-divider" />

          <div className="sd-section-row">
            <div className="sd-section-label">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Recently Submitted
            </div>
            {/* <button className="sd-view-all" onClick={onViewAll}>
              View All
            </button> */}
          </div>

          <div className="sd-assignments">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((item, i) => (
                <div className="sd-assignment-row" key={i}>
                  <div>
                    <div className="sd-assignment-name">
                      {item.assignmentTitle}
                    </div>
                    <div className="sd-assignment-date">
                      Submitted {formatDate(item.submittedAt)}
                    </div>
                  </div>
                  <div className="sd-assignment-score">
                    {item.score}/{item.maxScore}
                  </div>
                </div>
              ))
            ) : (
              <p className="font-semibold text-sm tracking-wider ml-2">No submissions yet</p>
            )}
          </div>


          <div className="sd-actions">
            <button className="sd-btn sd-btn-primary" onClick={onMessage}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <polyline points="22,4 12,13 2,4" />
              </svg>
              Message Student
            </button>
            <button className="sd-btn sd-btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default StudentDetails;
