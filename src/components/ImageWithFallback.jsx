import { useState } from "react";

export default function ImageWithFallback({
  src,
  fallbackSrc,
  alt = "",
  fallback = null,
  ...imageProps
}) {
  const [failureState, setFailureState] = useState({ source: null, failed: [] });
  const failedSources = failureState.source === src ? failureState.failed : [];
  const currentSrc = [src, fallbackSrc].find(
    (candidate) => candidate && !failedSources.includes(candidate)
  );

  if (!currentSrc) return fallback;

  return (
    <img
      {...imageProps}
      src={currentSrc}
      alt={alt}
      onError={() => {
        setFailureState((previous) => ({
          source: src,
          failed: [
            ...(previous.source === src ? previous.failed : []),
            currentSrc,
          ],
        }));
      }}
    />
  );
}
