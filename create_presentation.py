from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.dml import MSO_THEME_COLOR
from pptx.enum.text import MSO_AUTO_SIZE
from pathlib import Path

ROOT = Path(r"C:\college-website")
OUT = ROOT / "Advanced_Project_Submission_Presentation.pptx"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

MAROOON = RGBColor(128, 0, 0)
MAROOON_2 = RGBColor(158, 34, 34)
GOLD = RGBColor(210, 164, 74)
NAVY = RGBColor(20, 48, 78)
BLUE = RGBColor(45, 112, 160)
LIGHT_BLUE = RGBColor(235, 243, 249)
LIGHT_GOLD = RGBColor(249, 243, 228)
LIGHT_GRAY = RGBColor(246, 248, 251)
DARK = RGBColor(32, 42, 54)
WHITE = RGBColor(255, 255, 255)
GREEN = RGBColor(31, 139, 96)
RED = RGBColor(190, 57, 57)


def rect(slide, x, y, w, h, fill, radius=True, line=None):
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE,
        Inches(x), Inches(y), Inches(w), Inches(h)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    shape.line.color.rgb = line or fill
    return shape


def textbox(slide, text, x, y, w, h, size=18, color=DARK,
            bold=False, font="Aptos", align=PP_ALIGN.LEFT,
            valign=MSO_ANCHOR.TOP):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.vertical_anchor = valign
    p = tf.paragraphs[0]
    p.text = text
    p.alignment = align
    r = p.runs[0]
    r.font.name = font
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.color.rgb = color
    return box


def bullet_list(slide, items, x, y, w, h, size=16, color=DARK,
                bullet_color=MAROOON, level_gap=0.28):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = item
        p.level = 0
        p.space_after = Pt(8)
        p.font.name = "Aptos"
        p.font.size = Pt(size)
        p.font.color.rgb = color
        p.text = item
    return box


def title(slide, heading, section=None, number=None):
    rect(slide, 0, 0, 13.333, 0.14, MAROOON, radius=False)
    textbox(slide, heading, 0.65, 0.42, 10.9, 0.55, 28, NAVY, True)
    if section:
        textbox(slide, section.upper(), 11.5, 0.48, 1.25, 0.28, 9, MAROOON, True,
                align=PP_ALIGN.RIGHT)
    rect(slide, 0.65, 1.05, 12.03, 0.025, GOLD, radius=False)
    if number is not None:
        textbox(slide, f"{number:02d}", 12.15, 6.96, 0.5, 0.24, 9, MAROOON, True,
                align=PP_ALIGN.RIGHT)


def footer(slide):
    textbox(slide, "Government Polytechnic College, Masab Tank | Diploma CSE Project",
            0.65, 7.05, 8.5, 0.22, 8, RGBColor(115, 125, 137))


def add_image_contain(slide, path, x, y, w, h):
    pic = slide.shapes.add_picture(str(path), Inches(x), Inches(y),
                                   width=Inches(w), height=Inches(h))
    return pic


def add_card(slide, x, y, w, h, heading, body, accent=MAROOON):
    rect(slide, x, y, w, h, WHITE, True, RGBColor(220, 226, 232))
    rect(slide, x, y, 0.09, h, accent, radius=False)
    textbox(slide, heading, x + 0.28, y + 0.22, w - 0.48, 0.38, 17, NAVY, True)
    textbox(slide, body, x + 0.28, y + 0.66, w - 0.48, h - 0.78, 12.5, DARK)


# 1 — Title
slide = prs.slides.add_slide(prs.slide_layouts[6])
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = NAVY
rect(slide, 0, 0, 13.333, 7.5, NAVY, False)
rect(slide, 8.75, 0, 4.583, 7.5, MAROOON, False)
logo = ROOT / "public" / "college-logo.jpg"
if logo.exists():
    add_image_contain(slide, logo, 9.45, 0.55, 2.85, 2.85)
textbox(slide, "ADVANCED PROJECT\nSUBMISSION",
        0.78, 0.72, 7.55, 1.02, 22, GOLD, True)
textbox(slide, "Government Polytechnic College,\nMasab Tank — College Website",
        0.78, 1.82, 7.75, 1.44, 31, WHITE, True)
