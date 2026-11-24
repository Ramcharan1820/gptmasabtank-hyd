import { useEffect } from "react";
import {
  X,
  UserRound,
  GraduationCap,
  Briefcase,
  BookOpen,
  Mail,
  Award,
  ExternalLink,
  Building2,
  BadgeCheck,
} from "lucide-react";
import "./FacultyProfileModal.css";
import ImageWithFallback from "./ImageWithFallback";

export default function FacultyProfileModal({ faculty, onClose }) {
  useEffect(() => {
    if (!faculty) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [faculty, onClose]);

  if (!faculty) return null;

  const photoUrl = faculty.photo || faculty.image || "";
  const isExternalProfile =
    faculty.profile &&
    typeof faculty.profile === "string" &&
    !faculty.profile.startsWith("mailto:") &&
    faculty.profile !== "#";

  return (
    <div
      className="faculty-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="faculty-modal-title"
    >
      <div
        className="faculty-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="faculty-modal-close"
          onClick={onClose}
          aria-label="Close Profile"
        >
          <X size={20} />
        </button>

        <div className="faculty-modal-header">
          <div className="faculty-modal-photo-wrap">
            <ImageWithFallback
              src={photoUrl}
              alt={faculty.name}
              className="faculty-modal-photo"
              fallback={
                <div className="faculty-modal-photo-placeholder">
                  <UserRound size={48} />
                </div>
              }
            />
            <span className="faculty-modal-badge">
              <BadgeCheck size={14} /> Verified Faculty
            </span>
          </div>

          <div className="faculty-modal-primary-info">
            <span className="faculty-modal-dept-tag">
              <Building2 size={13} /> {faculty.department || "Academic Faculty"}
            </span>

            <h2 id="faculty-modal-title">{faculty.name}</h2>
            <p className="faculty-modal-designation">{faculty.designation}</p>

            {faculty.employeeId && (
              <div className="faculty-modal-empid">
                <span>Employee ID / Faculty Code:</span>
                <strong>{faculty.employeeId}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="faculty-modal-body">
          <div className="faculty-modal-grid">
            {faculty.qualification && (
              <div className="faculty-modal-card">
                <div className="faculty-card-icon">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h4>Educational Qualifications</h4>
                  <p>{faculty.qualification}</p>
                </div>
              </div>
            )}

            {(faculty.experience || faculty.joined) && (
              <div className="faculty-modal-card">
                <div className="faculty-card-icon">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h4>Teaching & Industry Experience</h4>
                  <p>{faculty.experience || faculty.joined}</p>
                </div>
              </div>
            )}

            {faculty.specialization && (
              <div className="faculty-modal-card faculty-card-span-2">
                <div className="faculty-card-icon">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4>Areas of Specialization & Research</h4>
                  <p>{faculty.specialization}</p>
                </div>
              </div>
            )}
          </div>

          {faculty.message && (
            <div className="faculty-modal-message-box">
              <div className="faculty-message-title">
                <Award size={16} /> Faculty Vision & Academic Note
              </div>
              <p>"{faculty.message}"</p>
            </div>
          )}
        </div>

        <div className="faculty-modal-footer">
          {faculty.email && (
            <a
              href={`mailto:${faculty.email}`}
              className="faculty-modal-email-btn"
              title={`Send Email to ${faculty.email}`}
            >
              <Mail size={16} />
              <span>Contact via Email ({faculty.email})</span>
            </a>
          )}

          {isExternalProfile && (
            <a
              href={faculty.profile}
              target="_blank"
              rel="noopener noreferrer"
              className="faculty-modal-external-btn"
            >
              <ExternalLink size={16} />
              <span>Official DTE Profile Sheet</span>
            </a>
          )}

          <button
            type="button"
            className="faculty-modal-dismiss-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

