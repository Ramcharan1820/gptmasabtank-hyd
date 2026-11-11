export const SITE_URL =
  "https://gptmasabtank-hyd.tejayadavn.workers.dev";

export const SITE_NAME =
  "Government Polytechnic College, Masab Tank";

export const DEFAULT_TITLE =
  "Government Polytechnic College, Masab Tank | Hyderabad";

export const LOGO_URL =
  `${SITE_URL}/college-logo.jpg`;

export const DEFAULT_DESCRIPTION =
  "Learn about Government Polytechnic College, Masab Tank, Hyderabad, its technical education, academic departments, campus activities and student services.";

export const PUBLIC_PAGES = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },

  "/about": {
    title: "About Government Polytechnic College, Masab Tank",
    description:
      "Learn about Government Polytechnic College, Masab Tank, its focus on technical education, practical learning, student development and academic growth.",
  },

  "/departments": {
    title: "Academic Departments | Government Polytechnic College",
    description:
      "Explore the Computer Science, Electronics, Electrical, Mechanical, Civil, Automobile and Pharmacy departments at Government Polytechnic College, Masab Tank.",
  },

  "/departments/cse": {
    title: "Computer Science & Engineering | Government Polytechnic",
    description:
      "Explore Computer Science & Engineering at Government Polytechnic College, Masab Tank, with information on programming, computer systems, databases, networking and practical learning.",
  },

  "/departments/ece": {
    title: "Electronics & Communication Engineering | Government Polytechnic",
    description:
      "Learn about the Electronics & Communication Engineering department, including electronic circuits, communication systems, microcontrollers and laboratory learning.",
  },

  "/departments/eee": {
    title: "Electrical & Electronics Engineering | Government Polytechnic",
    description:
      "Learn about Electrical & Electronics Engineering at Government Polytechnic College, including circuits, machines, power systems, electronics and control systems.",
  },

  "/departments/mechanical": {
    title: "Mechanical Engineering | Government Polytechnic College",
    description:
      "Explore the Mechanical Engineering department's focus on machines, manufacturing processes, thermodynamics, workshops and practical engineering learning.",
  },

  "/departments/civil": {
    title: "Civil Engineering | Government Polytechnic College",
    description:
      "Learn about Civil Engineering at Government Polytechnic College, Masab Tank, including construction, surveying, structural engineering and infrastructure.",
  },

  "/departments/automobile": {
    title: "Automobile Engineering | Government Polytechnic College",
    description:
      "Explore Automobile Engineering at Government Polytechnic College, including vehicle systems, engine technology, practical workshops and electric vehicle technologies.",
  },

  "/departments/pharmacy": {
    title: "Pharmacy (D.Pharm) | Government Polytechnic College",
    description:
      "Learn about the Pharmacy department's D.Pharm information, pharmaceutical science, drug formulation, laboratory training and healthcare learning.",
  },

  "/faculty": {
    title: "Faculty & Academic Mentors | Government Polytechnic College",
    description:
      "View the principal and faculty directory at Government Polytechnic College, Masab Tank, with academic departments, qualifications and specializations.",
  },

  "/placements": {
    title: "Training & Placements | Government Polytechnic College",
    description:
      "Learn how the Training & Placement Cell supports students with career guidance, professional skills, training activities and industry interaction.",
  },

  "/events": {
    title: "College Programs & Events | Government Polytechnic College",
    description:
      "Explore the college activities page for technical, cultural, sports and student-development programs at Government Polytechnic College, Masab Tank.",
  },

  "/gallery": {
    title: "College Gallery & Campus Life | Government Polytechnic College",
    description:
      "Browse the Government Polytechnic College gallery for campus, laboratory, academic, event and student-activity images.",
  },

  "/contact": {
    title: "Contact & Location | Government Polytechnic College",
    description:
      "Find the location and enquiry information for Government Polytechnic College, Masab Tank, Hyderabad, Telangana.",
  },

  "/alumni": {
    title: "Alumni | Government Polytechnic College, Masab Tank",
    description:
      "Connect with alumni of Government Polytechnic College, Masab Tank, Hyderabad, and explore the college alumni community, achievements and opportunities.",
  },
};

export const PRIVATE_PAGE_TITLES = {
  "/student-portal":
    "Student Portal | Government Polytechnic College",

  "/student-portal/attendance":
    "Student Attendance | Government Polytechnic College",

  "/student-portal/result":
    "Student Results | Government Polytechnic College",

  "/student-portal/consolidated-result":
    "Consolidated Results | Government Polytechnic College",

  "/student-portal/result/mid":
    "Mid Results | Government Polytechnic College",

  "/student-portal/result/semester":
    "Semester Results | Government Polytechnic College",

  "/alumni/register":
    "Alumni Registration | Government Polytechnic College",

  "/alumni/register/form":
    "Complete Alumni Registration | Government Polytechnic College",
};

export const PRERENDER_ROUTES = [
  ...Object.keys(PUBLIC_PAGES),
  ...Object.keys(PRIVATE_PAGE_TITLES),
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function meta(attribute, key, content) {
  return `<meta ${attribute}="${escapeHtml(
    key
  )}" content="${escapeHtml(content)}" />`;
}

function canonicalLink(url) {
  return `<link rel="canonical" href="${escapeHtml(url)}" />`;
}

function homepageStructuredData() {
  const graph = [
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      logo: LOGO_URL,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Masab Tank, Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "IN",
      },
    },

    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "en",
    },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function renderSeoHead(pathname) {
  const routePath =
    pathname.replace(/\/+$/, "") || "/";

  const page = PUBLIC_PAGES[routePath];

  const isPrivate =
    Object.hasOwn(PRIVATE_PAGE_TITLES, routePath);

  const title =
    page?.title ||
    PRIVATE_PAGE_TITLES[routePath] ||
    DEFAULT_TITLE;

  const description =
    page?.description ||
    DEFAULT_DESCRIPTION;

  const canonicalUrl =
    new URL(
      page ? routePath : "/",
      SITE_URL
    ).href;

  const robots =
    page
      ? "index, follow"
      : "noindex, nofollow";

  const structuredData =
    routePath === "/" && page
      ? homepageStructuredData()
      : null;

  const tags = [
    `<title>${escapeHtml(title)}</title>`,

    meta(
      "name",
      "description",
      description
    ),

    meta(
      "name",
      "robots",
      robots
    ),

    canonicalLink(canonicalUrl),

    meta(
      "property",
      "og:type",
      "website"
    ),

    meta(
      "property",
      "og:site_name",
      SITE_NAME
    ),

    meta(
      "property",
      "og:title",
      title
    ),

    meta(
      "property",
      "og:description",
      description
    ),

    meta(
      "property",
      "og:url",
      canonicalUrl
    ),

    meta(
      "property",
      "og:image",
      LOGO_URL
    ),

    meta(
      "property",
      "og:image:alt",
      `${SITE_NAME} logo`
    ),

    meta(
      "property",
      "og:locale",
      "en_US"
    ),

    meta(
      "name",
      "twitter:card",
      "summary"
    ),

    meta(
      "name",
      "twitter:title",
      title
    ),

    meta(
      "name",
      "twitter:description",
      description
    ),

    meta(
      "name",
      "twitter:image",
      LOGO_URL
    ),
  ];

  if (structuredData) {
    tags.push(
      `<script type="application/ld+json">${JSON.stringify(
        structuredData
      ).replace(/</g, "\\u003c")}</script>`
    );
  }

  return {
    title,
    description,
    canonicalUrl,
    robots,
    structuredData,
    isPrivate,
    html: tags.join("\n    "),
  };
}