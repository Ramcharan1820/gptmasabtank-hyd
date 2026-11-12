import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdvancedImage, lazyload, placeholder, responsive } from "@cloudinary/react";
import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { Download, Heart, Image as ImageIcon, LoaderCircle, Search } from "lucide-react";
import { Masonry } from "masonic";
import "./CloudinaryEventGallery.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";
const EMPTY_FAVORITES = new Set();

function getFavoritesKey(eventId) {
  return `college-event-favorites:${eventId}`;
}

function readFavorites(eventId) {
  if (!eventId || typeof window === "undefined") {
    return new Set();
  }

  try {
    const stored = JSON.parse(
      window.localStorage.getItem(getFavoritesKey(eventId)) || "[]"
    );
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
}

function GalleryPhoto({ data, width, cloudName, favorite, onToggleFavorite }) {
  const plugins = useMemo(
    () => [
      lazyload({ rootMargin: "200px" }),
      responsive({ steps: [400, 800, 1200, 1600] }),
      placeholder({ mode: "blur" }),
    ],
    []
  );
  const image = useMemo(() => {
    const imageWidth = Math.max(280, Math.min(1600, Math.round(width)));
    const imageHeight = Math.max(
      200,
      Math.round(imageWidth * (Number(data.height) / Number(data.width) || 0.75))
    );
    const cloud = new Cloudinary({ cloud: { cloudName } });

    return cloud
      .image(data.public_id)
      .format("auto")
      .quality("auto")
      .resize(fill().width(imageWidth).height(imageHeight));
  }, [cloudName, data.height, data.public_id, data.width, width]);

  return (
    <article className="cloud-gallery-card">
      <div className="cloud-gallery-photo">
        <AdvancedImage
          alt={data.metadata?.photographerName
            ? `Photographed by ${data.metadata.photographerName}`
            : "College event photograph"}
          cldImg={image}
          height={Math.max(
            200,
            Math.round(
              Math.max(280, Math.min(1600, Math.round(width))) *
                (Number(data.height) / Number(data.width) || 0.75)
            )
          )}
          plugins={plugins}
          style={{
            width: "100%",
            height: "auto",
            aspectRatio:
              Number(data.width) > 0 && Number(data.height) > 0
                ? `${data.width} / ${data.height}`
                : "4 / 3",
          }}
          width={Math.max(280, Math.min(1600, Math.round(width)))}
        />
        <button
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorite}
          className={`cloud-gallery-favorite${favorite ? " is-favorite" : ""}`}
          onClick={() => onToggleFavorite(data.public_id)}
          type="button"
        >
          <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} size={18} />
        </button>
      </div>
      {(data.metadata?.photographerName || data.metadata?.department) && (
        <div className="cloud-gallery-caption">
          {data.metadata?.photographerName && (
            <span>{data.metadata.photographerName}</span>
          )}
          {data.metadata?.department && (
            <span>{data.metadata.department.toUpperCase()}</span>
          )}
        </div>
      )}
    </article>
  );
}

