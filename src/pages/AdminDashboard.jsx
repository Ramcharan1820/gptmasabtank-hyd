import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";

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
  ChevronDown,
  Check,
  Clock,
  UserCheck,
  UserX,
  Tags,
  Tag,
  SlidersHorizontal,
  Layers,
  FolderPlus,
  Palette,
  CheckCircle2,
  Power,
  Hash,
  ArrowUpDown,
  PlusCircle,
  Sparkles,
  Cpu,
  Trophy,
  Wrench,
  Presentation,
  PartyPopper,
  Award,
  BookOpen,
  Heart,
  Globe,
  Star,
  FileText,
  Coins,
  Info,
  Crown,
  Laptop,
  Cog,
  BarChart,
  Landmark,
  Compass,
  Megaphone,
  Rocket,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import AdminImageField from "../components/AdminImageField";
import API_BASE_URL, { getAdminToken, setAdminToken, clearAdminToken } from "../apiConfig";
import "./AdminDashboard.css";

const API_BASE = `${API_BASE_URL}/api`;

const initialNotice = {
  title: "",
  description: "",
  category: "General",
  notice_date: "",
};

const ADMIN_CATEGORIES_METADATA = [
  { name: "Dashboard", label: "Dashboard Overview", desc: "System stats, metrics & activity", group: "General" },
  { name: "Categories", label: "Categories Management", desc: "Master taxonomy & tags for all pages", group: "Administration" },
  { name: "Notices", label: "Notices & Circulars", desc: "Campus announcements & news", group: "Announcements" },
  { name: "Events", label: "Events & Fests", desc: "Technical, cultural & sports events", group: "Campus Life" },
  { name: "Departments", label: "Departments", desc: "Academic branch management", group: "Academics" },
  { name: "Faculty", label: "Faculty Directory", desc: "Teaching staff & leadership", group: "Academics" },
  { name: "Placements", label: "Training & Placements", desc: "Recruiters & placed students", group: "Career" },
  { name: "Gallery", label: "Photo Gallery", desc: "Campus photos & laboratories", group: "Media" },
  { name: "Contact", label: "Contact Information", desc: "Official campus address & info", group: "Info" },
  { name: "Alumni", label: "Alumni Directory", desc: "Registered alumni database", group: "Community" },
  { name: "Admin Approvals", label: "Admin Access & Approvals", desc: "Manage admins & approve registration requests", group: "Administration" },
];

const CATEGORY_PAGE_TARGETS = [
  { id: "all", label: "All Pages", icon: Layers, desc: "All system categories", badgeColor: "#475569" },
  { id: "events", label: "Events", icon: CalendarDays, desc: "Technical, cultural, sports & workshops", badgeColor: "#2563eb" },
  { id: "gallery", label: "Gallery", icon: ImageIcon, desc: "Campus photos, labs & celebrations", badgeColor: "#7c3aed" },
  { id: "notices", label: "Notices", icon: Bell, desc: "Examinations, circulars & admissions", badgeColor: "#dc2626" },
  { id: "faculty", label: "Faculty", icon: UserRound, desc: "Teaching, leadership & technical staff", badgeColor: "#059669" },
  { id: "placements", label: "Placements", icon: BriefcaseBusiness, desc: "IT, core engineering & internships", badgeColor: "#d97706" },
  { id: "departments", label: "Departments", icon: Building2, desc: "Diploma engineering branches", badgeColor: "#800000" },
  { id: "alumni", label: "Alumni", icon: Users, desc: "Notable alumni & chapters", badgeColor: "#0891b2" },
];

