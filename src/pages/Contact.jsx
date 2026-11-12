import React, { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Map,
  Car,
  Train,
  Plane,
  Landmark,
  ExternalLink,
} from "lucide-react";

import "./Contact.css";

export default function Contact() {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    let active = true;

    fetch("http://localhost:5000/api/content/contact")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load contact details.");
        }
        return result.data;
      })
      .then((records) => {
        if (active && Array.isArray(records) && records[0]) {
          setDetails(records[0]);
        }
      })
      .catch((error) => {
        console.error("Contact content API error:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const address = details?.address || "Government Polytechnic College, Masab Tank, Hyderabad, Telangana, India.";
  const location = details?.location || "Masab Tank, Hyderabad, Telangana, India.";
  const mapUrl = details?.map_url || "https://www.google.com/maps/search/?api=1&query=Government+Polytechnic+College+Masab+Tank+Hyderabad";
  const mapEmbedUrl = details?.map_embed_url || "https://www.google.com/maps?q=Government%20Polytechnic%20College%20Masab%20Tank%20Hyderabad&output=embed";

  return (
    <main className="contact-page">

      {/* ================================
          HERO
      ================================= */}

      <section className="site-hero contact-hero">
        <div className="contact-hero-content">

          <span className="contact-label">
            GET IN TOUCH
          </span>

          <h1>Contact Us</h1>

          <p>
            Have a question or need more information?
            Get in touch with Government Polytechnic College,
            Masab Tank, Hyderabad.
          </p>

        </div>
      </section>


      {/* ================================
          CONTACT INFORMATION
      ================================= */}

      <section className="contact-section">

        <div className="contact-container">

          <div className="contact-heading">

            <span>CONTACT INFORMATION</span>

            <h2>We Are Here to Help</h2>

            <p>
              Reach out to us for academic information,
              departments, student services and other
              college-related enquiries.
            </p>

          </div>


          <div className="contact-grid">

            {/* ADDRESS */}
            <div className="contact-card">

              <div className="contact-card-icon">
                <MapPin size={23} />
              </div>

              <h3>College Address</h3>

              <p>{address}</p>

            </div>


            {/* PHONE */}
            <div className="contact-card">

              <div className="contact-card-icon">
                <Phone size={23} />
              </div>

              <h3>Phone</h3>

              <p>{details?.phone ? <a href={`tel:${details.phone}`}>{details.phone}</a> : "Contact the college office during working hours for enquiries."}</p>

            </div>


            {/* EMAIL */}
            <div className="contact-card">

              <div className="contact-card-icon">
                <Mail size={23} />
              </div>

              <h3>Email</h3>

              <p>{details?.email ? <a href={`mailto:${details.email}`}>{details.email}</a> : "Contact the college through the official communication channels."}</p>

            </div>


            {/* WORKING HOURS */}
            <div className="contact-card">

              <div className="contact-card-icon">
                <Clock size={23} />
              </div>

              <h3>Working Hours</h3>

              <p>{details?.working_hours || <>Monday to Friday<br />During regular college working hours.</>}</p>

            </div>

          </div>

        </div>

      </section>


      {/* ================================
          LOCATION
      ================================= */}

      <section className="contact-location">

        <div className="contact-container">

          <div className="location-header">

            <div>
              <span>
                <Map size={17} />
                LOCATION ON MAP
              </span>

              <h2>{details?.location_title || "Government Polytechnic College, Masab Tank"}</h2>

              <p>
                {location}
              </p>
            </div>

            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="map-button"
            >
              <ExternalLink size={16} />
              Open in Google Maps
            </a>

          </div>


          <div className="location-layout">

            {/* MAP */}
            <div className="map-wrapper">

              <iframe
                title="Government Polytechnic College Masab Tank Location"
                src={mapEmbedUrl}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />

            </div>


            {/* HOW TO REACH */}
            <div className="reach-section">

              <h2>
                <MapPin size={22} />
                How to Reach Us
              </h2>


              {/* ROAD */}
              <div className="reach-card">

                <div className="reach-icon road">
                  <Car size={23} />
                </div>

                <div>
                  <h3>By Road</h3>

                  <p>
                    {details?.road_info || "Government Polytechnic College, Masab Tank is located in Hyderabad and is accessible by local roads and public transportation."}
                  </p>
                </div>

              </div>


              {/* TRAIN */}
              <div className="reach-card">

                <div className="reach-icon train">
                  <Train size={23} />
                </div>

                <div>
                  <h3>By Train</h3>

                  <p>
                    {details?.train_info || "Hyderabad has several railway stations with local transport facilities available to reach Masab Tank."}
                  </p>
                </div>

              </div>


              {/* AIR */}
              <div className="reach-card">

                <div className="reach-icon air">
                  <Plane size={23} />
                </div>

                <div>
                  <h3>By Air</h3>

                  <p>
                    {details?.air_info || "Rajiv Gandhi International Airport is the nearest major airport. Taxi and bus services are available towards Hyderabad."}
                  </p>
                </div>

              </div>


              {/* LANDMARK */}
              <div className="reach-card">

                <div className="reach-icon landmark">
                  <Landmark size={23} />
                </div>

                <div>
                  <h3>Nearby Landmark</h3>

                  <p>
                    {details?.landmark_info || "Masab Tank is a well-known locality in central Hyderabad and is easily accessible from major areas of the city."}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}