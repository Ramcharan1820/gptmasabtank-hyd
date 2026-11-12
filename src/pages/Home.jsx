import { useEffect, useState } from "react";
import "./Home.css";

const heroSlides = [
  {
    image: "/images/hero-1.jpg",
    title: (
      <>
        Government Polytechnic
        <br />
        College, Masab Tank
      </>
    ),
    description:
      "Quality technical education, practical learning and opportunities for a better future.",
  },
  {
    image: "/images/hero-2.jpg",
    title: (
      <>
        Excellence in
        <br />
        Technical Education
      </>
    ),
    description:
      "Building knowledge, skills and confidence for successful technical careers.",
  },
  {
    image: "/images/hero-3.jpg",
    title: (
      <>
        Learn. Build.
        <br />
        Succeed.
      </>
    ),
    description:
      "A learning environment focused on practical education, innovation and student development.",
  },
  {
    image: "/images/hero-4.jpg",
    title: (
      <>
        Your Future
        <br />
        Starts Here
      </>
    ),
    description:
      "Discover opportunities, develop your skills and prepare for a brighter future.",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Notices
  const [notices, setNotices] = useState([]);
  const [currentNotice, setCurrentNotice] = useState(0);
  const [noticePaused, setNoticePaused] = useState(false);

  /* =========================================
     AUTOMATIC HERO SLIDESHOW
  ========================================= */

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((previousSlide) =>
        previousSlide === heroSlides.length - 1
          ? 0
          : previousSlide + 1
      );
    }, 5000);

    return () => clearInterval(slideTimer);
  }, []);

  /* =========================================
     FETCH NOTICES FROM MYSQL
  ========================================= */

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/notices"
        );

        const data = await response.json();

        if (data.success) {
          setNotices(data.data);
        } else {
          setNotices([]);
        }
      } catch (error) {
        console.error("Error fetching notices:", error);
        setNotices([]);
      }
    };

    fetchNotices();
  }, []);

  /* =========================================
     AUTOMATIC NOTICE CHANGE
  ========================================= */

  useEffect(() => {
    if (notices.length <= 1 || noticePaused) {
      return;
    }

    const noticeTimer = setInterval(() => {
      setCurrentNotice((previousNotice) =>
        previousNotice === notices.length - 1
          ? 0
          : previousNotice + 1
      );
    }, 20000);

    return () => clearInterval(noticeTimer);
  }, [notices, noticePaused]);

  /* =========================================
     NOTICE CONTROLS
  ========================================= */

  const previousNotice = () => {
    if (notices.length === 0) return;

    setCurrentNotice((previous) =>
      previous === 0
        ? notices.length - 1
        : previous - 1
    );
  };

  const nextNotice = () => {
    if (notices.length === 0) return;

    setCurrentNotice((previous) =>
      previous === notices.length - 1
        ? 0
        : previous + 1
    );
  };

  /* =========================================
     HERO CONTROLS
  ========================================= */

  const previousSlide = () => {
    setCurrentSlide((previousSlide) =>
      previousSlide === 0
        ? heroSlides.length - 1
        : previousSlide - 1
    );
  };

  const nextSlide = () => {
    setCurrentSlide((previousSlide) =>
      previousSlide === heroSlides.length - 1
        ? 0
        : previousSlide + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <main className="home">

      {/* =========================================
          FLASH NEWS
          DIRECTLY BELOW HEADER
      ========================================= */}

      <section className="flash-news">

        {/* FLASH NEWS LABEL */}
        <div className="flash-news-label">
          <span className="flash-news-icon">▸</span>
          <span>FLASH NEWS</span>
        </div>

        {/* NEWS CONTENT */}
        <div className="flash-news-content">

          {notices.length === 0 ? (
            <div className="flash-news-empty">
              No latest notices available
            </div>
          ) : (
            <div
              key={currentNotice}
              className={`flash-news-text ${
                noticePaused ? "paused" : ""
              }`}
            >
              <strong>
                {notices[currentNotice]?.title}
              </strong>

              {notices[currentNotice]?.description && (
                <>
                  <span className="flash-news-divider">
                    —
                  </span>

                  <span>
                    {notices[currentNotice].description}
                  </span>
                </>
              )}
            </div>
          )}

        </div>

        {/* NEWS CONTROLS */}
        <div className="flash-news-controls">

          <button
            type="button"
            onClick={previousNotice}
            aria-label="Previous notice"
            title="Previous notice"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() =>
              setNoticePaused(!noticePaused)
            }
            aria-label={
              noticePaused
                ? "Play notices"
                : "Pause notices"
            }
            title={
              noticePaused
                ? "Play"
                : "Pause"
            }
          >
            {noticePaused ? "▶" : "Ⅱ"}
          </button>

          <button
            type="button"
            onClick={nextNotice}
            aria-label="Next notice"
            title="Next notice"
          >
            ›
          </button>

        </div>

      </section>


      {/* =========================================
          HERO SLIDESHOW
      ========================================= */}

      <section className="site-hero hero">

        <div className="hero-slideshow">

          {heroSlides.map((slide, index) => (
            <div
              key={slide.image}
              className={`hero-slide ${
                index === currentSlide
                  ? "active"
                  : ""
              }`}
            >
              <img
                src={slide.image}
                alt={`Government Polytechnic College Masab Tank ${
                  index + 1
                }`}
              />
            </div>
          ))}

        </div>

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <span>
            GOVERNMENT OF TELANGANA
          </span>

          <h1>
            {heroSlides[currentSlide].title}
          </h1>

          <p>
            {heroSlides[currentSlide].description}
          </p>

          <div className="hero-buttons">

            <a href="/about">
              About College →
            </a>

            <a href="/departments">
              Our Departments
            </a>

          </div>

        </div>

        <button
          className="hero-arrow hero-arrow-left"
          onClick={previousSlide}
          aria-label="Previous slide"
        >
          ‹
        </button>

        <button
          className="hero-arrow hero-arrow-right"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          ›
        </button>

        <div className="hero-dots">

          {heroSlides.map((slide, index) => (
            <button
              key={slide.image}
              className={`hero-dot ${
                index === currentSlide
                  ? "active"
                  : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${
                index + 1
              }`}
            ></button>
          ))}

        </div>

      </section>


      {/* =========================================
          PRINCIPAL
      ========================================= */}

      <section className="principal">

        <div className="principal-photo">

          <img
            src="/principal.jpg"
            alt="Principal of Government Polytechnic College, Masab Tank"
          />

        </div>

        <div className="principal-info">

          <span>
            COLLEGE LEADERSHIP
          </span>

          <h2>
            Principal's Message
          </h2>

          <p>
            Our college is committed to providing quality
            technical education, practical skills and a strong
            foundation for students to build successful careers.
          </p>

          <h3>
            Principal
          </h3>

          <p>
            Government Polytechnic College, Masab Tank
          </p>

        </div>

      </section>


      {/* =========================================
          QUICK INFORMATION
      ========================================= */}

      <section className="quick-info">

        <div>
          <span>01</span>

          <h2>
            Academic Departments
          </h2>

          <p>
            Explore our technical departments and programmes.
          </p>
        </div>

        <div>
          <span>02</span>

          <h2>
            Placements
          </h2>

          <p>
            Training, recruiters and career opportunities.
          </p>
        </div>

        <div>
          <span>03</span>

          <h2>
            Events
          </h2>

          <p>
            College events, activities and programmes.
          </p>
        </div>

        <div>
          <span>04</span>

          <h2>
            Student Portal
          </h2>

          <p>
            Access attendance and academic results.
          </p>
        </div>

      </section>

    </main>
  );
}