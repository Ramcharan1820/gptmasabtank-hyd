import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "./Gallery.css";

const galleryItems = [
  {
    title: "College Campus",
    category: "Campus",
    image: "/college-campus-1.jpg",
  },
  {
    title: "Computer Science Laboratory",
    category: "Laboratories",
    image: "/images/gallery/cse-lab.jpg",
  },
  {
    title: "Technical Activities",
    category: "Activities",
    image: "/images/gallery/technical.jpg",
  },
  {
    title: "Student Activities",
    category: "Students",
    image: "/images/gallery/students.jpg",
  },
  {
    title: "College Events",
    category: "Events",
    image: "/images/gallery/events.jpg",
  },
  {
    title: "Annual Celebrations",
    category: "Celebrations",
    image: "/images/gallery/celebration.jpg",
  },
  {
    title: "Sports Activities",
    category: "Sports",
    image: "/images/gallery/sports.jpg",
  },
  {
    title: "Seminars & Workshops",
    category: "Academic",
    image: "/images/gallery/workshop.jpg",
  },
];

function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);
  const [items, setItems] = useState(galleryItems);

  useEffect(() => {
    let active = true;

    fetch("http://localhost:5000/api/content/gallery")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load gallery.");
        }
        return result.data;
      })
      .then((records) => {
        if (active && Array.isArray(records)) {
          setItems(records);
        }
      })
      .catch((error) => {
        console.error("Gallery content API error:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(items.map((item) => item.category).filter(Boolean))],
    [items]
  );

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter(
          (item) => item.category === activeCategory
        );

  const currentIndex = selectedImage
    ? filteredItems.findIndex(
        (item) => item.image === selectedImage.image
      )
    : -1;

  const previousImage = () => {
    if (currentIndex > 0) {
      setSelectedImage(filteredItems[currentIndex - 1]);
    }
  };

  const nextImage = () => {
    if (currentIndex < filteredItems.length - 1) {
      setSelectedImage(filteredItems[currentIndex + 1]);
    }
  };

  return (
    <main className="gallery-page">

      {/* HERO */}
      <section className="site-hero gallery-hero">
        <div className="gallery-container">

          <span>COLLEGE GALLERY</span>

          <h1>
            Moments From
            <strong>Campus Life</strong>
          </h1>

          <p>
            Explore memorable moments, academic activities,
            celebrations, laboratories and student life at
            Government Polytechnic College, Masab Tank.
          </p>

        </div>
      </section>


      {/* GALLERY */}
      <section className="gallery-section">

        <div className="gallery-container">

          <div className="gallery-heading">
            <span>OUR CAMPUS</span>

            <h2>
              Explore Our Gallery
            </h2>

            <p>
              A collection of moments from college life and
              student activities.
            </p>
          </div>


          {/* FILTERS */}
          <div className="gallery-filters">

            {categories.map((category) => (
              <button
                key={category}
                className={
                  activeCategory === category
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveCategory(category)
                }
              >
                {category}
              </button>
            ))}

          </div>


          {/* GALLERY GRID */}
          <div className="gallery-grid">

            {filteredItems.map((item, index) => (
              <article
                className="gallery-card"
                key={index}
                onClick={() =>
                  setSelectedImage(item)
                }
              >

                <div className="gallery-image">

                  <img
                    src={item.image}
                    alt={item.title}
                  />

                  <div className="gallery-overlay">

                    <Image size={25} />

                    <span>
                      View Image
                    </span>

                  </div>

                </div>

                <div className="gallery-card-content">

                  <span>
                    {item.category}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                </div>

              </article>
            ))}

          </div>

        </div>

      </section>


      {/* LIGHTBOX */}
      {selectedImage && (
        <div
          className="gallery-lightbox"
          onClick={() => setSelectedImage(null)}
        >

          <button
            className="gallery-close"
            onClick={() => setSelectedImage(null)}
          >
            <X size={25} />
          </button>


          <button
            className="gallery-prev"
            onClick={(e) => {
              e.stopPropagation();
              previousImage();
            }}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={30} />
          </button>


          <div
            className="gallery-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >

            <img
              src={selectedImage.image}
              alt={selectedImage.title}
            />

            <div>
              <span>{selectedImage.category}</span>
              <h3>{selectedImage.title}</h3>
            </div>

          </div>


          <button
            className="gallery-next"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            disabled={
              currentIndex === filteredItems.length - 1
            }
          >
            <ChevronRight size={30} />
          </button>

        </div>
      )}

    </main>
  );
}

export default Gallery;