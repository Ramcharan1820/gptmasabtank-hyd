import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";

import "./Gallery.css";

function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/content/gallery");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load gallery photos.");
      }

      setItems(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Gallery content API error:", err);
      setError(err.message || "Failed to load gallery images.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(items.map((item) => item.category).filter(Boolean))],
    [items]
  );

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => (item.category || "").toLowerCase() === activeCategory.toLowerCase());

  const currentIndex = selectedImage
    ? filteredItems.findIndex(
        (item) => (item.image || item.photo || item.url) === (selectedImage.image || selectedImage.photo || selectedImage.url)
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
            <h2>Explore Our Gallery</h2>
            <p>
              A collection of moments from college life and student activities.
            </p>
          </div>

          {/* FILTERS */}
          <div className="gallery-filter-controls">
            <div className="gallery-category-dropdown-wrap">
              <label htmlFor="gallery-category-select">Category:</label>
              <select
                id="gallery-category-select"
                className="gallery-category-select"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? `All Categories (${items.length})` : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="gallery-filters">
              {categories.map((category) => {
                const count = category === "All"
                  ? items.length
                  : items.filter((it) => (it.category || "").toLowerCase() === category.toLowerCase()).length;
                return (
                  <button
                    key={category}
                    className={activeCategory === category ? "active" : ""}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="gallery-message">
              <RefreshCw size={36} className="events-spinner" />
              <p>Loading gallery photos from database...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="gallery-message error">
              <AlertCircle size={40} />
              <h3>Unable to Load Gallery</h3>
              <p>{error}</p>
              <button onClick={fetchGallery} className="gallery-retry-btn">
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY DATABASE STATE */}
          {!loading && !error && items.length === 0 && (
            <div className="gallery-message">
              <Image size={48} />
              <h3>No Gallery Photos Found</h3>
              <p>
                Photos uploaded through the Admin Dashboard will appear here automatically.
              </p>
            </div>
          )}

          {/* FILTERED EMPTY STATE */}
          {!loading && !error && items.length > 0 && filteredItems.length === 0 && (
            <div className="gallery-message">
              <Image size={48} />
              <h3>No Photos in "{activeCategory}"</h3>
              <p>Try selecting another category or view all categories.</p>
              <button
                type="button"
                className="gallery-retry-btn"
                onClick={() => setActiveCategory("All")}
              >
                View All Categories
              </button>
            </div>
          )}

          {/* GALLERY GRID */}
          {!loading && !error && filteredItems.length > 0 && (
            <div className="gallery-grid">
              {filteredItems.map((item, index) => {
                const imgSrc = item.image || item.photo || item.url || "/college-campus-1.jpg";
                return (
                  <article
                    className="gallery-card"
                    key={item.id || index}
                    onClick={() => setSelectedImage({ ...item, image: imgSrc })}
                  >
                    <div className="gallery-image">
                      <img
                        src={imgSrc}
                        alt={item.title || "Gallery photo"}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/college-campus-1.jpg";
                        }}
                      />
                      <div className="gallery-overlay">
                        <Image size={25} />
                        <span>View Image</span>
                      </div>
                    </div>

                    <div className="gallery-card-content">
                      {item.category && <span>{item.category}</span>}
                      <h3>{item.title || "Campus Photograph"}</h3>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
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
            aria-label="Close lightbox"
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
            aria-label="Previous image"
          >
            <ChevronLeft size={30} />
          </button>

          <div
            className="gallery-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.image || selectedImage.photo || selectedImage.url}
              alt={selectedImage.title || "Gallery image"}
            />
            <div>
              {selectedImage.category && <span>{selectedImage.category}</span>}
              <h3>{selectedImage.title}</h3>
            </div>
          </div>

          <button
            className="gallery-next"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            disabled={currentIndex === filteredItems.length - 1}
            aria-label="Next image"
          >
            <ChevronRight size={30} />
          </button>
        </div>
      )}
    </main>
  );
}

export default Gallery;
