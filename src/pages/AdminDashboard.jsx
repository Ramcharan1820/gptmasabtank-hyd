import React, { useEffect, useState, useCallback } from "react";

import {
  LayoutDashboard,
  Bell,
  CalendarDays,
  Users,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Building2,
  Plus,
  Pencil,
  Trash2,
  Search,
  Save,
  Eye,
  XCircle,
  Images,
  Contact,
  Image as ImageIcon,
  BriefcaseBusiness,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import AdminImageField from "../components/AdminImageField";
import "./AdminDashboard.css";

const API_BASE = `${
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000"
}/api`;

const initialNotice = {
  title: "",
  description: "",
  notice_date: "",
};

const initialEvent = {
  title: "",
  description: "",
  event_date: "",
  category: "",
  image: "",
  image_public_id: "",
  is_active: true,
};

const initialDepartment = {
  department_name: "",
  department_code: "",
  description: "",
  hod_name: "",
  intake: "",
  image: "",
  image_public_id: "",
  is_active: true,
};

const managedContentFields = {
  Faculty: [
    { name: "faculty_code", label: "Faculty ID" },
    { name: "name", label: "Full name", required: true },
    { name: "designation", label: "Designation", required: true },
    { name: "department", label: "Department", required: true },
    { name: "qualification", label: "Qualification" },
    { name: "experience", label: "Experience" },
    { name: "specialization", label: "Specialization", type: "textarea" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "photo", label: "Faculty photo", type: "image", publicIdField: "photo_public_id" },
    { name: "message", label: "Leadership message", type: "textarea", leadershipOnly: true },
    { name: "is_leadership", label: "Show in principal spotlight", type: "checkbox" },
  ],
  Placements: [
    {
      name: "kind",
      label: "Placement item type",
      type: "select",
      options: [
        ["feature", "Training & placement feature"],
        ["recruiter", "Recruiter / company"],
        ["student", "Placed student"],
      ],
      required: true,
    },
    { name: "title", label: "Feature / company title", required: true },
    { name: "description", label: "Description / role", type: "textarea" },
    { name: "name", label: "Student name", studentOnly: true, required: true },
    { name: "branch", label: "Department / branch", studentOnly: true },
    { name: "company", label: "Hiring company", studentOnly: true },
    { name: "package", label: "Package / placement details", studentOnly: true },
    { name: "photo", label: "Student photo", type: "image", publicIdField: "photo_public_id", studentOnly: true },
  ],
  Gallery: [
    { name: "title", label: "Image title", required: true },
    { name: "category", label: "Category", required: true },
    { name: "image", label: "Gallery image", type: "image", publicIdField: "image_public_id", required: true },
    { name: "description", label: "Caption", type: "textarea" },
  ],
  Contact: [
    { name: "address", label: "College address", type: "textarea", required: true },
    { name: "phone", label: "Phone number", type: "tel" },
    { name: "email", label: "Email address", type: "email" },
    { name: "working_hours", label: "Working hours", type: "textarea" },
    { name: "location_title", label: "Location title" },
    { name: "location", label: "Location description", type: "textarea" },
    { name: "map_url", label: "Google Maps link", type: "url" },
    { name: "map_embed_url", label: "Map embed URL", type: "url" },
    { name: "road_info", label: "Travel information: road", type: "textarea" },
    { name: "train_info", label: "Travel information: train", type: "textarea" },
    { name: "air_info", label: "Travel information: air", type: "textarea" },
    { name: "landmark_info", label: "Nearby landmark", type: "textarea" },
  ],
};

const emptyManagedForm = (section) => {
  const form = {};
  for (const field of managedContentFields[section] || []) {
    if (field.type !== "checkbox" && field.type !== "select") {
      form[field.name] = "";
    }
    if (field.publicIdField) form[field.publicIdField] = "";
  }
  form.kind = section === "Placements" ? "feature" : "";
  form.is_leadership = false;
  return form;
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [activeSection, setActiveSection] = useState("Dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [managedContent, setManagedContent] = useState({
    Faculty: [],
    Placements: [],
    Gallery: [],
    Contact: [],
  });

  const [search, setSearch] = useState("");

  const [noticeForm, setNoticeForm] = useState(initialNotice);
  const [eventForm, setEventForm] = useState(initialEvent);
  const [departmentForm, setDepartmentForm] = useState(initialDepartment);
  const [managedForm, setManagedForm] = useState(emptyManagedForm("Faculty"));
  const [managedSortOrder, setManagedSortOrder] = useState("0");

  const [editingId, setEditingId] = useState(null);

  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showManagedForm, setShowManagedForm] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Notices",
      icon: Bell,
    },
    {
      name: "Events",
      icon: CalendarDays,
    },
    {
      name: "Departments",
      icon: Building2,
    },
    {
      name: "Alumni",
      icon: Users,
    },
    { name: "Faculty", icon: UserRound },
    { name: "Placements", icon: BriefcaseBusiness },
    { name: "Gallery", icon: ImageIcon },
    { name: "Contact", icon: Contact },
  ];

  const adminSectionTabs = [
    "Dashboard",
    "Notices",
    "Events",
    "Departments",
    "Faculty",
    "Placements",
    "Gallery",
    "Contact",
    "Alumni",
  ];

  const dashboardHomeNav = [
    "Home",
    "About",
    "Departments",
    "Faculty",
    "Placements",
    "Events",
    "Gallery",
    "Contact",
    "Alumni",
    "Student Portal",
    "Admin Login",
  ];

  // ==================================================
  // COMMON API FUNCTION
  // ==================================================

  const apiRequest = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get("content-type") || "";

    let result = {};

    if (contentType.includes("application/json")) {
      result = await response.json();
    }

    if (!response.ok) {
      throw new Error(
        result.message || `Request failed (${response.status})`
      );
    }

    return result;
  };

  // ==================================================
  // ADMIN SESSION VERIFICATION
  // ==================================================

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await apiRequest("/admin/me");

        if (!response.authenticated) {
          navigate("/admin/login", { replace: true });
          return;
        }

        setAdmin(response.admin);
      } catch (error) {
        navigate("/admin/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  // ==================================================
  // FETCH ALL DATA
  // ==================================================

  const fetchAllData = useCallback(async () => {
    setError("");

    try {
      const [
        noticeResult,
        eventResult,
        departmentResult,
        alumniResult,
      ] = await Promise.all([
        apiRequest("/notices"),
        apiRequest("/admin/events"),
        apiRequest("/departments"),
        apiRequest("/alumni"),
      ]);

      setNotices(noticeResult.data || []);
      setEvents(eventResult.data || []);
      setDepartments(departmentResult.departments || []);
      setAlumni(alumniResult.data || []);

      const managedSections = ["Faculty", "Placements", "Gallery", "Contact"];
      const managedResults = await Promise.all(
        managedSections.map((section) =>
          apiRequest(`/admin/content/${section.toLowerCase()}`)
        )
      );
      setManagedContent(
        Object.fromEntries(
          managedSections.map((section, index) => [
            section,
            managedResults[index].data || [],
          ])
        )
      );
    } catch (error) {
      setError(error.message || "Unable to load dashboard data.");
    }
  }, []);

  useEffect(() => {
    if (admin) {
      fetchAllData();
    }
  }, [admin, fetchAllData]);

  // ==================================================
  // NOTICES MANAGEMENT
  // ==================================================

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();

    if (!noticeForm.title.trim()) {
      setError("Please enter a notice title.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = editingId
        ? `/notices/${editingId}`
        : "/notices";

      await apiRequest(endpoint, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(noticeForm),
      });

      setSuccess(
        editingId
          ? "Notice updated successfully."
          : "Notice added successfully."
      );

      setNoticeForm(initialNotice);
      setEditingId(null);
      setShowNoticeForm(false);

      await fetchAllData();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const editNotice = (notice) => {
    setNoticeForm({
      title: notice.title || "",
      description: notice.description || "",
      notice_date: notice.notice_date
        ? String(notice.notice_date).slice(0, 10)
        : "",
    });

    setEditingId(notice.id);
    setShowNoticeForm(true);
    setError("");
    setSuccess("");
  };

  const deleteNotice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) {
      return;
    }

    try {
      await apiRequest(`/notices/${id}`, {
        method: "DELETE",
      });

      setSuccess("Notice deleted successfully.");
      await fetchAllData();
    } catch (error) {
      setError(error.message);
    }
  };

  // ==================================================
  // EVENTS MANAGEMENT
  // ==================================================

  const handleEventSubmit = async (e) => {
    e.preventDefault();

    if (!eventForm.title.trim() || !eventForm.event_date) {
      setError("Event title and date are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = editingId
        ? `/admin/events/${editingId}`
        : "/admin/events";

      await apiRequest(endpoint, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(eventForm),
      });

      setSuccess(
        editingId
          ? "Event updated successfully."
          : "Event added successfully."
      );

      setEventForm(initialEvent);
      setEditingId(null);
      setShowEventForm(false);

      await fetchAllData();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const editEvent = (event) => {
    setEventForm({
      title: event.title || "",
      description: event.description || "",
      event_date: event.event_date
        ? String(event.event_date).slice(0, 10)
        : "",
      category: event.category || "",
      image: event.image || "",
      image_public_id: event.image_public_id || "",
      is_active: Boolean(event.is_active),
    });

    setEditingId(event.id);
    setShowEventForm(true);
    setError("");
    setSuccess("");
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await apiRequest(`/admin/events/${id}`, {
        method: "DELETE",
      });

      setSuccess("Event deleted successfully.");
      await fetchAllData();
    } catch (error) {
      setError(error.message);
    }
  };

  // ==================================================
  // DEPARTMENTS MANAGEMENT
  // ==================================================

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();

    if (
      !departmentForm.department_name.trim() ||
      !departmentForm.department_code.trim()
    ) {
      setError("Department name and code are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = editingId
        ? `/departments/${editingId}`
        : "/departments";

      await apiRequest(endpoint, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(departmentForm),
      });

      setSuccess(
        editingId
          ? "Department updated successfully."
          : "Department added successfully."
      );

      setDepartmentForm(initialDepartment);
      setEditingId(null);
      setShowDepartmentForm(false);

      await fetchAllData();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const editDepartment = (department) => {
    setDepartmentForm({
      department_name: department.department_name || "",
      department_code: department.department_code || "",
      description: department.description || "",
      hod_name: department.hod_name || "",
      intake: department.intake || "",
      image: department.image || "",
      image_public_id: department.image_public_id || "",
      is_active: Boolean(department.is_active),
    });

    setEditingId(department.id);
    setShowDepartmentForm(true);
    setError("");
    setSuccess("");
  };

  const deleteDepartment = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this department?"
      )
    ) {
      return;
    }

    try {
      await apiRequest(`/departments/${id}`, {
        method: "DELETE",
      });

      setSuccess("Department deleted successfully.");
      await fetchAllData();
    } catch (error) {
      setError(error.message);
    }
  };

  // ==================================================
  // FACULTY, PLACEMENTS, GALLERY AND CONTACT CONTENT
  // ==================================================

  const managedFields = managedContentFields[activeSection] || [];

  const startManagedCreate = () => {
    setManagedForm(emptyManagedForm(activeSection));
    setManagedSortOrder("0");
    setEditingId(null);
    setShowManagedForm(true);
    setError("");
    setSuccess("");
  };

  const startManagedEdit = (item) => {
    const form = emptyManagedForm(activeSection);
    for (const field of managedFields) {
      if (field.type === "checkbox" || field.type === "select") {
        form[field.name] = item[field.name] ?? form[field.name];
      } else {
        form[field.name] = item[field.name] ?? "";
      }
      if (field.publicIdField) {
        form[field.publicIdField] = item[field.publicIdField] ?? "";
      }
    }
    form.is_active = Boolean(item.is_active);

    setManagedForm(form);
    setManagedSortOrder(String(item.sort_order ?? 0));
    setEditingId(item.id);
    setShowManagedForm(true);
    setError("");
    setSuccess("");
  };

  const handleManagedSubmit = async (event) => {
    event.preventDefault();

    const requiredFields = managedFields.filter((field) => {
      if (!field.required) return false;
      if (field.studentOnly && managedForm.kind !== "student") return false;
      if (
        field.name === "title" &&
        activeSection === "Placements" &&
        managedForm.kind === "student"
      ) {
        return false;
      }
      return true;
    });
    const missingField = requiredFields.find(
      (field) => !String(managedForm[field.name] || "").trim()
    );
    if (missingField) {
      setError(`${missingField.label} is required.`);
      return;
    }

    const type = activeSection.toLowerCase();
    const endpoint = editingId
      ? `/admin/content/${type}/${editingId}`
      : `/admin/content/${type}`;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest(endpoint, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({
          payload: managedForm,
          is_active: managedForm.is_active !== false,
          sort_order: Number(managedSortOrder),
        }),
      });

      setSuccess(
        `${activeSection} ${editingId ? "updated" : "created"} successfully.`
      );
      setShowManagedForm(false);
      setEditingId(null);
      await fetchAllData();
    } catch (error) {
      setError(error.message || `Unable to save ${activeSection.toLowerCase()} content.`);
    } finally {
      setSaving(false);
    }
  };

  const deleteManagedContent = async (item) => {
    if (!window.confirm(`Delete "${item.title || item.name || activeSection}"?`)) {
      return;
    }

    try {
      await apiRequest(
        `/admin/content/${activeSection.toLowerCase()}/${item.id}`,
        { method: "DELETE" }
      );
      setSuccess(`${activeSection} item deleted successfully.`);
      await fetchAllData();
    } catch (error) {
      setError(error.message || `Unable to delete ${activeSection.toLowerCase()} content.`);
    }
  };

  const renderManagedContent = () => {
    const items = managedContent[activeSection] || [];
    const canCreate = activeSection !== "Contact" || items.length === 0;

    return (
      <>
        {sectionHeader(
          `${activeSection} Management`,
          `Create, update, publish, and organize ${activeSection.toLowerCase()} on the public website.`,
          canCreate
            ? ({
                Faculty: "Add Faculty Member",
                Placements: "Add Placement Item",
                Gallery: "Add Gallery Image",
                Contact: "Add Contact Details",
              }[activeSection])
            : null,
          startManagedCreate
        )}

        {activeSection === "Contact" && items.length === 0 && (
          <div className="admin-content-hint">
            Add the official address, phone, email, map and travel information here. The public contact page updates automatically after publishing.
          </div>
        )}

        {showManagedForm && (
          <form className="admin-form-card" onSubmit={handleManagedSubmit}>
            <div className="admin-form-title">
              <h3>{editingId ? `Edit ${activeSection}` : `Add ${activeSection}`}</h3>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setShowManagedForm(false)}
                aria-label="Close form"
              >
                <X />
              </button>
            </div>

            <div className="admin-form-grid">
              {managedFields
                .filter((field) => {
                  if (field.leadershipOnly && !managedForm.is_leadership) return false;
                  if (field.studentOnly && managedForm.kind !== "student") return false;
                  if (field.name === "title" && activeSection === "Placements" && managedForm.kind === "student") return false;
                  return true;
                })
                .map((field) => field.type === "image" ? (
                  <div className="admin-image-form-field" key={field.name}>
                    <span>{field.label}{field.required ? " *" : ""}</span>
                    <AdminImageField
                      contentType={activeSection.toLowerCase()}
                      value={managedForm[field.name] || ""}
                      publicId={managedForm[field.publicIdField] || ""}
                      disabled={saving}
                      onChange={({ url, publicId }) =>
                        setManagedForm({
                          ...managedForm,
                          [field.name]: url,
                          [field.publicIdField]: publicId,
                        })
                      }
                    />
                  </div>
                ) : (
                  <label
                    className={[
                      field.type === "textarea" && "full-width",
                      field.type === "checkbox" && "admin-checkbox-label",
                    ].filter(Boolean).join(" ")}
                    key={field.name}
                  >
                    {field.label}{field.required && (!field.studentOnly || managedForm.kind === "student") ? " *" : ""}
                    {field.type === "textarea" ? (
                      <textarea
                        rows="3"
                        value={managedForm[field.name] || ""}
                        onChange={(event) =>
                          setManagedForm({ ...managedForm, [field.name]: event.target.value })
                        }
                        required={field.required && (!field.studentOnly || managedForm.kind === "student")}
                      />
                    ) : field.type === "checkbox" ? (
                      <input
                        type="checkbox"
                        checked={Boolean(managedForm[field.name])}
                        onChange={(event) =>
                          setManagedForm({ ...managedForm, [field.name]: event.target.checked })
                        }
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={managedForm[field.name] || ""}
                        onChange={(event) =>
                          setManagedForm({ ...managedForm, [field.name]: event.target.value })
                        }
                        required={field.required && (!field.studentOnly || managedForm.kind === "student")}
                      >
                        {field.options.map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type || "text"}
                        value={managedForm[field.name] || ""}
                        onChange={(event) =>
                          setManagedForm({ ...managedForm, [field.name]: event.target.value })
                        }
                        required={field.required && (!field.studentOnly || managedForm.kind === "student")}
                      />
                    )}
                  </label>
                ))}

              {activeSection !== "Contact" && (
                <label>
                  Display order
                  <input
                    type="number"
                    value={managedSortOrder}
                    onChange={(event) => setManagedSortOrder(event.target.value)}
                  />
                </label>
              )}

              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={managedForm.is_active !== false}
                  onChange={(event) =>
                    setManagedForm({ ...managedForm, is_active: event.target.checked })
                  }
                />
                Publish this item
              </label>
            </div>

            <div className="admin-form-actions">
              <button className="admin-primary-btn" disabled={saving}>
                <Save size={17} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="admin-cancel-btn"
                onClick={() => setShowManagedForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="admin-panel-card">
          <div className="admin-panel-heading">
            <h3>{activeSection} ({items.length})</h3>
            <p>Changes are saved to the database and reflected on the public page.</p>
          </div>
          {items.length === 0 ? (
            <p className="admin-empty">No {activeSection.toLowerCase()} content yet. Add the first item to publish it.</p>
          ) : (
            <div className="admin-managed-list">
              {items.map((item) => {
                const title = item.title || item.name || item.address || "Untitled item";
                const subtitle = activeSection === "Placements"
                  ? item.kind
                  : activeSection === "Faculty"
                    ? `${item.designation || ""}${item.department ? ` · ${item.department}` : ""}`
                    : activeSection === "Gallery"
                      ? item.category
                      : item.email || item.phone;

                return (
                  <article className="admin-managed-item" key={item.id}>
                    <div className="admin-managed-preview">
                      {(item.photo || item.image) && (
                        <img src={item.photo || item.image} alt="" />
                      )}
                      <div>
                        <strong>{title}</strong>
                        <span>{subtitle || activeSection}</span>
                      </div>
                    </div>
                    <div className="admin-managed-actions">
                      <span className={item.is_active ? "status-active" : "status-inactive"}>
                        {item.is_active ? "Published" : "Hidden"}
                      </span>
                      <button
                        className="edit-btn"
                        onClick={() => startManagedEdit(item)}
                        title={`Edit ${title}`}
                        aria-label={`Edit ${title}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteManagedContent(item)}
                        title={`Delete ${title}`}
                        aria-label={`Delete ${title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  };

  // ==================================================
  // ALUMNI DATA
  // ==================================================

  const filteredAlumni = alumni.filter((person) => {
    const searchText = search.toLowerCase();

    return (
      (person.full_name || "").toLowerCase().includes(searchText) ||
      (person.email || "").toLowerCase().includes(searchText) ||
      (person.department || "").toLowerCase().includes(searchText) ||
      String(person.graduation_year || "").includes(searchText)
    );
  });

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) {
      return;
    }

    try {
      await apiRequest("/admin/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/admin/login", { replace: true });
    }
  };

  // ==================================================
  // DATE FORMAT
  // ==================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return String(date).slice(0, 10);
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="admin-loading">
        <RefreshCw className="spin" size={30} />
        <p>Verifying administrator session...</p>
      </div>
    );
  }

  if (!admin) return null;

  // ==================================================
  // REUSABLE SECTION HEADER
  // ==================================================

  const sectionHeader = (title, description, buttonText, onClick) => (
    <div className="admin-section-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {buttonText && (
        <button className="admin-primary-btn" onClick={onClick}>
          <Plus size={17} />
          {buttonText}
        </button>
      )}
    </div>
  );

  // ==================================================
  // DASHBOARD HOME
  // ==================================================

  const renderDashboard = () => (
    <>
      <div className="admin-welcome">
        <div>
          <span className="admin-eyebrow">
            <ShieldCheck size={15} />
            ADMINISTRATION PANEL
          </span>

          <h1>Welcome, {admin.name || "Administrator"}</h1>

          <p>
            Manage college website information and monitor registrations.
          </p>
        </div>

        <GraduationCap size={54} />
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon blue">
            <Bell />
          </div>
          <div>
            <span>Total Notices</span>
            <h2>{notices.length}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon red">
            <CalendarDays />
          </div>
          <div>
            <span>Total Events</span>
            <h2>{events.length}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon green">
            <Building2 />
          </div>
          <div>
            <span>Departments</span>
            <h2>{departments.length}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon purple">
            <Users />
          </div>
          <div>
            <span>Alumni Registrations</span>
            <h2>{alumni.length}</h2>
          </div>
        </div>
      </div>

      <div className="admin-panel-card">
        <div className="admin-panel-heading">
          <h3>Quick Management</h3>
          <p>Choose a section to manage college website information.</p>
        </div>

        <div className="admin-quick-grid">
          {menuItems.slice(1).map((item) => {
            const Icon = item.icon;

            return (
              <button
                className="admin-quick-link"
                key={item.name}
                onClick={() => {
                  setActiveSection(item.name);
                  setSearch("");
                }}
              >
                <Icon size={22} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="admin-panel-card">
        <div className="admin-panel-heading">
          <h3>Recent Notices</h3>
          <p>Latest notices published in the college website.</p>
        </div>

        {notices.length === 0 ? (
          <p className="admin-empty">No notices available.</p>
        ) : (
          <div className="admin-recent-list">
            {notices.slice(0, 5).map((notice) => (
              <div className="admin-recent-item" key={notice.id}>
                <div>
                  <strong>{notice.title}</strong>
                  <span>{formatDate(notice.notice_date)}</span>
                </div>

                <Bell size={18} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  // ==================================================
  // NOTICES SECTION
  // ==================================================

  const renderNotices = () => (
    <>
      {sectionHeader(
        "Notices Management",
        "Create, update and manage college notices.",
        "Add Notice",
        () => {
          setNoticeForm(initialNotice);
          setEditingId(null);
          setShowNoticeForm(true);
          setError("");
          setSuccess("");
        }
      )}

      {showNoticeForm && (
        <form className="admin-form-card" onSubmit={handleNoticeSubmit}>
          <div className="admin-form-title">
            <h3>{editingId ? "Edit Notice" : "Add New Notice"}</h3>

            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => setShowNoticeForm(false)}
            >
              <X />
            </button>
          </div>

          <div className="admin-form-grid">
            <label>
              Notice Title *
              <input
                type="text"
                value={noticeForm.title}
                onChange={(e) =>
                  setNoticeForm({
                    ...noticeForm,
                    title: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Notice Date
              <input
                type="date"
                value={noticeForm.notice_date}
                onChange={(e) =>
                  setNoticeForm({
                    ...noticeForm,
                    notice_date: e.target.value,
                  })
                }
              />
            </label>

            <label className="full-width">
              Description
              <textarea
                rows="4"
                value={noticeForm.description}
                onChange={(e) =>
                  setNoticeForm({
                    ...noticeForm,
                    description: e.target.value,
                  })
                }
              />
            </label>
          </div>

          <div className="admin-form-actions">
            <button className="admin-primary-btn" disabled={saving}>
              <Save size={17} />
              {saving ? "Saving..." : "Save Notice"}
            </button>

            <button
              type="button"
              className="admin-cancel-btn"
              onClick={() => setShowNoticeForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-panel-card">
        <div className="admin-panel-heading">
          <h3>All Notices ({notices.length})</h3>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Notice Title</th>
                <th>Description</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {notices.map((notice) => (
                <tr key={notice.id}>
                  <td>{notice.id}</td>
                  <td className="table-strong">{notice.title}</td>
                  <td>{notice.description || "—"}</td>
                  <td>{formatDate(notice.notice_date)}</td>

                  <td>
                    <div className="admin-actions">
                      <button
                        className="edit-btn"
                        onClick={() => editNotice(notice)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteNotice(notice.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {notices.length === 0 && (
                <tr>
                  <td colSpan="5" className="admin-empty">
                    No notices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // ==================================================
  // EVENTS SECTION
  // ==================================================

  const renderEvents = () => (
    <>
      {sectionHeader(
        "Events Management",
        "Add and manage college events.",
        "Add Event",
        () => {
          setEventForm(initialEvent);
          setEditingId(null);
          setShowEventForm(true);
          setError("");
          setSuccess("");
        }
      )}

      {showEventForm && (
        <form className="admin-form-card" onSubmit={handleEventSubmit}>
          <div className="admin-form-title">
            <h3>{editingId ? "Edit Event" : "Add New Event"}</h3>

            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => setShowEventForm(false)}
            >
              <X />
            </button>
          </div>

          <div className="admin-form-grid">
            <label>
              Event Title *
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    title: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Event Date *
              <input
                type="date"
                value={eventForm.event_date}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    event_date: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Category
              <input
                type="text"
                placeholder="Technical / Cultural / Sports"
                value={eventForm.category}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    category: e.target.value,
                  })
                }
              />
            </label>

            <div className="admin-image-form-field">
              <span>Event image</span>
              <AdminImageField
                contentType="events"
                value={eventForm.image}
                publicId={eventForm.image_public_id}
                disabled={saving}
                onChange={({ url, publicId }) =>
                  setEventForm({
                    ...eventForm,
                    image: url,
                    image_public_id: publicId,
                  })
                }
              />
            </div>

            <label className="full-width">
              Description
              <textarea
                rows="4"
                value={eventForm.description}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    description: e.target.value,
                  })
                }
              />
            </label>

            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={eventForm.is_active}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    is_active: e.target.checked,
                  })
                }
              />
              Publish this event
            </label>
          </div>

          <div className="admin-form-actions">
            <button className="admin-primary-btn" disabled={saving}>
              <Save size={17} />
              {saving ? "Saving..." : "Save Event"}
            </button>

            <button
              type="button"
              className="admin-cancel-btn"
              onClick={() => setShowEventForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-panel-card">
        <div className="admin-panel-heading">
          <h3>All Events ({events.length})</h3>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Event</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.id}</td>
                  <td className="table-strong">{event.title}</td>
                  <td>{event.category || "—"}</td>
                  <td>{formatDate(event.event_date)}</td>

                  <td>
                    <span
                      className={
                        Number(event.is_active)
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {Number(event.is_active) ? "Published" : "Hidden"}
                    </span>
                  </td>

                  <td>
                    <div className="admin-actions">
                      <button
                        className="edit-btn"
                        onClick={() => editEvent(event)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteEvent(event.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {events.length === 0 && (
                <tr>
                  <td colSpan="6" className="admin-empty">
                    No events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // ==================================================
  // DEPARTMENTS SECTION
  // ==================================================

  const renderDepartments = () => (
    <>
      {sectionHeader(
        "Departments Management",
        "Manage academic departments and department details.",
        "Add Department",
        () => {
          setDepartmentForm(initialDepartment);
          setEditingId(null);
          setShowDepartmentForm(true);
          setError("");
          setSuccess("");
        }
      )}

      {showDepartmentForm && (
        <form
          className="admin-form-card"
          onSubmit={handleDepartmentSubmit}
        >
          <div className="admin-form-title">
            <h3>
              {editingId ? "Edit Department" : "Add New Department"}
            </h3>

            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => setShowDepartmentForm(false)}
            >
              <X />
            </button>
          </div>

          <div className="admin-form-grid">
            <label>
              Department Name *
              <input
                type="text"
                value={departmentForm.department_name}
                onChange={(e) =>
                  setDepartmentForm({
                    ...departmentForm,
                    department_name: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Department Code *
              <input
                type="text"
                value={departmentForm.department_code}
                onChange={(e) =>
                  setDepartmentForm({
                    ...departmentForm,
                    department_code: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              HOD Name
              <input
                type="text"
                value={departmentForm.hod_name}
                onChange={(e) =>
                  setDepartmentForm({
                    ...departmentForm,
                    hod_name: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Intake
              <input
                type="number"
                min="0"
                value={departmentForm.intake}
                onChange={(e) =>
                  setDepartmentForm({
                    ...departmentForm,
                    intake: e.target.value,
                  })
                }
              />
            </label>

            <div className="admin-image-form-field full-width">
              <span>Department image</span>
              <AdminImageField
                contentType="departments"
                value={departmentForm.image}
                publicId={departmentForm.image_public_id}
                disabled={saving}
                onChange={({ url, publicId }) =>
                  setDepartmentForm({
                    ...departmentForm,
                    image: url,
                    image_public_id: publicId,
                  })
                }
              />
            </div>

            <label className="full-width">
              Description
              <textarea
                rows="4"
                value={departmentForm.description}
                onChange={(e) =>
                  setDepartmentForm({
                    ...departmentForm,
                    description: e.target.value,
                  })
                }
              />
            </label>

            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={departmentForm.is_active}
                onChange={(e) =>
                  setDepartmentForm({
                    ...departmentForm,
                    is_active: e.target.checked,
                  })
                }
              />
              Active Department
            </label>
          </div>

          <div className="admin-form-actions">
            <button className="admin-primary-btn" disabled={saving}>
              <Save size={17} />
              {saving ? "Saving..." : "Save Department"}
            </button>

            <button
              type="button"
              className="admin-cancel-btn"
              onClick={() => setShowDepartmentForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-panel-card">
        <div className="admin-panel-heading">
          <h3>All Departments ({departments.length})</h3>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Department</th>
                <th>Code</th>
                <th>HOD</th>
                <th>Intake</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {departments.map((department) => (
                <tr key={department.id}>
                  <td>{department.id}</td>
                  <td className="table-strong">
                    {department.department_name}
                  </td>
                  <td>{department.department_code}</td>
                  <td>{department.hod_name || "—"}</td>
                  <td>{department.intake || "—"}</td>

                  <td>
                    <div className="admin-actions">
                      <button
                        className="edit-btn"
                        onClick={() => editDepartment(department)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteDepartment(department.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {departments.length === 0 && (
                <tr>
                  <td colSpan="6" className="admin-empty">
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // ==================================================
  // ALUMNI SECTION
  // ==================================================

  const renderAlumni = () => (
    <>
      {sectionHeader(
        "Alumni Registrations",
        "View information submitted through the college alumni registration form."
      )}

      <div className="admin-panel-card">
        <div className="admin-panel-heading alumni-heading">
          <div>
            <h3>Registered Alumni ({alumni.length})</h3>
            <p>Registration records retrieved from the database.</p>
          </div>

          <div className="admin-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search alumni..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Graduation Year</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Organization</th>
                <th>Registered On</th>
              </tr>
            </thead>

            <tbody>
              {filteredAlumni.map((person) => (
                <tr key={person.id}>
                  <td>{person.id}</td>
                  <td className="table-strong">{person.full_name}</td>
                  <td>{person.department}</td>
                  <td>{person.graduation_year}</td>
                  <td>{person.email}</td>
                  <td>{person.phone}</td>
                  <td>{person.organization || "—"}</td>
                  <td>{formatDate(person.created_at)}</td>
                </tr>
              ))}

              {filteredAlumni.length === 0 && (
                <tr>
                  <td colSpan="8" className="admin-empty">
                    No alumni registrations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // ==================================================
  // ACTIVE CONTENT
  // ==================================================

  const renderContent = () => {
    switch (activeSection) {
      case "Notices":
        return renderNotices();

      case "Events":
        return renderEvents();

      case "Departments":
        return renderDepartments();

      case "Faculty":
      case "Placements":
      case "Gallery":
      case "Contact":
        return renderManagedContent();

      case "Alumni":
        return renderAlumni();

      default:
        return renderDashboard();
    }
  };

  // ==================================================
  // MAIN LAYOUT
  // ==================================================

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-shell">
        <div className="admin-section-tabs">
          {adminSectionTabs.map((item) => (
            <button
              key={item}
              type="button"
              className={
                activeSection === item
                  ? "admin-section-tab active"
                  : "admin-section-tab"
              }
              onClick={() => {
                setActiveSection(item);
                setSearch("");
                setError("");
                setSuccess("");
                setShowManagedForm(false);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <main className="admin-main-panel">
          <header className="admin-topbar">
            <div className="admin-topbar-left">
              <div>
                <h2>{activeSection}</h2>
                <p>Government Polytechnic College, Masab Tank</p>
              </div>
            </div>

            <div className="admin-topbar-actions">
              <button
                className="admin-refresh-btn"
                onClick={() => navigate("/admin/media")}
                type="button"
              >
                <Images size={16} />
                Event Media
              </button>

              <button className="admin-refresh-btn" onClick={fetchAllData}>
                <RefreshCw size={16} />
                Refresh Data
              </button>

              <button className="admin-signout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </header>

          <div className="admin-content">
            {error && (
              <div className="admin-alert error">
                <AlertCircle size={18} />
                <span>{error}</span>
                <button onClick={() => setError("")}>
                  <XCircle size={17} />
                </button>
              </div>
            )}

            {success && (
              <div className="admin-alert success">
                <ShieldCheck size={18} />
                <span>{success}</span>
                <button onClick={() => setSuccess("")}>
                  <XCircle size={17} />
                </button>
              </div>
            )}

            <div className="admin-content-toolbar">
              <span>Administration / {activeSection}</span>
            </div>

            {renderContent()}

            <footer className="admin-footer">
              Government Polytechnic College, Masab Tank
              <span>Administrative Dashboard</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;