export default function CloudinaryEventGallery({ initialEventId = "" }) {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(String(initialEventId));
  const [cloudName, setCloudName] = useState(
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ""
  );
  const [gallery, setGallery] = useState(() => ({
    eventId: String(initialEventId),
    photos: [],
    nextCursor: null,
    hasMore: false,
    loading: Boolean(initialEventId),
  }));
  const [favoriteState, setFavoriteState] = useState(() => ({
    eventId: String(initialEventId),
    items: readFavorites(String(initialEventId)),
  }));
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState("");
  const loadingRef = useRef(false);
  const cursorRef = useRef(null);
  const generationRef = useRef(0);
  const hasMoreRef = useRef(false);
  const photos = useMemo(
    () => (gallery.eventId === eventId ? gallery.photos : []),
    [eventId, gallery.eventId, gallery.photos]
  );
  const favorites =
    favoriteState.eventId === eventId ? favoriteState.items : EMPTY_FAVORITES;
  const nextCursor = gallery.eventId === eventId ? gallery.nextCursor : null;
  const hasMore =
    gallery.eventId === eventId ? gallery.hasMore : Boolean(eventId);
  const loading =
    gallery.eventId === eventId ? gallery.loading : Boolean(eventId);

  useEffect(() => {
    let active = true;

    fetch(`${API_BASE}/api/media/events`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "Unable to load events.");
        }

        if (active) {
          setEvents(payload.data || []);
          if (payload.cloudName) {
            setCloudName(payload.cloudName);
          }
          if (!initialEventId && payload.data?.[0]?.id) {
            const firstEventId = String(payload.data[0].id);
            setFavoriteState({
              eventId: firstEventId,
              items: readFavorites(firstEventId),
            });
            setEventId(firstEventId);
          }
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || "Unable to load event galleries.");
        }
      });

    return () => {
      active = false;
    };
  }, [initialEventId]);

  const loadPage = useCallback(
    async (
      reset = false,
      requestedEventId = eventId,
      requestGeneration = generationRef.current
    ) => {
      if (
        !requestedEventId ||
        loadingRef.current ||
        (!reset && !hasMoreRef.current)
      ) {
        return;
      }

      loadingRef.current = true;
      if (!reset) {
        setGallery((current) =>
          current.eventId === requestedEventId
            ? { ...current, loading: true }
            : current
        );
      }
      const params = new URLSearchParams({ limit: "60" });
      if (!reset && cursorRef.current) {
        params.set("cursor", cursorRef.current);
      }

      try {
        const response = await fetch(
          `${API_BASE}/api/media/events/${encodeURIComponent(
            requestedEventId
          )}/assets?${params}`
        );
        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "Unable to load event photos.");
        }

        if (requestGeneration !== generationRef.current) {
          return;
        }

        setGallery((current) => {
          const currentPhotos =
            !reset && current.eventId === requestedEventId
              ? current.photos
              : [];
          const known = new Set(currentPhotos.map((photo) => photo.id));
          const page = reset
            ? payload.data || []
            : [
                ...currentPhotos,
                ...(payload.data || []).filter(
                  (photo) => !known.has(photo.id)
                ),
              ];

          return {
            eventId: requestedEventId,
            photos: page,
            nextCursor: payload.nextCursor,
            hasMore: Boolean(payload.nextCursor),
            loading: false,
          };
        });
        cursorRef.current = payload.nextCursor;
        hasMoreRef.current = Boolean(payload.nextCursor);
        setCloudName((current) => current || payload.cloudName || "");
        setError("");
      } catch (requestError) {
        if (requestGeneration === generationRef.current) {
          setError(requestError.message || "Unable to load event photos.");
          setGallery((current) =>
            current.eventId === requestedEventId
              ? { ...current, loading: false }
              : current
          );
        }
      } finally {
        if (requestGeneration === generationRef.current) {
          loadingRef.current = false;
        }
      }
    },
    [eventId]
  );

  useEffect(() => {
    const requestGeneration = generationRef.current + 1;
    generationRef.current = requestGeneration;
    loadingRef.current = false;
    cursorRef.current = null;
    hasMoreRef.current = false;

    if (eventId) {
      hasMoreRef.current = true;
      void loadPage(true, eventId, requestGeneration);
    }
  }, [eventId, loadPage]);

  const toggleFavorite = useCallback(
    (publicId) => {
      setFavoriteState((currentState) => {
        const current =
          currentState.eventId === eventId
            ? currentState.items
            : readFavorites(eventId);
        const next = new Set(current);
        if (next.has(publicId)) {
          next.delete(publicId);
        } else {
          next.add(publicId);
        }

        try {
          localStorage.setItem(
            getFavoritesKey(eventId),
            JSON.stringify([...next])
          );
        } catch {
          setError("Favorites could not be saved in this browser.");
        }

        return { eventId, items: next };
      });
    },
    [eventId]
  );

  const visiblePhotos = useMemo(
    () =>
      photos.filter((photo) => {
        if (favoritesOnly && !favorites.has(photo.public_id)) {
          return false;
        }

        if (!search.trim()) {
          return true;
        }

        const haystack = [
          photo.public_id,
          photo.metadata?.photographerName,
          photo.metadata?.cameraModel,
          photo.metadata?.department,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(search.trim().toLowerCase());
      }),
    [favorites, favoritesOnly, photos, search]
  );

  const selectEvent = (nextEventId) => {
    setFavoriteState({
      eventId: nextEventId,
      items: readFavorites(nextEventId),
    });
    setEventId(nextEventId);
    setSearch("");
    setFavoritesOnly(false);
    setError("");
  };

  const loadMoreOnRender = useCallback(
    (startIndex, stopIndex) => {
      if (
        stopIndex >= visiblePhotos.length - 8 &&
        nextCursor &&
        !loadingRef.current
      ) {
        void loadPage(false);
      }
    },
    [loadPage, nextCursor, visiblePhotos.length]
  );

  const downloadArchive = async (selectedOnly) => {
    if (!eventId) {
      return;
    }

    setArchiving(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (selectedOnly) {
        const selectedIds = [...favorites];

        if (selectedIds.length === 0) {
          throw new Error("Add photos to favorites before downloading them.");
        }

        params.set("publicIds", selectedIds.join(","));
      }

      const query = params.toString() ? `?${params}` : "";
      const response = await fetch(
        `${API_BASE}/api/media/events/${encodeURIComponent(
          eventId
        )}/archive${query}`
      );
      const payload = await response.json();

      if (!response.ok || !payload?.success || !payload.url) {
        throw new Error(payload?.message || "Unable to prepare the photo ZIP.");
      }

      window.location.assign(payload.url);
    } catch (requestError) {
      setError(requestError.message || "Unable to prepare the photo ZIP.");
    } finally {
      setArchiving(false);
    }
  };

  const selectedEvent = events.find((event) => String(event.id) === eventId);

  return (
    <section className="cloud-gallery">
      <div className="cloud-gallery-heading">
        <div>
          <span className="cloud-gallery-eyebrow">COLLEGE EVENT PHOTOS</span>
          <h2>{selectedEvent?.title || "Event photo albums"}</h2>
          <p>Browse, favorite, and download event photographs.</p>
        </div>
        <div className="cloud-gallery-actions">
          <button
            className="cloud-gallery-download"
            disabled={archiving || !selectedEvent}
            onClick={() => downloadArchive(false)}
            type="button"
          >
            {archiving ? <LoaderCircle className="cloud-spin" size={17} /> : <Download size={17} />}
            Download event ZIP
          </button>
          <button
            className="cloud-gallery-download secondary"
            disabled={archiving || favorites.size === 0}
            onClick={() => downloadArchive(true)}
            type="button"
          >
            <Heart size={16} />
            Download favorites ({favorites.size})
          </button>
        </div>
      </div>

      <div className="cloud-gallery-toolbar">
        <label className="cloud-gallery-event-field">
          <span>Event</span>
          <select
            onChange={(event) => selectEvent(event.target.value)}
            value={eventId}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>
        <label className="cloud-gallery-search">
          <Search aria-hidden="true" size={17} />
          <span className="visually-hidden">Search event photos</span>
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search photographer or department"
            value={search}
          />
        </label>
        <button
          aria-pressed={favoritesOnly}
          className={`cloud-gallery-filter${favoritesOnly ? " active" : ""}`}
          onClick={() => setFavoritesOnly((current) => !current)}
          type="button"
        >
          <Heart aria-hidden="true" size={16} />
          Favorites
        </button>
      </div>

      {error && (
        <div className="cloud-gallery-error" role="alert">
          {error}
          <button onClick={() => setError("")} type="button">
            Dismiss
          </button>
        </div>
      )}

      {!cloudName && !error && (
        <div className="cloud-gallery-empty">
          Cloudinary delivery is not configured.
        </div>
      )}

      {visiblePhotos.length > 0 && cloudName && (
        <Masonry
          className="cloud-gallery-masonry"
          columnGutter={16}
          columnWidth={250}
          itemHeightEstimate={300}
          itemKey={(photo) => photo.id}
          items={visiblePhotos}
          onRender={loadMoreOnRender}
          overscanBy={1.5}
          render={({ data, width }) => (
            <GalleryPhoto
              cloudName={cloudName}
              data={data}
              favorite={favorites.has(data.public_id)}
              onToggleFavorite={toggleFavorite}
              width={width}
            />
          )}
        />
      )}

      {loading && (
        <div className="cloud-gallery-loading" aria-live="polite">
          <LoaderCircle className="cloud-spin" size={19} />
          Loading photographs…
        </div>
      )}

      {!loading && eventId && visiblePhotos.length === 0 && !error && (
        <div className="cloud-gallery-empty">
          <ImageIcon size={28} />
          <strong>
            {favoritesOnly ? "No favorited photos in this view" : "No event photos yet"}
          </strong>
          <span>
            Uploaded photos appear after Cloudinary finishes preparing them.
          </span>
        </div>
      )}

      {!loading && hasMore && (
        <button
          className="cloud-gallery-load-more"
          onClick={() => loadPage(false)}
          type="button"
        >
          Load more
        </button>
      )}
    </section>
  );
}