textbox(slide, "Responsive Institution Portal with Live SBTET Student Services",
        0.82, 3.42, 7.35, 0.62, 17, RGBColor(220, 230, 240), False)
rect(slide, 0.82, 4.24, 6.9, 0.025, GOLD, False)
textbox(slide, "Submitted by\n____________________________\nRoll Number: __________________",
        0.82, 4.52, 3.45, 1.32, 13, WHITE)
textbox(slide, "Guided by\n____________________________\nDepartment of CSE",
        4.55, 4.52, 3.2, 1.32, 13, WHITE)
textbox(slide, "Academic Year 2025–2026", 0.82, 6.72, 4.2, 0.3, 11, GOLD, True)

# 2 — Team and project details
slide = prs.slides.add_slide(prs.slide_layouts[6])
title(slide, "Project Information", "Overview", 2)
add_card(slide, 0.65, 1.35, 3.85, 1.48, "Institution",
         "Government Polytechnic College\nMasab Tank, Hyderabad, Telangana")
add_card(slide, 4.75, 1.35, 3.85, 1.48, "Programme",
         "Diploma in Computer Science & Engineering")
add_card(slide, 8.85, 1.35, 3.83, 1.48, "Project Category",
         "Full-Stack Web Application\nAcademic Information System")
textbox(slide, "PROJECT PROFILE", 0.65, 3.18, 3.0, 0.35, 11, MAROOON, True)
bullet_list(slide, [
    "Technology: React 19, Vite, Node.js and Express",
    "Data integration: Telangana SBTET REST services",
    "Media management: Cloudinary",
    "Backend content support: Express APIs and MySQL",
    "Deployment: Responsive web build and server-side rendering",
], 0.65, 3.60, 5.75, 2.35, 15)
rect(slide, 7.15, 3.18, 5.53, 2.85, LIGHT_BLUE, True)
textbox(slide, "Submission Details", 7.48, 3.50, 4.8, 0.38, 17, NAVY, True)
textbox(slide, "Project Title: College Website & Student Portal\n"
                "Submission: Major Project\n"
                "Presentation Type: IEEE-Style Technical Report\n"
                "Repository: gptmasabtank-hyd",
        7.48, 4.02, 4.75, 1.55, 13.5, DARK)
footer(slide)

# 3 — Abstract
slide = prs.slides.add_slide(prs.slide_layouts[6])
title(slide, "Abstract", "Overview", 3)
rect(slide, 0.65, 1.35, 8.05, 4.95, LIGHT_GRAY, True)
textbox(slide,
        "This project presents a responsive college web portal developed for Government "
        "Polytechnic College, Masab Tank, Hyderabad. The system centralizes institutional "
        "information including departments, faculty, placements, events, galleries, alumni "
        "and administrative updates. A dedicated Student Portal provides a secure interface "
        "for retrieving live attendance and examination results from official Telangana "
        "SBTET services.\n\n"
        "The application follows a React–Express–REST architecture. React provides an "
        "interactive, component-based frontend; Express acts as an intermediary API layer "
        "and validates requests; external SBTET endpoints supply live academic data. "
        "Cloudinary and MySQL-backed APIs support media and dynamic content management.",
        1.05, 1.82, 7.25, 3.72, 16, DARK)
rect(slide, 9.05, 1.35, 3.63, 4.95, NAVY, True)
textbox(slide, "KEY OUTCOMES", 9.38, 1.72, 3.0, 0.35, 12, GOLD, True)
for i, (num, text) in enumerate([
    ("01", "Centralized digital campus services"),
    ("02", "Live SBTET academic data"),
    ("03", "Responsive mobile-first interface"),
    ("04", "Role-based administrative tools"),
]):
    textbox(slide, num, 9.38, 2.28 + i*0.78, 0.55, 0.32, 12, GOLD, True)
    textbox(slide, text, 10.05, 2.24 + i*0.78, 2.08, 0.50, 12.5, WHITE)
footer(slide)

# 4 — Problem and objectives
slide = prs.slides.add_slide(prs.slide_layouts[6])
title(slide, "Problem Statement & Objectives", "Analysis", 4)
add_card(slide, 0.65, 1.40, 5.85, 2.05, "Problem Statement",
         "Students and visitors depend on fragmented institutional notices, official portals "
         "and manual communication channels. Static pages cannot present live academic "
         "attendance or examination information efficiently.",
         MAROOON)
