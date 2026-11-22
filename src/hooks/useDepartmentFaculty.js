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

    async function fetchDepartmentFaculty() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/content/faculty`);
        if (!response.ok) return;
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          const target = (departmentCode || "").toLowerCase().trim();

          const deptMatch = (fDept) => {
            if (!fDept) return false;
            const d = fDept.toLowerCase().trim();
            if (d === target) return true;
            if (target === "cse" && (d.includes("computer") || d.includes("cse"))) return true;
            if (target === "ece" && (d.includes("electronics") || d.includes("ece"))) return true;
            if (target === "eee" && (d.includes("electrical") || d.includes("eee"))) return true;
            if (target === "civil" && d.includes("civil")) return true;
            if (target === "mechanical" && (d.includes("mech") || d.includes("mechanical"))) return true;
            if (target === "automobile" && (d.includes("auto") || d.includes("automobile"))) return true;
            if (target === "pharmacy" && (d.includes("pharm") || d.includes("pharmacy"))) return true;
            return false;
          };

          const matched = result.data.filter((f) => deptMatch(f.department));

          if (matched.length > 0 && isMounted) {
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
        }
      } catch (err) {
        console.warn(`Failed to fetch faculty for ${departmentCode}:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDepartmentFaculty();

    return () => {
      isMounted = false;
    };
  }, [departmentCode]);

  return { faculty, loading };
}