const PRESET_CATEGORY_COLORS = [
  { name: "Maroon", hex: "#800000" },
  { name: "Crimson", hex: "#dc2626" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Amber", hex: "#d97706" },
  { name: "Emerald", hex: "#059669" },
  { name: "Green", hex: "#16a34a" },
  { name: "Teal", hex: "#0d9488" },
  { name: "Cyan", hex: "#0891b2" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Violet", hex: "#7c3aed" },
  { name: "Rose", hex: "#db2777" },
  { name: "Slate", hex: "#475569" },
];

const PRESET_CATEGORY_ICONS = [
  "Tag", "Cpu", "Sparkles", "Trophy", "GraduationCap", "Wrench",
  "Presentation", "PartyPopper", "Briefcase", "Building", "Award", "Users",
  "BookOpen", "Star", "FileText", "Coins", "Info", "Crown",
  "Laptop", "Cog", "BarChart", "Landmark", "Compass", "Megaphone",
  "Rocket", "Heart", "Globe"
];

const initialCategoryForm = {
  target_page: "events",
  name: "",
  slug: "",
  description: "",
  color: "#800000",
  icon: "Tag",
  sort_order: 0,
  is_active: true,
};

const EVENT_CATEGORIES = [
  "Technical",
  "Cultural",
  "Sports",
  "Academic",
  "Workshop",
  "Seminar",
  "Celebrations",
  "Placement",
  "Campus",
  "Other",
];

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
    {
      name: "department",
      label: "Department",
      type: "select",
      options: [
        ["CSE", "Computer Science & Engineering (CSE)"],
        ["ECE", "Electronics & Communication (ECE)"],
        ["EEE", "Electrical & Electronics (EEE)"],
        ["Mechanical", "Mechanical Engineering"],
        ["Civil", "Civil Engineering"],
        ["Automobile", "Automobile Engineering"],
        ["Pharmacy", "Pharmacy"],
        ["General", "General Science & Humanities"],
      ],
      required: true,
    },
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
    {
      name: "category",
      label: "Category",
      type: "select",
      options: [
        ["Campus", "Campus"],
        ["Laboratories", "Laboratories"],
        ["Activities", "Activities"],
        ["Students", "Students"],
        ["Events", "Events"],
        ["Celebrations", "Celebrations"],
        ["Sports", "Sports"],
        ["Academic", "Academic"],
      ],
      required: true,
    },
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
    if (field.type === "select" && Array.isArray(field.options) && field.options.length > 0) {
      form[field.name] = field.options[0][0];
    } else if (field.type !== "checkbox") {
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
  const isSuper = admin?.role === "superadmin";

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
  const [placementRecruiters, setPlacementRecruiters] = useState([]);

  const [search, setSearch] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("All");
  const [managedCategoryFilter, setManagedCategoryFilter] = useState("All");
  const [alumniDeptFilter, setAlumniDeptFilter] = useState("All");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const categoryDropdownRef = useRef(null);
  const formRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Categories Management System State
  const [categories, setCategories] = useState([]);
  const [categoryPageTab, setCategoryPageTab] = useState("all");
  const [categoryFilterStatus, setCategoryFilterStatus] = useState("all");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [categorySortBy, setCategorySortBy] = useState("order");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryDeleteModal, setCategoryDeleteModal] = useState({
    open: false,
    category: null,
    inUse: false,
    count: 0,
    force: false,
  });
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState("All");

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredAdminCategories = useMemo(() => {
    return ADMIN_CATEGORIES_METADATA.filter((item) => {
      if (item.name === "Admin Approvals" && !isSuper) return false;
      if (!categorySearch.trim()) return true;
      const q = categorySearch.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
      );
    });
  }, [categorySearch, admin]);

  const filteredEvents =
    eventCategoryFilter === "All"
      ? events
      : events.filter(
          (e) =>
            (e.category || "").toLowerCase() ===
            eventCategoryFilter.toLowerCase()
        );

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.description && n.description.toLowerCase().includes(q)) ||
        (n.category && n.category.toLowerCase().includes(q));

      const matchesCat =
        noticeCategoryFilter === "All" ||
        (n.category || "General").toLowerCase() === noticeCategoryFilter.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [notices, search, noticeCategoryFilter]);



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

  // Smooth scroll up to form on edit or open
  const scrollToForm = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      const targetElement =
        formRef.current || document.querySelector(".admin-form-card");
      if (targetElement) {
        const yOffset = -28;
        const y =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });

        const firstInput = targetElement.querySelector(
          "input:not([type=hidden]):not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled]), select:not([disabled])"
        );
        if (firstInput) {
          firstInput.focus({ preventScroll: true });
        }
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 60);
  }, []);

  useEffect(() => {
    if (editingId) {
      scrollToForm();
    }
  }, [editingId, scrollToForm]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Super Admin - Admin Management & Approvals
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersCounts, setAdminUsersCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  });
  const [pendingAdminCount, setPendingAdminCount] = useState(0);
  const [adminStatusFilter, setAdminStatusFilter] = useState("all");
  const [adminUserSearch, setAdminUserSearch] = useState("");
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [rejectModal, setRejectModal] = useState({
    open: false,
    adminId: null,
    adminName: "",
    reason: "",
  });



  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Categories",
      icon: Tags,
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
    ...(isSuper ? [{ name: "Admin Approvals", icon: ShieldCheck }] : []),
  ];

  const adminSectionTabs = [
    "Dashboard",
    "Categories",
    "Notices",
    "Events",
    "Departments",
    "Faculty",
    "Placements",
    "Gallery",
    "Contact",
    "Alumni",
    ...(isSuper ? ["Admin Approvals"] : []),
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
    const token = getAdminToken();
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...authHeaders,
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
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get("token");
        if (urlToken) {
          setAdminToken(urlToken);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const token = urlToken || getAdminToken();
        if (!token) {
          clearAdminToken();
          navigate("/admin/login", { replace: true });
          return;
        }

        const response = await apiRequest("/admin/me");

        if (!response.authenticated) {
          clearAdminToken();
          navigate("/admin/login", { replace: true });
          return;
        }

        setAdmin(response.admin);
      } catch (error) {
        clearAdminToken();
        navigate("/admin/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  // ==================================================
  // SUPERADMIN - ADMIN APPROVALS & USER MANAGEMENT
  // ==================================================

  const fetchAdminUsers = useCallback(async () => {
    if (!admin || admin.role !== "superadmin") return;
    setLoadingAdmins(true);
    try {
      const query = new URLSearchParams();
      if (adminStatusFilter && adminStatusFilter !== "all") {
        query.set("status", adminStatusFilter);
      }
      if (adminUserSearch.trim()) {
        query.set("search", adminUserSearch.trim());
      }
      const res = await apiRequest(`/admin/users?${query.toString()}`);
      if (res.success) {
        setAdminUsers(res.admins || []);
        if (res.counts) {
          setAdminUsersCounts(res.counts);
          setPendingAdminCount(Number(res.counts.pending || 0));
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
    } finally {
      setLoadingAdmins(false);
    }
  }, [admin, adminStatusFilter, adminUserSearch]);

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await apiRequest("/admin/pending-count");
      if (res.success) {
        setPendingAdminCount(Number(res.count || 0));
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (admin && admin.role === "superadmin") {
      fetchAdminUsers();
    }
  }, [admin, adminStatusFilter, adminUserSearch, fetchAdminUsers]);

  const handleApproveAdmin = async (id, name) => {
    try {
      setError("");
      const res = await apiRequest(`/admin/users/${id}/approve`, {
        method: "POST",
      });
      if (!res.success) throw new Error(res.message);
      setSuccess(`Administrator account for "${name}" has been approved and activated!`);
      fetchAdminUsers();
      fetchPendingCount();
    } catch (err) {
      setError(err.message || "Failed to approve administrator.");
    }
  };

  const handleOpenRejectModal = (adminItem) => {
    setRejectModal({
      open: true,
      adminId: adminItem.id,
      adminName: adminItem.name,
      reason: "",
    });
  };

  const handleConfirmReject = async () => {
    if (!rejectModal.adminId) return;
    try {
      setError("");
      const res = await apiRequest(`/admin/users/${rejectModal.adminId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectModal.reason || "Declined by Main Administrator" }),
      });
      if (!res.success) throw new Error(res.message);
      setSuccess(`Registration request for "${rejectModal.adminName}" was rejected.`);
      setRejectModal({ open: false, adminId: null, adminName: "", reason: "" });
      fetchAdminUsers();
      fetchPendingCount();
    } catch (err) {
      setError(err.message || "Failed to decline registration.");
    }
  };

  const handleToggleAdminStatus = async (id, currentActive, name) => {
    try {
      setError("");
      const res = await apiRequest(`/admin/users/${id}/toggle-status`, {
        method: "POST",
      });
      if (!res.success) throw new Error(res.message);
      setSuccess(res.message || `Status updated for "${name}".`);
      fetchAdminUsers();
    } catch (err) {
      setError(err.message || "Failed to toggle account status.");
    }
  };

  const handleUpdateAdminRole = async (id, currentRole, name) => {
    const targetRole = currentRole === "superadmin" ? "admin" : "superadmin";
    const confirmMsg =
      targetRole === "superadmin"
        ? `Promote "${name}" to Main Administrator (Superadmin)? They will have full privileges to approve and manage other administrators.`
        : `Demote "${name}" from Main Administrator to standard Admin?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setError("");
      const res = await apiRequest(`/admin/users/${id}/role`, {
        method: "POST",
        body: JSON.stringify({ role: targetRole }),
      });
      if (!res.success) throw new Error(res.message);
      setSuccess(res.message);
      fetchAdminUsers();
    } catch (err) {
      setError(err.message || "Failed to update role.");
    }
  };

  const handleDeleteAdmin = async (id, name) => {
    if (
      !window.confirm(
        `Permanently remove administrator record for "${name}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      setError("");
      const res = await apiRequest(`/admin/users/${id}`, {
        method: "DELETE",
      });
      if (!res.success) throw new Error(res.message);
      setSuccess(res.message || "Admin account deleted.");
      fetchAdminUsers();
      fetchPendingCount();
    } catch (err) {
      setError(err.message || "Failed to delete admin.");
    }
  };

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
        categoriesResult,
        placementRecordsResult,
      ] = await Promise.all([
        apiRequest("/notices"),
        apiRequest("/admin/events"),
        apiRequest("/departments"),
        apiRequest("/alumni"),
        apiRequest("/admin/categories").catch(() => ({ data: [] })),
        apiRequest("/placements").catch((placementError) => {
          console.warn("Unable to load placement recruiters:", placementError.message);
          return { data: [] };
        }),
      ]);

      setNotices(noticeResult.data || []);
      setEvents(eventResult.data || []);
      setDepartments(departmentResult.departments || []);
      setAlumni(alumniResult.data || []);
      setCategories(categoriesResult.data || []);
      setPlacementRecruiters(
        Array.isArray(placementRecordsResult.data)
          ? [...new Set(
              placementRecordsResult.data
                .map((item) => String(item.company || "").trim())
                .filter(Boolean)
            )].sort((a, b) => a.localeCompare(b))
          : []
      );

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

      fetchPendingCount();
    } catch (error) {
      setError(error.message || "Unable to load dashboard data.");
    }
  }, [fetchPendingCount]);

  useEffect(() => {
    if (admin) {
      fetchAllData();
    }
  }, [admin, fetchAllData]);

  // ==================================================
  // CATEGORIES MANAGEMENT HELPERS & HANDLERS
  // ==================================================

  const getCategoriesForPage = useCallback((targetPage, activeOnly = true) => {
    if (!categories || categories.length === 0) {
      if (targetPage === "events") return EVENT_CATEGORIES.map((name) => ({ name, color: "#800000" }));
      if (targetPage === "notices") return ["General", "Examination", "Admissions", "Academic", "Circulars", "Scholarships", "Holidays", "Placements"].map((name) => ({ name, color: "#800000" }));
      if (targetPage === "gallery") return ["Campus", "Laboratories", "Activities", "Students", "Events", "Celebrations", "Sports", "Academic", "Infrastructure", "Achievements"].map((name) => ({ name, color: "#800000" }));
      return [];
    }
    return categories.filter((c) => {
      const matchPage = (c.target_page || "").toLowerCase() === targetPage.toLowerCase();
      return activeOnly ? (matchPage && c.is_active) : matchPage;
    });
  }, [categories]);

  const activeEventCategories = useMemo(() => {
    const list = getCategoriesForPage("events", true);
    if (list.length === 0) return EVENT_CATEGORIES;
    return list.map((c) => c.name);
  }, [getCategoriesForPage]);

  const activeGalleryCategories = useMemo(() => {
    const list = getCategoriesForPage("gallery", true);
    if (list.length === 0) return [
      "Campus", "Laboratories", "Activities", "Students", "Events",
      "Celebrations", "Sports", "Academic"
    ];
    return list.map((c) => c.name);
  }, [getCategoriesForPage]);

  const activeNoticeCategories = useMemo(() => {
    const list = getCategoriesForPage("notices", true);
    if (list.length === 0) return ["General", "Examination", "Admissions", "Academic", "Circulars", "Scholarships", "Holidays", "Placements"];
    return list.map((c) => c.name);
  }, [getCategoriesForPage]);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      setError("Please enter a category name.");
      return;
    }

    setSavingCategory(true);
    setError("");
    setSuccess("");

    try {
      if (editingCategory) {
        await apiRequest(`/admin/categories/${editingCategory.id}`, {
          method: "PUT",
          body: JSON.stringify(categoryForm),
        });
        setSuccess(`Category "${categoryForm.name}" updated successfully.`);
      } else {
        await apiRequest("/admin/categories", {
          method: "POST",
          body: JSON.stringify(categoryForm),
        });
        setSuccess(`Category "${categoryForm.name}" created successfully.`);
      }

      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm(initialCategoryForm);
      await fetchAllData();
    } catch (err) {
      setError(err.message || "Failed to save category.");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleToggleCategoryStatus = async (cat) => {
    try {
      setError("");
      await apiRequest(`/admin/categories/${cat.id}/toggle-status`, {
        method: "POST",
      });
      setCategories((prev) =>
        prev.map((item) =>
          item.id === cat.id ? { ...item, is_active: !item.is_active } : item
        )
      );
      setSuccess(`Category "${cat.name}" is now ${cat.is_active ? "hidden" : "active"}.`);
    } catch (err) {
      setError(err.message || "Failed to toggle category status.");
    }
  };

  const handleDeleteCategory = async (cat, force = false) => {
    try {
      setError("");
      await apiRequest(`/admin/categories/${cat.id}${force ? "?force=true" : ""}`, {
        method: "DELETE",
      });
      setCategories((prev) => prev.filter((item) => item.id !== cat.id));
      setCategoryDeleteModal({ open: false, category: null, inUse: false, count: 0, force: false });
      setSuccess(`Category "${cat.name}" deleted successfully.`);
      await fetchAllData();
    } catch (err) {
      if (err.message && err.message.includes("currently assigned") && !force) {
        setCategoryDeleteModal({
          open: true,
          category: cat,
          inUse: true,
          count: cat.item_count || 1,
          force: true,
        });
      } else {
        setError(err.message || "Failed to delete category.");
      }
    }
  };

  const handleSeedDefaults = async () => {
    try {
      setError("");
      const res = await apiRequest("/admin/categories/seed-defaults", {
        method: "POST",
      });
      setSuccess(res.message || "Standard categories seeded successfully.");
      await fetchAllData();
    } catch (err) {
      setError(err.message || "Failed to seed default categories.");
    }
  };

  const filteredCategoriesList = useMemo(() => {
    return categories
      .filter((cat) => {
        if (categoryPageTab !== "all" && cat.target_page !== categoryPageTab) {
          return false;
        }
        if (categoryFilterStatus === "active" && !cat.is_active) return false;
        if (categoryFilterStatus === "inactive" && cat.is_active) return false;
        if (categorySearchQuery.trim()) {
          const q = categorySearchQuery.toLowerCase().trim();
          const matches =
            (cat.name && cat.name.toLowerCase().includes(q)) ||
            (cat.slug && cat.slug.toLowerCase().includes(q)) ||
            (cat.description && cat.description.toLowerCase().includes(q)) ||
            (cat.target_page && cat.target_page.toLowerCase().includes(q));
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (categorySortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        if (categorySortBy === "count") {
          return (b.item_count || 0) - (a.item_count || 0);
        }
        if (a.target_page !== b.target_page) {
          return a.target_page.localeCompare(b.target_page);
        }
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
  }, [categories, categoryPageTab, categoryFilterStatus, categorySearchQuery, categorySortBy]);

  const renderCategoryIconHelper = (iconName, size = 18, className = "") => {
    const iconProps = { size, className };
    switch (iconName) {
      case "Cpu": return <Cpu {...iconProps} />;
      case "Sparkles": return <Sparkles {...iconProps} />;
      case "Trophy": return <Trophy {...iconProps} />;
      case "GraduationCap": return <GraduationCap {...iconProps} />;
      case "Wrench": return <Wrench {...iconProps} />;
      case "Presentation": return <Presentation {...iconProps} />;
      case "PartyPopper": return <PartyPopper {...iconProps} />;
      case "Briefcase": return <BriefcaseBusiness {...iconProps} />;
      case "Building": return <Building2 {...iconProps} />;
      case "Award": return <Award {...iconProps} />;
      case "Users": return <Users {...iconProps} />;
      case "BookOpen": return <BookOpen {...iconProps} />;
      case "Star": return <Star {...iconProps} />;
      case "FileText": return <FileText {...iconProps} />;
      case "Coins": return <Coins {...iconProps} />;
      case "Info": return <Info {...iconProps} />;
      case "Crown": return <Crown {...iconProps} />;
      case "Laptop": return <Laptop {...iconProps} />;
      case "Cog": return <Cog {...iconProps} />;
      case "BarChart": return <BarChart {...iconProps} />;
      case "Landmark": return <Landmark {...iconProps} />;
      case "Compass": return <Compass {...iconProps} />;
      case "Megaphone": return <Megaphone {...iconProps} />;
      case "Rocket": return <Rocket {...iconProps} />;
      case "Heart": return <Heart {...iconProps} />;
      case "Globe": return <Globe {...iconProps} />;
      case "Layers": return <Layers {...iconProps} />;
      case "CalendarDays": return <CalendarDays {...iconProps} />;
      case "Bell": return <Bell {...iconProps} />;
      case "Tag":
      case "Tags":
      default:
        return <Tag {...iconProps} />;
    }
  };

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
      category: notice.category || "General",
      notice_date: notice.notice_date
        ? String(notice.notice_date).slice(0, 10)
        : "",
    });

    setEditingId(notice.id);
    setShowNoticeForm(true);
    setError("");
    setSuccess("");
    scrollToForm();
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
    scrollToForm();
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
      window.dispatchEvent(new Event("departments-updated"));
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
    scrollToForm();
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
      window.dispatchEvent(new Event("departments-updated"));
    } catch (error) {
      setError(error.message);
    }
  };

  // ==================================================
  // FACULTY, PLACEMENTS, GALLERY AND CONTACT CONTENT
  // ==================================================

  const managedFields = useMemo(() => {
    const raw = managedContentFields[activeSection] || [];
    if (activeSection === "Gallery") {
      return raw.map((field) => {
        if (field.name === "category") {
          return {
            ...field,
            options: activeGalleryCategories.map((name) => [name, name]),
          };
        }
        return field;
      });
    }
    return raw;
  }, [activeSection, activeGalleryCategories]);

  const startManagedCreate = () => {
    const form = emptyManagedForm(activeSection);
    if (
      activeSection === "Placements" &&
      ["feature", "recruiter", "student"].includes(managedCategoryFilter)
    ) {
      form.kind = managedCategoryFilter;
    }
    setManagedForm(form);
    setManagedSortOrder("0");
    setEditingId(null);
    setShowManagedForm(true);
    setError("");
    setSuccess("");
    scrollToForm();
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
    scrollToForm();
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
    const rawItems = managedContent[activeSection] || [];

    const categoryFilterOptions = [
      ...new Set(
        [
          ...(activeSection === "Placements" ? ["feature", "recruiter", "student"] : []),
          ...rawItems.map((item) =>
            activeSection === "Faculty"
              ? item.department
              : activeSection === "Gallery"
                ? item.category
                : activeSection === "Placements"
                  ? item.kind
                  : null
          ),
        ].filter(Boolean)
      ),
    ];

    const items =
      managedCategoryFilter === "All"
        ? rawItems
        : rawItems.filter((item) => {
            if (activeSection === "Faculty") return (item.department || "").toLowerCase() === managedCategoryFilter.toLowerCase();
            if (activeSection === "Gallery") return (item.category || "").toLowerCase() === managedCategoryFilter.toLowerCase();
            if (activeSection === "Placements") return (item.kind || "").toLowerCase() === managedCategoryFilter.toLowerCase();
            return true;
          });
    const canCreate = activeSection !== "Contact" || items.length === 0;
    const createLabel = activeSection === "Placements"
      ? {
          feature: "Add Placement Feature",
          recruiter: "Add Recruiter",
          student: "Add Student Placement",
          All: "Add Placement Item",
        }[managedCategoryFilter] || "Add Placement Item"
      : ({
          Faculty: "Add Faculty Member",
          Gallery: "Add Gallery Image",
          Contact: "Add Contact Details",
        }[activeSection]);

    return (
      <>
        {sectionHeader(
          activeSection === "Placements" && managedCategoryFilter === "recruiter"
            ? "Recruiter Management"
            : `${activeSection} Management`,
          `Create, update, publish, and organize ${activeSection.toLowerCase()} on the public website.`,
          canCreate ? createLabel : null,
          startManagedCreate
        )}

        {activeSection === "Placements" && (
          <div className="admin-content-hint admin-placement-recruiter-hint">
            <strong>Recruiters from placement records ({placementRecruiters.length})</strong>
            <p>
              These unique employer names are read from placement records and shown on the public page.
              Use the Recruiter item-type filter below to add, edit, publish, or remove curated recruiter directory entries.
            </p>
            {placementRecruiters.length > 0 ? (
              <div className="admin-placement-recruiter-list">
                {placementRecruiters.map((name) => (
                  <span key={name}>{name}</span>
                ))}
              </div>
            ) : (
              <p>No employer names were found in the placement records table.</p>
            )}
          </div>
        )}

        {activeSection === "Contact" && items.length === 0 && (
          <div className="admin-content-hint">
            Add the official address, phone, email, map and travel information here. The public contact page updates automatically after publishing.
          </div>
        )}

        {showManagedForm && (
          <form
            ref={formRef}
            className={`admin-form-card ${editingId ? "is-editing" : ""}`}
            onSubmit={handleManagedSubmit}
          >
            <div className="admin-form-title">
              <h3>
                {editingId
                  ? `Edit ${activeSection === "Placements" && managedForm.kind === "recruiter" ? "Recruiter" : activeSection}`
                  : `Add ${activeSection === "Placements" && managedForm.kind === "recruiter" ? "Recruiter" : activeSection}`}
                {editingId && (
                  <span className="admin-editing-tag">Editing ID #{editingId}</span>
                )}
              </h3>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => {
                  setShowManagedForm(false);
                  setEditingId(null);
                }}
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
                    {activeSection === "Placements" && managedForm.kind === "recruiter"
                      ? field.name === "title"
                        ? "Recruiter name"
                        : field.name === "description"
                          ? "Company overview"
                          : field.label
                      : field.label}
                    {field.required && (!field.studentOnly || managedForm.kind === "student") ? " *" : ""}
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
                onClick={() => {
                  setShowManagedForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="admin-panel-card">
          <div className="admin-panel-heading admin-panel-heading-row">
            <div>
              <h3>{activeSection} ({items.length})</h3>
              <p>Changes are saved to the database and reflected on the public page.</p>
            </div>
            {categoryFilterOptions.length > 0 && (
              <div className="admin-filter-group">
                <label>Filter by {activeSection === "Faculty" ? "Department" : activeSection === "Placements" ? "Item Type" : "Category"}:</label>
                <select
                  value={managedCategoryFilter}
                  onChange={(e) => setManagedCategoryFilter(e.target.value)}
                  className="admin-filter-select"
                >
                  <option value="All">All {activeSection === "Faculty" ? "Departments" : activeSection === "Placements" ? "Types" : "Categories"}</option>
                  {categoryFilterOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {items.length === 0 ? (
            <p className="admin-empty">
              {activeSection === "Placements" && managedCategoryFilter === "recruiter"
                ? "No curated recruiters yet. Add a recruiter to publish an additional directory entry."
                : `No ${activeSection.toLowerCase()} content yet. Add the first item to publish it.`}
            </p>
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

  const alumniDepartments = [...new Set(alumni.map((a) => a.department).filter(Boolean))];

  const filteredAlumni = alumni.filter((person) => {
    const matchesDept =
      alumniDeptFilter === "All" ||
      (person.department || "").toLowerCase() === alumniDeptFilter.toLowerCase();
    if (!matchesDept) return false;
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
      clearAdminToken();
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

  if (!admin) {
    return (
      <div className="admin-loading" style={{ padding: "60px 20px" }}>
        <ShieldCheck size={48} style={{ color: "var(--maroon-primary, #800000)" }} />
        <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: "10px 0 4px" }}>
          Administrator Session Required
        </h3>
        <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "420px", textAlign: "center", lineHeight: "1.5" }}>
          You need to be signed in as an administrator to view this page. Redirecting to login...
        </p>
        <button
          type="button"
          onClick={() => navigate("/admin/login", { replace: true })}
          style={{
            marginTop: "16px",
            padding: "10px 24px",
            background: "var(--maroon-primary, #800000)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(128, 0, 0, 0.25)"
          }}
        >
          Go to Admin Login
        </button>
      </div>
    );
  }

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
        <div className="admin-welcome-text">
          <div className="admin-eyebrow">
            <ShieldCheck size={16} />
            <span>COLLEGE ADMINISTRATION PANEL</span>
            <span className="admin-welcome-tag">
              {admin?.role === "superadmin" ? "MAIN ADMINISTRATOR" : "ADMINISTRATOR"}
            </span>
          </div>

          <h1 className="admin-welcome-title">
            Welcome, {admin?.name || (isSuper ? "Main Administrator" : "Administrator")}
          </h1>

          <p className="admin-welcome-subtitle">
            Signed in as <strong>@{admin?.username || "gpthyd_admin"}</strong> ({admin?.email || "gpthyd.dte.telangana@gmail.com"}) &bull; Government Polytechnic College Masab Tank
          </p>
        </div>

        <div className="admin-welcome-icon-box">
          <GraduationCap size={56} />
        </div>
      </div>

      {isSuper && pendingAdminCount > 0 && (
        <div className="admin-approval-alert-banner">
          <div className="admin-approval-alert-left">
            <div className="admin-approval-alert-icon">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="admin-approval-alert-title">
                {pendingAdminCount} Administrator Registration Request{pendingAdminCount > 1 ? "s" : ""} Awaiting Review
              </div>
              <div className="admin-approval-alert-desc">
                New faculty or staff members have registered and are waiting for your approval as the Main Administrator.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="admin-approval-alert-btn"
            onClick={() => {
              setActiveSection("Admin Approvals");
              setAdminStatusFilter("pending");
            }}
          >
            Review Requests &rarr;
          </button>
        </div>
      )}

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

        <div
          className="admin-stat-card"
          style={{ cursor: "pointer" }}
          onClick={() => setActiveSection("Categories")}
        >
          <div className="stat-icon" style={{ background: "#faecec", color: "#800000" }}>
            <Tags />
          </div>
          <div>
            <span>Master Categories</span>
            <h2>{categories.length}</h2>
          </div>
        </div>

        {isSuper && (
          <div
            className="admin-stat-card"
            style={{ cursor: "pointer" }}
            onClick={() => setActiveSection("Admin Approvals")}
          >
            <div className="stat-icon" style={{ background: "#fef3c7", color: "#b45309" }}>
              <ShieldCheck />
            </div>
            <div>
              <span>Admin Accounts</span>
              <h2>
                {adminUsersCounts.approved || 1}
                {pendingAdminCount > 0 && (
                  <span style={{ fontSize: "12px", color: "#d97706", marginLeft: "6px", fontWeight: "700" }}>
                    ({pendingAdminCount} pending)
                  </span>
                )}
              </h2>
            </div>
          </div>
        )}
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
        "Create, update and manage college notices and campus circulars.",
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
        <form
          ref={formRef}
          className={`admin-form-card ${editingId ? "is-editing" : ""}`}
          onSubmit={handleNoticeSubmit}
        >
          <div className="admin-form-title">
            <h3>
              {editingId ? "Edit Notice" : "Add New Notice"}
              {editingId && (
                <span className="admin-editing-tag">Editing ID #{editingId}</span>
              )}
            </h3>

            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => {
                setShowNoticeForm(false);
                setEditingId(null);
              }}
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
              Category
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <select
                  value={noticeForm.category || "General"}
                  onChange={(e) =>
                    setNoticeForm({
                      ...noticeForm,
                      category: e.target.value,
                    })
                  }
                  style={{ flex: 1 }}
                >
                  {activeNoticeCategories.map((catName) => (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  ))}
                  {noticeForm.category &&
                    !activeNoticeCategories.includes(noticeForm.category) && (
                      <option value={noticeForm.category}>
                        {noticeForm.category}
                      </option>
                    )}
                </select>
                <button
                  type="button"
                  className="admin-cat-icon-action-btn"
                  title="Manage Notice Categories"
                  onClick={() => {
                    setActiveSection("Categories");
                    setCategoryPageTab("notices");
                  }}
                >
                  <Tags size={15} />
                </button>
              </div>
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
              onClick={() => {
                setShowNoticeForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-panel-card">
        <div className="admin-panel-heading admin-panel-heading-row">
          <div>
            <h3>All Notices ({filteredNotices.length})</h3>
            <p>Campus announcements and circulars organized by category.</p>
          </div>

          <div className="admin-filter-group">
            <label htmlFor="notice-cat-filter">Category:</label>
            <select
              id="notice-cat-filter"
              className="admin-filter-select"
              value={noticeCategoryFilter}
              onChange={(e) => setNoticeCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {activeNoticeCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Notice Title</th>
                <th>Category</th>
                <th>Description</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredNotices.map((notice) => {
                const noticeCatObj = categories.find(
                  (c) =>
                    c.target_page === "notices" &&
                    c.name.toLowerCase() === (notice.category || "General").toLowerCase()
                );
                const catColor = noticeCatObj?.color || "#800000";

                return (
                  <tr key={notice.id}>
                    <td>{notice.id}</td>
                    <td className="table-strong">{notice.title}</td>
                    <td>
                      <span
                        className="notice-category-badge"
                        style={{
                          background: `${catColor}18`,
                          color: catColor,
                          border: `1px solid ${catColor}35`,
                        }}
                      >
                        {noticeCatObj ? renderCategoryIconHelper(noticeCatObj.icon, 12) : <Tag size={12} />}
                        {notice.category || "General"}
                      </span>
                    </td>
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
                );
              })}

              {filteredNotices.length === 0 && (
                <tr>
                  <td colSpan="6" className="admin-empty">
                    No notices found matching current filter.
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
        <form
          ref={formRef}
          className={`admin-form-card ${editingId ? "is-editing" : ""}`}
          onSubmit={handleEventSubmit}
        >
          <div className="admin-form-title">
            <h3>
              {editingId ? "Edit Event" : "Add New Event"}
              {editingId && (
                <span className="admin-editing-tag">Editing ID #{editingId}</span>
              )}
            </h3>

            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => {
                setShowEventForm(false);
                setEditingId(null);
              }}
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
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <select
                  value={eventForm.category}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      category: e.target.value,
                    })
                  }
                  style={{ flex: 1 }}
                >
                  <option value="">-- Select Category --</option>
                  {activeEventCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  {eventForm.category &&
                    !activeEventCategories.includes(eventForm.category) && (
                      <option value={eventForm.category}>
                        {eventForm.category}
                      </option>
                    )}
                </select>
                <button
                  type="button"
                  className="admin-cat-icon-action-btn"
                  title="Manage Event Categories"
                  onClick={() => {
                    setActiveSection("Categories");
                    setCategoryPageTab("events");
                  }}
                >
                  <Tags size={15} />
                </button>
              </div>
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
              onClick={() => {
                setShowEventForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-panel-card">
        <div className="admin-panel-heading admin-panel-heading-row">
          <div>
            <h3>All Events ({filteredEvents.length})</h3>
            <p>Manage college events and publications</p>
          </div>
          <div className="admin-filter-group">
            <label htmlFor="event-category-filter">Category:</label>
            <select
              id="event-category-filter"
              value={eventCategoryFilter}
              onChange={(e) => setEventCategoryFilter(e.target.value)}
              className="admin-filter-select"
            >
              <option value="All">All Categories</option>
              {activeEventCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
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
              {filteredEvents.map((event) => {
                const eventCatObj = categories.find(
                  (c) =>
                    c.target_page === "events" &&
                    c.name.toLowerCase() === (event.category || "").toLowerCase()
                );
                const catColor = eventCatObj?.color || "#2563eb";

                return (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td className="table-strong">{event.title}</td>
                    <td>
                      {event.category ? (
                        <span
                          className="notice-category-badge"
                          style={{
                            background: `${catColor}18`,
                            color: catColor,
                            border: `1px solid ${catColor}35`,
                          }}
                        >
                          {eventCatObj ? renderCategoryIconHelper(eventCatObj.icon, 12) : <Tag size={12} />}
                          {event.category}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
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
              );
            })}

            {filteredEvents.length === 0 && (
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
          ref={formRef}
          className={`admin-form-card ${editingId ? "is-editing" : ""}`}
          onSubmit={handleDepartmentSubmit}
        >
          <div className="admin-form-title">
            <h3>
              {editingId ? "Edit Department" : "Add New Department"}
              {editingId && (
                <span className="admin-editing-tag">Editing ID #{editingId}</span>
              )}
            </h3>

            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => {
                setShowDepartmentForm(false);
                setEditingId(null);
              }}
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
              onClick={() => {
                setShowDepartmentForm(false);
                setEditingId(null);
              }}
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
            <h3>Registered Alumni ({filteredAlumni.length})</h3>
            <p>Registration records retrieved from the database.</p>
          </div>

          <div className="admin-filter-group">
            <label>Department:</label>
            <select
              value={alumniDeptFilter}
              onChange={(e) => setAlumniDeptFilter(e.target.value)}
              className="admin-filter-select"
            >
              <option value="All">All Departments</option>
              {alumniDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
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
  // SUPERADMIN - ADMIN MANAGEMENT & APPROVALS PANEL
  // ==================================================

  const renderAdminApprovals = () => {
    if (!isSuper) {
      return (
        <div className="admin-panel-card">
          <div className="admin-alert error">
            <AlertCircle size={20} />
            <span>Main Administrator authorization is required to access administrator approval controls.</span>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-panel-card">
        <div className="admin-panel-heading">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3>Administrator Approvals & User Directory</h3>
              <p>Verify registration credentials, approve or decline new administrator access, and manage administrative privileges.</p>
            </div>
            <button
              type="button"
              className="admin-refresh-btn"
              onClick={fetchAdminUsers}
              disabled={loadingAdmins}
            >
              <RefreshCw size={15} className={loadingAdmins ? "spin" : ""} />
              Refresh Directory
            </button>
          </div>
        </div>

        {/* Toolbar: Filters & Search */}
        <div className="admin-approvals-toolbar">
          <div className="admin-approvals-filter-group">
            {[
              { id: "all", label: "All Accounts", count: adminUsersCounts.total },
              { id: "pending", label: "Pending Approvals", count: adminUsersCounts.pending, isPending: true },
              { id: "approved", label: "Active & Approved", count: adminUsersCounts.approved },
              { id: "rejected", label: "Declined", count: adminUsersCounts.rejected },
              { id: "suspended", label: "Suspended", count: adminUsersCounts.suspended },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`admin-approval-filter-btn ${adminStatusFilter === tab.id ? "active" : ""}`}
                onClick={() => setAdminStatusFilter(tab.id)}
              >
                <span>{tab.label}</span>
                <span className={`filter-count ${tab.isPending && tab.count > 0 ? "pending" : ""}`}>
                  {tab.count || 0}
                </span>
              </button>
            ))}
          </div>

          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search by name, email, dept..."
              value={adminUserSearch}
              onChange={(e) => setAdminUserSearch(e.target.value)}
              className="admin-search-input"
              style={{ width: "100%", paddingLeft: "32px", height: "36px", fontSize: "12.5px" }}
            />
          </div>
        </div>

        {/* Table */}
        {loadingAdmins ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            <RefreshCw size={28} className="spin" style={{ margin: "0 auto 10px" }} />
            <p>Loading administrator accounts...</p>
          </div>
        ) : adminUsers.length === 0 ? (
          <div className="admin-empty" style={{ textAlign: "center", padding: "40px" }}>
            <ShieldCheck size={40} style={{ color: "#94a3b8", margin: "0 auto 10px" }} />
            <h4>No administrator records found</h4>
            <p style={{ color: "#64748b", fontSize: "13px" }}>
              {adminStatusFilter === "pending"
                ? "No applications are currently awaiting approval. Everything is up to date!"
                : "No accounts match the selected status filter."}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Administrator Profile</th>
                  <th>Department & Designation</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((item) => {
                  const isCurrentAdmin = item.id === admin?.id;
                  const isPending = item.status === "pending";

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="admin-user-cell">
                          {item.avatar_url ? (
                            <img src={item.avatar_url} alt={item.name} className="admin-user-avatar" />
                          ) : (
                            <div className="admin-user-avatar-fallback">
                              {(item.name || "A").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="admin-user-names">
                            <span className="admin-user-name">
                              {item.name} {isCurrentAdmin && <small style={{ color: "#0284c7" }}>(You)</small>}
                            </span>
                            <span className="admin-user-handle">
                              {item.username ? `@${item.username}` : item.email}
                            </span>
                            <div className="admin-badge-provider">
                              {item.auth_provider === "google" ? (
                                <span>Google OAuth</span>
                              ) : (
                                <span>Local Password</span>
                              )}
                              <span>&bull; {item.email}</span>
                            </div>
                            {item.request_reason && (
                              <div className="admin-user-reason-quote" title={item.request_reason}>
                                <em>"{item.request_reason}"</em>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "13px" }}>
                          {item.department || "General"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {item.designation || "Not specified"}
                          {item.phone && <span> &bull; {item.phone}</span>}
                        </div>
                      </td>

                      <td>
                        <span className={`admin-badge-status ${item.status || "approved"}`}>
                          {item.status === "pending" && <Clock size={12} />}
                          {item.status === "approved" && <Check size={12} />}
                          {item.status === "rejected" && <X size={12} />}
                          {item.status || "approved"}
                        </span>
                        {item.status === "rejected" && item.rejection_reason && (
                          <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "3px" }}>
                            {item.rejection_reason}
                          </div>
                        )}
                        {item.approved_by_name && (
                          <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "3px" }}>
                            Approved by: {item.approved_by_name}
                          </div>
                        )}
                      </td>

                      <td>
                        <span className={`admin-badge-role ${item.role}`}>
                          {item.role === "superadmin" ? "Main Administrator" : "Admin"}
                        </span>
                      </td>

                      <td style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>
                        <div>{item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}</div>
                        {item.last_login_at && (
                          <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>
                            Last login: {new Date(item.last_login_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="admin-btn-action-group" style={{ justifyContent: "flex-end" }}>
                          {/* Pending actions */}
                          {isPending && (
                            <>
                              <button
                                type="button"
                                className="admin-btn-approve"
                                onClick={() => handleApproveAdmin(item.id, item.name)}
                                title="Approve registration request"
                              >
                                <Check size={14} /> Approve
                              </button>
                              <button
                                type="button"
                                className="admin-btn-reject"
                                onClick={() => handleOpenRejectModal(item)}
                                title="Reject registration request"
                              >
                                <X size={14} /> Decline
                              </button>
                            </>
                          )}

                          {/* Approved actions */}
                          {!isPending && !isCurrentAdmin && (
                            <>
                              <button
                                type="button"
                                className="admin-btn-outline"
                                onClick={() => handleToggleAdminStatus(item.id, item.is_active, item.name)}
                                title={item.is_active ? "Suspend account" : "Re-activate account"}
                              >
                                {item.is_active ? "Suspend" : "Activate"}
                              </button>

                              <button
                                type="button"
                                className="admin-btn-outline"
                                onClick={() => handleUpdateAdminRole(item.id, item.role, item.name)}
                                title={item.role === "superadmin" ? "Demote to admin" : "Promote to Main Administrator"}
                              >
                                {item.role === "superadmin" ? "Demote" : "Make Superadmin"}
                              </button>

                              <button
                                type="button"
                                className="admin-btn-outline danger"
                                onClick={() => handleDeleteAdmin(item.id, item.name)}
                                title="Delete administrator record"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Reject Reason Modal */}
        {rejectModal.open && (
          <div className="admin-reject-modal-overlay">
            <div className="admin-reject-modal-card">
              <div className="admin-reject-modal-header">
                <h3>Decline Administrator Application</h3>
                <button
                  type="button"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                  onClick={() => setRejectModal({ open: false, adminId: null, adminName: "", reason: "" })}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="admin-reject-modal-body">
                <p>
                  You are declining the registration request from <strong>{rejectModal.adminName}</strong>.
                  Please specify a reason for the institutional record:
                </p>

                <div className="admin-reject-preset-btns">
                  {[
                    "Unverified college credentials",
                    "Department already has an active coordinator",
                    "Duplicate account submission",
                    "Administrative verification failed",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="admin-reject-preset-btn"
                      onClick={() => setRejectModal((prev) => ({ ...prev, reason: preset }))}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  className="admin-reject-textarea"
                  placeholder="Enter rejection reason or select a preset above..."
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              <div className="admin-reject-modal-footer">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setRejectModal({ open: false, adminId: null, adminName: "", reason: "" })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-btn-reject"
                  onClick={handleConfirmReject}
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================================================
  // CATEGORIES MANAGEMENT SECTION
  // ==================================================

  const renderCategories = () => {
    const totalCategories = categories.length;
    const activeCount = categories.filter((c) => c.is_active).length;
    const totalTaggedItems = categories.reduce((sum, c) => sum + (c.item_count || 0), 0);

    return (
      <div className="admin-cat-container">
        {sectionHeader(
          "Categories Management System",
          "Master taxonomies, tags, badges and dynamic filtering across all college website pages."
        )}

        {/* Target Module Filter Tabs */}
        <div className="admin-cat-page-tabs">
          {CATEGORY_PAGE_TARGETS.map((tab) => {
            const Icon = tab.icon;
            const count = tab.id === "all"
              ? categories.length
              : categories.filter((c) => c.target_page === tab.id).length;
            const isTabActive = categoryPageTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                className={`admin-cat-page-tab ${isTabActive ? "active" : ""}`}
                onClick={() => setCategoryPageTab(tab.id)}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                <span className="tab-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Stats Ribbon */}
        <div className="admin-cat-stats-row">
          <div className="admin-cat-stat-card">
            <div className="admin-cat-stat-icon" style={{ background: "#faecec", color: "#800000" }}>
              <Tags size={22} />
            </div>
            <div className="admin-cat-stat-info">
              <span>Total Categories</span>
              <strong>{totalCategories}</strong>
            </div>
          </div>

          <div className="admin-cat-stat-card">
            <div className="admin-cat-stat-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
              <CheckCircle2 size={22} />
            </div>
            <div className="admin-cat-stat-info">
              <span>Active Categories</span>
              <strong>{activeCount}</strong>
            </div>
          </div>

          <div className="admin-cat-stat-card">
            <div className="admin-cat-stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <Sparkles size={22} />
            </div>
            <div className="admin-cat-stat-info">
              <span>Tagged Content Items</span>
              <strong>{totalTaggedItems}</strong>
            </div>
          </div>

          <div className="admin-cat-stat-card">
            <div className="admin-cat-stat-icon" style={{ background: "#fdf4ff", color: "#a855f7" }}>
              <Layers size={22} />
            </div>
            <div className="admin-cat-stat-info">
              <span>Covered Modules</span>
              <strong>7 Pages</strong>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="admin-cat-toolbar">
          <div className="admin-cat-toolbar-left">
            <div className="admin-cat-search-wrap">
              <Search size={15} color="#64748b" />
              <input
                type="text"
                placeholder="Search categories, slugs, descriptions..."
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
              />
              {categorySearchQuery && (
                <button
                  type="button"
                  className="admin-cat-search-clear"
                  onClick={() => setCategorySearchQuery("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              className="admin-cat-filter-select"
              value={categoryFilterStatus}
              onChange={(e) => setCategoryFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <select
              className="admin-cat-filter-select"
              value={categorySortBy}
              onChange={(e) => setCategorySortBy(e.target.value)}
            >
              <option value="order">Sort: Display Order</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="count">Sort: Most Tagged Items</option>
            </select>
          </div>

          <div className="admin-cat-toolbar-right">
            <button
              type="button"
              className="admin-cat-seed-btn"
              onClick={handleSeedDefaults}
              title="Ensure all standard pre-configured categories exist"
            >
              <RefreshCw size={14} />
              Seed Defaults
            </button>

            <button
              type="button"
              className="admin-cat-add-btn"
              onClick={() => {
                setEditingCategory(null);
                setCategoryForm({
                  ...initialCategoryForm,
                  target_page: categoryPageTab === "all" ? "events" : categoryPageTab,
                  sort_order: categories.filter((c) => categoryPageTab === "all" || c.target_page === categoryPageTab).length + 1,
                });
                setShowCategoryModal(true);
              }}
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
        </div>

        {/* Categories Cards Grid */}
        {filteredCategoriesList.length === 0 ? (
          <div className="admin-panel-card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <Tags size={40} color="#94a3b8" style={{ marginBottom: "12px" }} />
            <h3 style={{ margin: "0 0 6px", color: "#334155" }}>No Categories Found</h3>
            <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "13.5px" }}>
              {categorySearchQuery
                ? `No categories match "${categorySearchQuery}". Try clearing search.`
                : "No categories configured for this section yet. Click 'Add Category' or 'Seed Defaults'."}
            </p>
            <button
              type="button"
              className="admin-cat-add-btn"
              style={{ margin: "0 auto" }}
              onClick={() => {
                setEditingCategory(null);
                setCategoryForm({
                  ...initialCategoryForm,
                  target_page: categoryPageTab === "all" ? "events" : categoryPageTab,
                });
                setShowCategoryModal(true);
              }}
            >
              <Plus size={16} />
              Add First Category
            </button>
          </div>
        ) : (
          <div className="admin-cat-grid">
            {filteredCategoriesList.map((cat) => {
              const targetMeta = CATEGORY_PAGE_TARGETS.find((t) => t.id === cat.target_page) || {
                label: cat.target_page,
                badgeColor: "#64748b",
              };
              const hasItems = (cat.item_count || 0) > 0;

              return (
                <div key={cat.id} className="admin-cat-card">
                  <div
                    className="admin-cat-card-accent-bar"
                    style={{ background: cat.color || "#800000" }}
                  />

                  <div className="admin-cat-card-content">
                    <div className="admin-cat-card-header">
                      <div className="admin-cat-header-main">
                        <div
                          className="admin-cat-icon-badge"
                          style={{
                            background: `${cat.color || "#800000"}18`,
                            color: cat.color || "#800000",
                          }}
                        >
                          {renderCategoryIconHelper(cat.icon, 20)}
                        </div>

                        <div className="admin-cat-title-block">
                          <h4>{cat.name}</h4>
                          <span className="admin-cat-slug">#{cat.slug || cat.name.toLowerCase()}</span>
                        </div>
                      </div>

                      <span
                        className="admin-cat-target-pill"
                        style={{
                          background: `${targetMeta.badgeColor}15`,
                          color: targetMeta.badgeColor,
                        }}
                      >
                        {targetMeta.label}
                      </span>
                    </div>

                    <p className="admin-cat-desc">
                      {cat.description || "No description provided for this category."}
                    </p>
                  </div>

                  <div className="admin-cat-card-footer">
                    <div className={`admin-cat-usage-pill ${hasItems ? "has-items" : ""}`}>
                      <Hash size={13} />
                      <span>{cat.item_count || 0} {targetMeta.label}</span>
                    </div>

                    <div className="admin-cat-card-actions">
                      <button
                        type="button"
                        className={`admin-cat-status-btn ${cat.is_active ? "active" : "inactive"}`}
                        onClick={() => handleToggleCategoryStatus(cat)}
                        title="Click to toggle active status on public pages"
                      >
                        <Power size={12} />
                        {cat.is_active ? "Active" : "Hidden"}
                      </button>

                      <button
                        type="button"
                        className="admin-cat-icon-action-btn"
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryForm({
                            target_page: cat.target_page,
                            name: cat.name,
                            slug: cat.slug || "",
                            description: cat.description || "",
                            color: cat.color || "#800000",
                            icon: cat.icon || "Tag",
                            sort_order: cat.sort_order || 0,
                            is_active: Boolean(cat.is_active),
                          });
                          setShowCategoryModal(true);
                          setError("");
                          setSuccess("");
                        }}
                        title="Edit Category"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        className="admin-cat-icon-action-btn delete"
                        onClick={() => handleDeleteCategory(cat)}
                        title="Delete Category"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add / Edit Category Modal */}
        {showCategoryModal && (
          <div className="admin-cat-modal-overlay" onClick={() => setShowCategoryModal(false)}>
            <div className="admin-cat-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="admin-cat-modal-header">
                <h3>
                  <Tags size={18} color="#800000" />
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <button
                  type="button"
                  className="admin-icon-btn"
                  onClick={() => setShowCategoryModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveCategory}>
                <div className="admin-cat-modal-body">
                  <div className="admin-cat-form-group">
                    <label>Target Page / Section *</label>
                    <select
                      value={categoryForm.target_page}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, target_page: e.target.value })
                      }
                      required
                    >
                      {CATEGORY_PAGE_TARGETS.filter((t) => t.id !== "all").map((target) => (
                        <option key={target.id} value={target.id}>
                          {target.label} ({target.desc})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-cat-form-group">
                    <label>Category Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Artificial Intelligence, State Sports, Campus Placement"
                      value={categoryForm.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        const autoSlug = newName
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, "")
                          .replace(/[\s_-]+/g, "-")
                          .replace(/^-+|-+$/g, "");
                        setCategoryForm({
                          ...categoryForm,
                          name: newName,
                          slug: editingCategory ? categoryForm.slug : autoSlug,
                        });
                      }}
                      required
                    />
                  </div>

                  <div className="admin-cat-form-group">
                    <label>Slug (URL identifier)</label>
                    <input
                      type="text"
                      placeholder="e.g. artificial-intelligence"
                      value={categoryForm.slug}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, slug: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-cat-form-group">
                    <label>Description</label>
                    <textarea
                      rows="2"
                      placeholder="Brief details about what items belong under this category..."
                      value={categoryForm.description}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-cat-form-group">
                    <label>Category Color</label>
                    <div className="admin-cat-color-presets">
                      {PRESET_CATEGORY_COLORS.map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          className={`admin-cat-color-btn ${categoryForm.color === preset.hex ? "selected" : ""}`}
                          style={{ background: preset.hex }}
                          onClick={() => setCategoryForm({ ...categoryForm, color: preset.hex })}
                          title={preset.name}
                        >
                          {categoryForm.color === preset.hex && <Check size={14} />}
                        </button>
                      ))}
                      <input
                        type="color"
                        value={categoryForm.color || "#800000"}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, color: e.target.value })
                        }
                        style={{
                          width: "32px",
                          height: "32px",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          borderRadius: "50%",
                        }}
                        title="Custom Color"
                      />
                    </div>
                  </div>

                  <div className="admin-cat-form-group">
                    <label>Category Icon</label>
                    <div className="admin-cat-icon-grid">
                      {PRESET_CATEGORY_ICONS.map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          className={`admin-cat-icon-select-btn ${categoryForm.icon === iconName ? "selected" : ""}`}
                          onClick={() => setCategoryForm({ ...categoryForm, icon: iconName })}
                          title={iconName}
                        >
                          {renderCategoryIconHelper(iconName, 17)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="admin-cat-form-group">
                      <label>Display Sort Order</label>
                      <input
                        type="number"
                        value={categoryForm.sort_order}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            sort_order: parseInt(e.target.value, 10) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="admin-cat-form-group" style={{ justifyContent: "center" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "24px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={categoryForm.is_active}
                          onChange={(e) =>
                            setCategoryForm({ ...categoryForm, is_active: e.target.checked })
                          }
                          style={{ width: "16px", height: "16px" }}
                        />
                        Active on Public Website
                      </label>
                    </div>
                  </div>

                  {/* Real-time Public Tag Preview */}
                  <div className="admin-cat-form-group">
                    <label>Real-Time Public Tag Preview</label>
                    <div className="admin-cat-preview-box">
                      <div
                        className="admin-cat-preview-pill"
                        style={{
                          background: `${categoryForm.color || "#800000"}18`,
                          color: categoryForm.color || "#800000",
                          border: `1.5px solid ${categoryForm.color || "#800000"}35`,
                        }}
                      >
                        {renderCategoryIconHelper(categoryForm.icon, 16)}
                        <span>{categoryForm.name || "Category Name"}</span>
                      </div>
                      <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                        Page: <strong>{categoryForm.target_page}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="admin-cat-modal-footer">
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={() => setShowCategoryModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-cat-add-btn"
                    disabled={savingCategory}
                  >
                    <Save size={16} />
                    {savingCategory ? "Saving..." : editingCategory ? "Update Category" : "Save Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Warning Modal */}
        {categoryDeleteModal.open && (
          <div className="admin-cat-modal-overlay">
            <div className="admin-reject-modal-card">
              <div className="admin-reject-modal-header">
                <h3>Warning: Category In Use</h3>
                <button
                  type="button"
                  className="admin-icon-btn"
                  onClick={() =>
                    setCategoryDeleteModal({ open: false, category: null, inUse: false, count: 0, force: false })
                  }
                >
                  <X size={18} />
                </button>
              </div>

              <div className="admin-reject-modal-body">
                <p>
                  Category <strong>"{categoryDeleteModal.category?.name}"</strong> is currently assigned to{" "}
                  <strong>{categoryDeleteModal.count}</strong> {categoryDeleteModal.category?.target_page} item(s).
                </p>
                <p style={{ color: "#b91c1c" }}>
                  Deleting it will remove the category tag from all associated content. Are you sure you want to proceed?
                </p>
              </div>

              <div className="admin-reject-modal-footer">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() =>
                    setCategoryDeleteModal({ open: false, category: null, inUse: false, count: 0, force: false })
                  }
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-btn-reject"
                  onClick={() => handleDeleteCategory(categoryDeleteModal.category, true)}
                >
                  Force Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================================================
  // ACTIVE CONTENT
  // ==================================================

  const renderContent = () => {
    switch (activeSection) {
      case "Categories":
        return renderCategories();

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

      case "Admin Approvals":
        return renderAdminApprovals();

      default:
        return renderDashboard();
    }
  };

  // ==================================================
  // MAIN LAYOUT
  // ==================================================

  const getCategoryIconHelper = (name) => {
    switch (name) {
      case "Dashboard": return <LayoutDashboard size={18} />;
      case "Categories": return <Tags size={18} />;
      case "Notices": return <Bell size={18} />;
      case "Events": return <CalendarDays size={18} />;
      case "Departments": return <Building2 size={18} />;
      case "Faculty": return <GraduationCap size={18} />;
      case "Placements": return <BriefcaseBusiness size={18} />;
      case "Gallery": return <ImageIcon size={18} />;
      case "Contact": return <Contact size={18} />;
      case "Alumni": return <Users size={18} />;
      case "Admin Approvals": return <ShieldCheck size={18} />;
      default: return <LayoutDashboard size={18} />;
    }
  };

  const getCategoryCountHelper = (name) => {
    switch (name) {
      case "Categories": return `${categories.length} Total`;
      case "Notices": return notices.length;
      case "Events": return events.length;
      case "Departments": return departments.length;
      case "Faculty": return (managedContent.Faculty || []).length;
      case "Placements": return (managedContent.Placements || []).length;
      case "Gallery": return (managedContent.Gallery || []).length;
      case "Alumni": return alumni.length;
      case "Contact": return (managedContent.Contact || []).length > 0 ? "1" : "0";
      case "Admin Approvals": return pendingAdminCount > 0 ? `${pendingAdminCount} Pending` : `${adminUsersCounts.approved || 1} Active`;
      default: return "Active";
    }
  };

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
              {item === "Admin Approvals" && pendingAdminCount > 0 && (
                <span
                  style={{
                    marginLeft: "6px",
                    background: "#f59e0b",
                    color: "#ffffff",
                    borderRadius: "999px",
                    padding: "1px 6px",
                    fontSize: "10.5px",
                    fontWeight: "800",
                  }}
                >
                  {pendingAdminCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <main className="admin-main-panel">
          <header className="admin-topbar">
            <div className="admin-topbar-left">
              <div className="admin-category-selector" ref={categoryDropdownRef}>
                <button
                  type="button"
                  className={`admin-category-dropdown-btn ${categoryDropdownOpen ? "open" : ""}`}
                  onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                  title="Switch Module / Page Category"
                  aria-expanded={categoryDropdownOpen}
                >
                  <div className="admin-category-btn-left">
                    <span className="admin-category-label">Active Section</span>
                    <div className="admin-category-current">
                      <span className="category-current-icon">
                        {getCategoryIconHelper(activeSection)}
                      </span>
                      <h2>{activeSection}</h2>
                    </div>
                  </div>
                  <div className="admin-category-btn-right">
                    <span className="admin-category-count-badge">
                      {getCategoryCountHelper(activeSection)}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`chevron-icon ${categoryDropdownOpen ? "rotated" : ""}`}
                    />
                  </div>
                </button>

                {categoryDropdownOpen && (
                  <div className="admin-category-dropdown-menu">
                    <div className="admin-category-dropdown-header">
                      <div className="dropdown-search-wrap">
                        <Search size={15} />
                        <input
                          type="text"
                          placeholder="Search modules & pages..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        {categorySearch && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategorySearch("");
                            }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="admin-category-dropdown-list">
                      {filteredAdminCategories.map((item) => {
                        const isSelected = activeSection === item.name;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            className={`admin-category-item ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              setActiveSection(item.name);
                              setCategoryDropdownOpen(false);
                              setCategorySearch("");
                              setSearch("");
                              setError("");
                              setSuccess("");
                              setShowManagedForm(false);
                            }}
                          >
                            <span className="category-item-icon">
                              {getCategoryIconHelper(item.name)}
                            </span>
                            <div className="category-item-info">
                              <div className="category-item-title-row">
                                <span className="category-item-name">{item.label}</span>
                                {isSelected && (
                                  <Check size={16} className="category-check" />
                                )}
                              </div>
                              <span className="category-item-desc">{item.desc}</span>
                            </div>
                            <span className="category-item-badge">
                              {getCategoryCountHelper(item.name)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-topbar-user-badge">
              <div className="admin-topbar-user-avatar">
                {admin?.avatar_url ? (
                  <img src={admin.avatar_url} alt={admin.name} />
                ) : (
                  <span>{(admin?.name || "M").charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="admin-topbar-user-details">
                <span className="admin-topbar-welcome-text">Welcome,</span>
                <strong className="admin-topbar-name">
                  {admin?.name || (isSuper ? "Main Administrator" : "Administrator")}
                </strong>
              </div>
              <span className={`admin-topbar-role ${admin?.role || "admin"}`}>
                {admin?.role === "superadmin" ? "Main Admin" : "Admin"}
              </span>
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