add_card(slide, 6.83, 1.40, 5.85, 2.05, "Primary Aim",
         "Build a unified, responsive and maintainable college platform that integrates "
         "campus information with real-time Telangana SBTET academic services.",
         BLUE)
textbox(slide, "PROJECT OBJECTIVES", 0.65, 3.80, 3.0, 0.32, 11, MAROOON, True)
objectives = [
    ("O1", "Present institutional, departmental and faculty information"),
    ("O2", "Provide live attendance retrieval using student PIN"),
    ("O3", "Display mid and semester examination results"),
    ("O4", "Support events, media, placements and alumni content"),
    ("O5", "Enable authenticated administration and content control"),
]
for i, (key, body) in enumerate(objectives):
    x = 0.65 + (i % 3) * 4.05
    y = 4.28 + (i // 3) * 1.18
    rect(slide, x, y, 3.72, 0.88, WHITE, True, RGBColor(220,226,232))
    rect(slide, x, y, 0.62, 0.88, MAROOON if i < 3 else BLUE, True)
    textbox(slide, key, x+0.08, y+0.25, 0.46, 0.30, 10, WHITE, True, align=PP_ALIGN.CENTER)
    textbox(slide, body, x+0.78, y+0.16, 2.72, 0.58, 11.5, DARK, True)
footer(slide)

# 5 — Scope and features
slide = prs.slides.add_slide(prs.slide_layouts[6])
title(slide, "Scope, Modules & Features", "Analysis", 5)
modules = [
    ("01", "Public Website", "Home, About, Departments,\nFaculty, Placements, Events"),
    ("02", "Student Portal", "Attendance, Mid Results,\nSemester Results, Consolidated Memo"),
    ("03", "Alumni Module", "Alumni registration and\ninstitutional directory"),
    ("04", "Administration", "Login, approvals, notices,\ncontent and media management"),
]
for i, (num, heading, body) in enumerate(modules):
    x = 0.65 + i * 3.05
    rect(slide, x, 1.48, 2.78, 2.22, WHITE, True, RGBColor(220,226,232))
    textbox(slide, num, x+0.22, 1.68, 0.55, 0.36, 13, MAROOON, True)
    textbox(slide, heading, x+0.22, 2.16, 2.34, 0.38, 16, NAVY, True)
    textbox(slide, body, x+0.22, 2.62, 2.34, 0.82, 12.5, DARK)
rect(slide, 0.65, 4.12, 12.03, 2.15, NAVY, True)
textbox(slide, "SYSTEM BOUNDARY", 0.98, 4.46, 2.1, 0.32, 11, GOLD, True)
textbox(slide,
        "INCLUDED\nInstitutional website • SBTET API integration • Admin operations • Alumni registration • "
        "Responsive UI • Dynamic galleries",
        0.98, 4.92, 5.55, 0.82, 13.5, WHITE, True)
textbox(slide,
        "FUTURE / EXCLUDED\nPayment gateway • Mobile native app • On-premise database migration • "
        "Biometric enrollment",
        7.20, 4.92, 5.12, 0.82, 13.5, RGBColor(225,230,235), False)
footer(slide)

# 6 — Literature / gap analysis
slide = prs.slides.add_slide(prs.slide_layouts[6])
title(slide, "Existing Systems & Gap Analysis", "Research", 6)
columns = [("Traditional College Sites", ["Static information", "No live student data", "Limited administration"]),
           ("Official SBTET Portal", ["Authoritative academic data", "Complex navigation", "Not institution-branded"]),
           ("Proposed System", ["Unified public + student UI", "Live API gateway", "Campus content management"])]
for i, (heading, bullets) in enumerate(columns):
    x = 0.65 + i*4.04
    rect(slide, x, 1.42, 3.72, 4.75, WHITE, True, RGBColor(220,226,232))
    rect(slide, x, 1.42, 3.72, 0.72,
         MAROOON_2 if i == 0 else BLUE if i == 1 else GREEN, True)
    textbox(slide, heading, x+0.22, 1.62, 3.25, 0.30, 15, WHITE, True)
    bullet_list(slide, bullets, x+0.30, 2.50, 3.10, 2.40, 14)
    if i == 2:
        textbox(slide, "Result", x+0.30, 5.38, 0.55, 0.24, 11, GREEN, True)
        textbox(slide, "Centralized, data-driven experience",
                x+0.88, 5.34, 2.40, 0.42, 12, DARK, True)
footer(slide)

# 7 — Architecture
slide = prs.slides.add_slide(prs.slide_layouts[6])
title(slide, "System Architecture", "Design", 7)
boxes = [
    (0.55, "Student / Visitor", "Browser"),
    (3.15, "React Frontend", "Vite + Router"),
    (6.05, "Express API", "Validation + CORS"),
    (9.05, "SBTET Services", "Official REST APIs"),
]
for i, (x, heading, sub) in enumerate(boxes):
    rect(slide, x, 2.05, 2.15, 1.18,
         WHITE, True, MAROOON if i in (0,3) else BLUE)
    textbox(slide, heading, x+0.12, 2.30, 1.91, 0.30, 15, NAVY, True, align=PP_ALIGN.CENTER)
    textbox(slide, sub, x+0.12, 2.72, 1.91, 0.24, 10.5, DARK, align=PP_ALIGN.CENTER)
    if i < len(boxes)-1:
        rect(slide, x+2.25, 2.48, 0.62, 0.08, GOLD, False)
        textbox(slide, "→", x+2.31, 2.28, 0.48, 0.38, 17, GOLD, True, align=PP_ALIGN.CENTER)
rect(slide, 3.15, 4.10, 2.15, 1.05, LIGHT_BLUE, True)
textbox(slide, "MySQL / APIs", 3.34, 4.38, 1.78, 0.30, 14, NAVY, True, align=PP_ALIGN.CENTER)
textbox(slide, "Dynamic notices,\ncontent and media", 3.34, 4.78, 1.78, 0.36, 9.5, DARK, align=PP_ALIGN.CENTER)
rect(slide, 6.05, 4.10, 2.15, 1.05, LIGHT_GOLD, True)
textbox(slide, "Cloudinary", 6.34, 4.38, 1.58, 0.30, 14, NAVY, True, align=PP_ALIGN.CENTER)
textbox(slide, "Images and\noptimized uploads", 6.34, 4.78, 1.58, 0.36, 9.5, DARK, align=PP_ALIGN.CENTER)
textbox(slide,
        "Flow: PIN or result parameters → React request → Express route → SBTET API "
        "→ JSON processing → clean frontend response",
        2.05, 5.78, 9.20, 0.64, 13.5, DARK, True, align=PP_ALIGN.CENTER)
footer(slide)

# 8 — Technology
slide = prs.slides.add_slide(prs.slide_layouts[6])
title(slide, "Technology Stack", "Implementation", 8)
rect(slide, 0.65, 1.35, 3.75, 4.95, NAVY, True)
textbox(slide, "FRONTEND", 0.98, 1.72, 2.8, 0.30, 12, GOLD, True)
bullet_list(slide, ["React.js 19", "Vite 8", "JavaScript / JSX", "React Router", "Lucide React", "Fetch API"],
            0.98, 2.15, 2.80, 2.50, 15, WHITE)
rect(slide, 4.79, 1.35, 3.75, 4.95, LIGHT_BLUE, True)
textbox(slide, "BACKEND", 5.12, 1.72, 2.8, 0.30, 12, MAROOON, True)
bullet_list(slide, ["Node.js", "Express.js", "REST endpoints", "CORS", "dotenv", "JSON processing"],
            5.12, 2.15, 2.80, 2.50, 15, NAVY)
rect(slide, 8.93, 1.35, 3.75, 4.95, LIGHT_GOLD, True)
textbox(slide, "SERVICES & TOOLS", 9.26, 1.72, 3.0, 0.30, 12, MAROOON, True)
bullet_list(slide, ["SBTET web services", "Cloudinary", "MySQL-capable APIs", "Git / GitHub", "VS Code", "Browser DevTools"],
            9.26, 2.15, 2.80, 2.50, 15, NAVY)
footer(slide)

# 9 — Database / data model
slide = prs.slides.add_slide(prs.slide_layouts[6])
title(slide, "Data Model & API Processing", "Design", 9)
erd = ROOT / "erdplus (1).png"
if erd.exists():
    add_image_contain(slide, erd, 0.65, 1.35, 7.15, 5.25)
else:
    rect(slide, 0.65, 1.35, 7.15, 5.25, LIGHT_GRAY, True)
    textbox(slide, "ERD\n(Customer • Reservation • Room • Bill • Payment)",
            1.30, 3.20, 6.0, 1.10, 22, NAVY, True, align=PP_ALIGN.CENTER)
rect(slide, 8.12, 1.35, 4.56, 5.25, NAVY, True)
textbox(slide, "INTEGRATION DATA FLOW", 8.47, 1.72, 3.7, 0.32, 12, GOLD, True)
steps = [
    "1. Student supplies PIN / scheme / semester",
    "2. Express validates and forwards parameters",
    "3. SBTET responds with nested JSON",
    "4. Backend extracts required fields",
    "5. React renders cards and calendars",
]
for i, s in enumerate(steps):
    rect(slide, 8.47, 2.20+i*0.78, 3.86, 0.58,
         RGBColor(31, 67, 100), True)
    textbox(slide, s, 8.65, 2.34+i*0.78, 3.50, 0.24, 11.5, WHITE)
footer(slide)

# 10 — Home screenshot
slide = prs.slides.add_slide(prs.slide_layouts[6])
title(slide, "Implemented Interface — Home Page", "Demo", 10)
shot = ROOT / "files" / "home.png"
if shot.exists():
    rect(slide, 0.65, 1.28, 8.25, 5.15, RGBColor(220,226,232), True)
    add_image_contain(slide, shot, 0.78, 1.41, 7.99, 4.89)
rect(slide, 9.20, 1.28, 3.48, 5.15, NAVY, True)
textbox(slide, "FEATURE HIGHLIGHTS", 9.52, 1.67, 2.80, 0.32, 12, GOLD, True)
bullet_list(slide, [
    "Government-college branding",
    "Auto-rotating campus hero",
    "Flash news notices",
    "Leadership and principal message",
    "Quick academic navigation",
    "Responsive footer and contact details",
], 9.52, 2.15, 2.72, 3.22, 13.5, WHITE)
footer(slide)

# 11 — Student portal screenshot
slide = prs.slides.add_slide(prs.slide_layouts[6])
title(slide, "Student Services Portal", "Demo", 11)
shot = ROOT / "files" / "student-portal.png"
if shot.exists():
    rect(slide, 0.65, 1.28, 8.25, 5.15, RGBColor(220,226,232), True)
    add_image_contain(slide, shot, 0.78, 1.41, 7.99, 4.89)
rect(slide, 9.20, 1.28, 3.48, 5.15, LIGHT_BLUE, True)
textbox(slide, "INTEGRATED SERVICES", 9.52, 1.67, 2.82, 0.32, 12, MAROOON, True)
services = [
    "Student attendance",
    "Mid / semester results",
    "Consolidated academic memo",
    "SBTET syllabus",
    "Hall ticket and fee services",
    "Scholarship and POLYCET links",
]
bullet_list(slide, services, 9.52, 2.15, 2.72, 3.30, 13.5, NAVY)
footer(slide)

# 12 — Attendance and result
slide = prs.slides.add_slide(prs.slide_layouts[6])
title(slide, "Live Attendance & Result Interfaces", "Demo", 12)
for path, x, heading in [
    (ROOT/"files"/"attendance.png", 0.65, "Attendance"),
    (ROOT/"files"/"result.png", 6.78, "Examination Result"),
]:
    rect(slide, x, 1.35, 5.90, 4.72, RGBColor(220,226,232), True)
    if path.exists():
        add_image_contain(slide, path, x+0.13, 1.48, 5.64, 4.46)
    textbox(slide, heading, x+0.15, 6.15, 5.60, 0.30, 12, MAROOON, True,
            align=PP_ALIGN.CENTER)
footer(slide)

# 13 — Departments and admin
slide = prs.slides.add_slide(prs.slide_layouts[6])
title(slide, "Departments & Administration", "Demo", 13)
for path, x, heading in [
    (ROOT/"files"/"departments.png", 0.65, "Department Directory"),
    (ROOT/"files"/"admin-login.png", 6.78, "Admin Authentication"),
]:
    rect(slide, x, 1.35, 5.90, 4.72, RGBColor(220,226,232), True)
    if path.exists():
        add_image_contain(slide, path, x+0.13, 1.48, 5.64, 4.46)
    textbox(slide, heading, x+0.15, 6.15, 5.60, 0.30, 12, MAROOON, True,
            align=PP_ALIGN.CENTER)
footer(slide)

# 14 — Implementation and testing
slide = prs.slides.add_slide(prs.slide_layouts[6])
title(slide, "Implementation, Security & Testing", "Validation", 14)
rect(slide, 0.65, 1.38, 3.72, 4.95, NAVY, True)
textbox(slide, "IMPLEMENTATION", 0.98, 1.76, 3.0, 0.32, 12, GOLD, True)
bullet_list(slide, [
    "Component-based React structure",
    "React Router navigation",
    "Express proxy API routes",
    "Input validation and error handling",
    "Environment-based configuration",
    "Responsive breakpoints",
], 0.98, 2.20, 3.02, 3.20, 13.5, WHITE)
rect(slide, 4.76, 1.38, 3.72, 4.95, LIGHT_BLUE, True)
textbox(slide, "TESTING APPROACH", 5.09, 1.76, 3.0, 0.32, 12, MAROOON, True)
tests = [
    ("T1", "Desktop and mobile rendering"),
    ("T2", "Route and navigation validation"),
    ("T3", "PIN and result-form handling"),
    ("T4", "API success / failure behavior"),
    ("T5", "Admin authentication flow"),
]
for i, (tag, txt) in enumerate(tests):
    textbox(slide, tag, 5.09, 2.22+i*0.68, 0.42, 0.28, 10, MAROOON, True)
    textbox(slide, txt, 5.58, 2.18+i*0.68, 2.45, 0.38, 12.5, NAVY)
rect(slide, 8.87, 1.38, 3.81, 4.95, LIGHT_GOLD, True)
textbox(slide, "DESIGN CONSIDERATIONS", 9.20, 1.76, 3.12, 0.32, 12, MAROOON, True)
bullet_list(slide, [
    "No unnecessary student-data storage",
    "PIN is user-entered",
    "Secrets remain in environment variables",
    "Graceful upstream-SBTET errors",
    "CORS restricted through backend",
], 9.20, 2.20, 3.05, 3.12, 13, NAVY)
footer(slide)

# 15 — Conclusion / future / references
slide = prs.slides.add_slide(prs.slide_layouts[6])
title(slide, "Conclusion, Future Scope & References", "Closing", 15)
rect(slide, 0.65, 1.34, 4.15, 2.05, NAVY, True)
textbox(slide, "CONCLUSION", 0.98, 1.70, 2.8, 0.30, 12, GOLD, True)
textbox(slide,
        "The project demonstrates a practical full-stack solution that combines "
        "institutional information with live Telangana SBTET academic services.",
        0.98, 2.16, 3.48, 0.92, 13.5, WHITE)
rect(slide, 5.10, 1.34, 7.58, 2.05, LIGHT_BLUE, True)
textbox(slide, "FUTURE ENHANCEMENTS", 5.43, 1.70, 3.0, 0.30, 12, MAROOON, True)
textbox(slide,
        "PWA support • Native mobile app • Role-based analytics • Notifications • "
        "Additional academic dashboards • Automated test suite • Production monitoring",
        5.43, 2.16, 6.78, 0.92, 13.5, NAVY)
textbox(slide, "IEEE-STYLE REFERENCES", 0.65, 3.84, 3.4, 0.32, 12, MAROOON, True)
refs = [
    "[1] Meta Platforms, “React – A JavaScript library for building user interfaces,” 2026.",
    "[2] OpenJS Foundation, “Express – Fast, unopinionated, minimalist web framework for Node.js,” 2026.",
    "[3] SBTET Telangana, “Academic and examination web services,” https://sbtet.telangana.gov.in.",
    "[4] “Vite: Next Generation Frontend Tooling,” 2026.",
    "[5] Cloudinary, “Image and video API documentation,” 2026.",
]
for i, r in enumerate(refs):
    textbox(slide, r, 0.65, 4.28+i*0.42, 12.0, 0.34, 10.5, DARK)
textbox(slide, "THANK YOU  |  QUESTIONS",
        0.65, 6.54, 12.03, 0.42, 18, MAROOON, True, align=PP_ALIGN.CENTER)
footer(slide)

prs.save(OUT)
print(str(OUT))
