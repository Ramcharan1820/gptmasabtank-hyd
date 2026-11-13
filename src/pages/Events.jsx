import React, { useEffect, useState, useMemo } from "react";
import {
  CalendarDays,
  MapPin,
  RefreshCw,
  AlertCircle,
  PartyPopper,
  CalendarCheck
} from "lucide-react";

import "./Events.css";

const API_URL = "http://localhost:5000/api/events";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(events.map((e) => e.category).filter(Boolean)),
    ];
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "All") return events;
    return events.filter(
      (e) => (e.category || "").toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [events, selectedCategory]);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch events from MySQL through Express API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to fetch events.");
      }

      setEvents(Array.isArray(result.data) ? result.data : []);

    } catch (err) {
      console.error("Events API Error:", err);
      setError(err.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  };

  // Format MySQL date without timezone shifting
  const formatDate = (date) => {
    if (!date) return "Date not announced";

    const dateString = String(date).slice(0, 10);
    const parts = dateString.split("-");

    if (parts.length !== 3) return dateString;

    const [year, month, day] = parts;

    const parsedDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (isNaN(parsedDate.getTime())) return dateString;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Determine event status
  const isUpcoming = (date) => {
    if (!date) return false;

    const parts = String(date).slice(0, 10).split("-");

    if (parts.length !== 3) return false;

    const [year, month, day] = parts;

    const eventDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return eventDate >= today;
  };

  return (
    <div className="events-page">

      {/* HERO SECTION */}

      <section className="site-hero events-hero">
        <div className="events-hero-overlay">
          <div className="events-hero-content">

            <span className="events-tag">
              <PartyPopper size={16} />
              COLLEGE ACTIVITIES
            </span>

            <h1>College Events</h1>

            <p>
              Explore technical events, cultural celebrations,
              workshops, sports activities and memorable moments
              at Government Polytechnic College, Masab Tank.
            </p>

          </div>
        </div>
      </section>

      {/* EVENTS SECTION */}

      <section className="events-container">

        <div className="events-heading">

          <div>
            <span className="events-subtitle">
              WHAT'S HAPPENING
            </span>

            <h2>Latest Events & Activities</h2>

            <p>
              Stay updated with the latest activities and
              celebrations happening at our college.
            </p>
          </div>

          <button
            className="events-refresh"
            onClick={fetchEvents}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </div>

        <div className="events-controls-bar">
          <div className="events-category-dropdown-wrap">
            <label htmlFor="events-category-select">Filter by Category:</label>
            <select
              id="events-category-select"
              className="events-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories ({events.length})</option>
              {categories
                .filter((c) => c !== "All")
                .map((cat) => {
                  const count = events.filter(
                    (e) => (e.category || "").toLowerCase() === cat.toLowerCase()
                  ).length;
                  return (
                    <option key={cat} value={cat}>
                      {cat} ({count})
                    </option>
                  );
                })}
            </select>
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="events-message">
            <RefreshCw
              size={30}
              className="events-spinner"
            />

            <p>Loading college events...</p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="events-message error">

            <AlertCircle size={35} />

            <h3>Unable to Load Events</h3>

            <p>{error}</p>

            <button onClick={fetchEvents}>
              Try Again
            </button>

          </div>
        )}

        {/* NO EVENTS */}

        {!loading && !error && events.length === 0 && (
          <div className="events-message">

            <CalendarDays size={45} />

            <h3>No Events Available</h3>

            <p>
              College events will appear here once published
              by the administration.
            </p>

          </div>
        )}

        {/* EVENTS GRID */}

        {!loading && !error && events.length > 0 && (
          <>
            {filteredEvents.length === 0 ? (
              <div className="events-message">
                <CalendarDays size={45} />
                <h3>No Events in "{selectedCategory}"</h3>
                <p>Try selecting another category or "All Categories".</p>
                <button
                  onClick={() => setSelectedCategory("All")}
                  style={{
                    padding: "8px 16px",
                    background: "var(--maroon-primary, #800000)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginTop: "10px",
                  }}
                >
                  View All Events
                </button>
              </div>
            ) : (
              <div className="events-grid">
                {filteredEvents.map((event) => {
                  const upcoming = isUpcoming(event.event_date);
                  return (

                <article
                  className="event-card"
                  key={event.id}
                >

                  {/* IMAGE */}

                  <div className="event-image">

                    {event.image ? (

                      <img
                        src={
                          event.image.startsWith("http")
                            ? event.image
                            : event.image.startsWith("/")
                              ? event.image
                              : `http://localhost:5000/${event.image.replace(/^\/+/, "")}`
                        }
                        alt={event.title}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />

                    ) : (

                      <div className="event-image-placeholder">
                        <CalendarDays size={55} />
                        <span>College Events</span>
                      </div>

                    )}

                    <span
                      className={`event-status ${
                        upcoming ? "upcoming" : "completed"
                      }`}
                    >
                      {upcoming ? "Upcoming" : "Completed"}
                    </span>

                  </div>

                  {/* EVENT DETAILS */}

                  <div className="event-details">

                    {event.category && (
                      <span className="event-category">
                        {event.category}
                      </span>
                    )}

                    <h3>{event.title}</h3>

                    <p className="event-description">
                      {event.description ||
                        "More information about this event will be announced soon."}
                    </p>

                    <div className="event-info">

                      <div>
                        <CalendarCheck size={17} />
                        <span>
                          {formatDate(event.event_date)}
                        </span>
                      </div>

                      <div>
                        <MapPin size={17} />
                        <span>
                          Government Polytechnic College,
                          Masab Tank
                        </span>
                      </div>

                    </div>

                  </div>

                </article>

              );

            })}

          </div>
            )}
          </>
        )}

      </section>

      {/* BOTTOM SECTION */}

      <section className="events-bottom">

        <h2>Be Part of Our College Activities</h2>

        <p>
          Participate, learn, connect and create unforgettable
          memories through our college events.
        </p>

      </section>

    </div>
  );
}

export default Events;