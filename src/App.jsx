import { Routes, Route, useLocation } from "react-router-dom";


/*admin login*/
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

/* Layout */
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

/* Main Pages */
import Home from "./pages/Home";
import About from "./pages/About";
import Departments from "./pages/Departments";
import Faculty from "./pages/Faculty";
import Placements from "./pages/Placements";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";

/* Student Portal */
import StudentPortal from "./pages/StudentPortal";
import Attendance from "./pages/Attendance";
import Result from "./pages/Result";
import ConsolidatedResult from "./pages/ConsolidatedResult";

/* Alumni */
import Alumni from "./pages/Alumni";
import AlumniAuth from "./pages/AlumniAuth";
import AlumniRegistration from "./pages/AlumniRegistration";

/* Department Pages */
import CSEDepartment from "./pages/CSEDepartment";
import ECEDepartment from "./pages/ECEDepartment";
import EEEDepartment from "./pages/EEEDepartment";
import MechanicalDepartment from "./pages/MechanicalDepartment";
import CivilDepartment from "./pages/CivilDepartment";
import AutomobileDepartment from "./pages/AutomobileDepartment";
import PharmacyDepartment from "./pages/PharmacyDepartment";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAdminLoginRoute = location.pathname === "/admin/login";
  const isAdminDashboardRoute = location.pathname === "/admin/dashboard";

  return (
    <>
      <ScrollToTop />

      {!isAdminLoginRoute && (
        <Header showNavigation={!isAdminDashboardRoute} />
      )}

      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/placements" element={<Placements />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />

        {/* Student Portal */}
        <Route path="/student-portal" element={<StudentPortal />} />
        <Route
          path="/student-portal/attendance"
          element={<Attendance />}
        />
        <Route path="/student-portal/result" element={<Result />} />
        <Route
          path="/student-portal/consolidated-result"
          element={<ConsolidatedResult />}
        />


        {/* Admin Pages */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Alumni */}
        <Route path="/alumni" element={<Alumni />} />
        <Route path="/alumni/register" element={<AlumniAuth />} />
        <Route
          path="/alumni/register/form"
          element={<AlumniRegistration />}
        />

        {/* Department Pages */}
        <Route
          path="/departments/cse"
          element={<CSEDepartment />}
        />

        <Route
          path="/departments/ece"
          element={<ECEDepartment />}
        />

        <Route
          path="/departments/eee"
          element={<EEEDepartment />}
        />

        <Route
          path="/departments/mechanical"
          element={<MechanicalDepartment />}
        />

        <Route
          path="/departments/civil"
          element={<CivilDepartment />}
        />

        <Route
          path="/departments/automobile"
          element={<AutomobileDepartment />}
        />

        <Route
          path="/departments/pharmacy"
          element={<PharmacyDepartment />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div
              style={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "10px",
                padding: "40px 20px",
                textAlign: "center",
              }}
            >
              <h1>404</h1>
              <p>Page not found.</p>
            </div>
          }
        />
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;