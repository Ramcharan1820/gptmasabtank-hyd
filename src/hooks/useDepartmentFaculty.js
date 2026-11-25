import { useState, useEffect } from "react";
import API_BASE_URL from "../apiConfig";

/**
 * Custom hook to dynamically fetch department-specific faculty from the database
 * with fallback to initial static data. Ensures newly added photos/details in the
 * Admin Dashboard automatically appear on the corresponding department pages.
 *
 * @param {string} departmentCode - e.g. "CSE", "ECE", "EEE", "Civil", "Mechanical", "Automobile", "Pharmacy"
 * @param {Array} initialFallback - Fallback static faculty list
 * @returns {{ faculty: Array, loading: boolean }}
 */
export default function useDepartmentFaculty(departmentCode, initialFallback = []) {
  const [faculty, setFaculty] = useState(initialFallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let controller;

    async function fetchDepartmentFaculty() {
      try {
        controller = new AbortController();
        const response = await fetch(`${API_BASE_URL}/api/content/faculty`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          const target = (departmentCode || "").toLowerCase().trim();
          const normalizedTarget =
            target === "humanities" ||
            target === "humanities and sciences" ||
            target === "humanities-and-sciences" ||
            target === "general" ||
            target === "hum"
              ? "general"
              : target;

          const deptMatch = (fDept) => {
            if (!fDept) return false;
            const d = fDept.toLowerCase().trim();
            const normalizedDepartment =
              d === "general" ||
              d === "humanities" ||
              d.includes("humanities and sciences")
                ? "general"
                : d;
            if (normalizedDepartment === normalizedTarget) return true;
            if (normalizedTarget === "cse" && (d.includes("computer") || d.includes("cse"))) return true;
            if (normalizedTarget === "ece" && (d.includes("electronics") || d.includes("ece"))) return true;
            if (normalizedTarget === "eee" && (d.includes("electrical") || d.includes("eee"))) return true;
            if (normalizedTarget === "civil" && d.includes("civil")) return true;
            if (normalizedTarget === "mechanical" && (d.includes("mech") || d.includes("mechanical"))) return true;
            if (normalizedTarget === "automobile" && (d.includes("auto") || d.includes("automobile"))) return true;
            if (normalizedTarget === "pharmacy" && (d.includes("pharm") || d.includes("pharmacy"))) return true;
            return false;
          };

          const matched = result.data.filter((f) => deptMatch(f.department));

          if (!isMounted) return;

          const formatted = matched.map((f, idx) => {
            const photoUrl =
              f.photo ||
              f.image ||
              "/images/faculty/faculty-placeholder.png";

            return {
              ...f,
              id: f.id || idx,
              name: f.name || "Faculty Member",
              designation: f.designation || "Lecturer",
              qualification: f.qualification || "Diploma / Degree in Engineering",
              joined: f.experience || f.joined || "Faculty",
              experience: f.experience || f.joined || "Faculty",
              image: photoUrl,
              photo: photoUrl,
              email: f.email || "gpthyd01@gmail.com",
              profile: f.profile && !f.profile.startsWith("mailto:") ? f.profile : "",
              employeeId: f.faculty_code || f.employeeId || "",
              specialization: f.specialization || "",
            };
          });

          setFaculty(formatted);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.warn(`Failed to fetch faculty for ${departmentCode}:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const handleFacultyUpdated = () => fetchDepartmentFaculty();

    fetchDepartmentFaculty();
    window.addEventListener("faculty-updated", handleFacultyUpdated);
    window.addEventListener("storage", handleFacultyUpdated);

    return () => {
      isMounted = false;
      controller?.abort();
      window.removeEventListener("faculty-updated", handleFacultyUpdated);
      window.removeEventListener("storage", handleFacultyUpdated);
    };
  }, [departmentCode]);

  return { faculty, loading };
}
