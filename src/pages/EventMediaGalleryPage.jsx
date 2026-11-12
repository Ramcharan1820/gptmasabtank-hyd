import { useParams } from "react-router-dom";
import CloudinaryEventGallery from "../components/CloudinaryEventGallery";
import "./EventMediaGalleryPage.css";

export default function EventMediaGalleryPage() {
  const { eventId = "" } = useParams();

  return (
    <main className="event-media-gallery-page">
      <section className="site-hero event-media-gallery-hero">
        <div>
          <span>GOVERNMENT POLYTECHNIC COLLEGE</span>
          <h1>Event Photo Albums</h1>
          <p>Explore and download photographs from college events.</p>
        </div>
      </section>
      <div className="event-media-gallery-content">
        <CloudinaryEventGallery
          key={eventId}
          initialEventId={eventId}
        />
      </div>
    </main>
  );
}
