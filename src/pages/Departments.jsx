import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  Radio,
  Zap,
  Settings,
  Building2,
  Car,
  Pill,
  ArrowRight,
} from "lucide-react";

import "./Departments.css";
import API_BASE_URL from "../apiConfig";

const departments = [
  {
    code: "CSE",
    title: "Computer Science & Engineering",
    text: "Programming, software development, databases, networking and modern computing technologies.",
    icon: Cpu,
    link: "/departments/cse",
  },
  {
    code: "ECE",
    title: "Electronics & Communication Engineering",
    text: "Electronic circuits, communication systems, embedded systems and modern electronics.",
    icon: Radio,
    link: "/departments/ece",
  },
  {
    code: "EEE",
    title: "Electrical & Electronics Engineering",
    text: "Electrical systems, machines, power systems, control systems and renewable energy.",
    icon: Zap,
    link: "/departments/eee",
  },
  {
    code: "ME",
    title: "Mechanical Engineering",
    text: "Machine design, manufacturing, thermodynamics, CAD/CAM and workshop technology.",
    icon: Settings,
    link: "/departments/mechanical",
  },
  {
    code: "CE",
    title: "Civil Engineering",
    text: "Construction, surveying, structural engineering, transportation and infrastructure.",
    icon: Building2,
    link: "/departments/civil",
  },
  {
    code: "AE",
    title: "Automobile Engineering",
    text: "Engine technology, auto electronics, vehicle dynamics, servicing and electric vehicle systems.",
    icon: Car,
    link: "/departments/automobile",
  },
  {
    code: "D.PHARM",
    title: "Pharmacy",
    text: "Pharmaceutics, medicinal chemistry, pharmacognosy, pharmacology and clinical drug administration.",
    icon: Pill,
    link: "/departments/pharmacy",
  },
];

function Departments() {
  const [departmentRecords, setDepartmentRecords] = useState(departments);

  useEffect(() => {
    let active = true;

    fetch(`${API_BASE_URL}/api/departments`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load departments.");
        }
        return result.departments;
      })
      .then((records) => {
        if (active && Array.isArray(records)) {
          setDepartmentRecords(
            records.filter((department) => department.is_active !== false && Number(department.is_active) !== 0)
          );
        }
      })
      .catch((error) => {
        console.error("Department content API error:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const iconByCode = {
    CSE: Cpu,
    ECE: Radio,
    EEE: Zap,
    ME: Settings,
    MECH: Settings,
    CE: Building2,
    CIVIL: Building2,
    AE: Car,
    AUTO: Car,
    "D.PHARM": Pill,
    PHARMACY: Pill,
  };
  const pathByCode = {
    CSE: "/departments/cse",
    ECE: "/departments/ece",
    EEE: "/departments/eee",
    ME: "/departments/mechanical",
    MECH: "/departments/mechanical",
    CE: "/departments/civil",
    CIVIL: "/departments/civil",
    AE: "/departments/automobile",
    AUTO: "/departments/automobile",
    "D.PHARM": "/departments/pharmacy",
    PHARMACY: "/departments/pharmacy",
  };
  const displayDepartments = departmentRecords.map((department) => {
    const code = department.department_code || department.code;
    const normalizedCode = String(code || "").toUpperCase();
    return {
      code,
      title: department.department_name || department.title,
      text: department.description || department.text || "Explore the academic department, facilities and course information.",
      icon: iconByCode[normalizedCode] || Building2,
      link: pathByCode[normalizedCode],
      image: department.image,
      hodName: department.hod_name,
      intake: department.intake,
    };
  });

  return (
    <main className="departments-page">

      {/* HERO SECTION */}
      <section className="site-hero departments-hero">
        <div className="departments-hero-content">

          <span className="section-label">
            ACADEMICS
          </span>

          <h1>Departments</h1>

          <p>
            Explore the academic departments of Government
            Polytechnic College, Masab Tank and discover their
            courses, facilities and practical learning opportunities.
          </p>

        </div>

        <div className="hero-circle hero-circle-one" />
        <div className="hero-circle hero-circle-two" />
      </section>


      {/* DEPARTMENTS GRID SECTION */}
      <section className="departments-section">

        <div className="departments-heading">

          <span className="section-label dark">
            OUR ACADEMIC DEPARTMENTS
          </span>

          <h2>Choose Your Department</h2>

          <p>
            Select a department to explore its academic information,
            laboratories and learning areas.
          </p>

        </div>


        <div className="departments-grid">

          {displayDepartments.map((department) => {
            const Icon = department.icon;

            return (
              <article
                className="department-card available"
                key={department.code}
              >

                <div className="department-icon">
                  {department.image ? (
                    <img src={department.image} alt="" />
                  ) : (
                    <Icon size={28} />
                  )}
                </div>

                <span className="department-code">
                  {department.code}
                </span>

                <h3>{department.title}</h3>

                <p>{department.text}</p>

                {(department.hodName || Number(department.intake) > 0) && (
                  <div className="department-card-meta">
                    {department.hodName && <span>Head of section: {department.hodName}</span>}
                    {Number(department.intake) > 0 && <span>Annual intake: {department.intake}</span>}
                  </div>
                )}

                {department.link ? (
                  <Link to={department.link} className="department-button">
                    Explore Department
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <span className="department-button">Department details coming soon</span>
                )}

              </article>
            );
          })}

        </div>

      </section>

    </main>
  );
}

export default Departments;