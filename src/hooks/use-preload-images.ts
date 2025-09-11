import { useEffect, useState } from "react";

export function usePreloadImages(urls: string[]) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!urls?.length) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    let done = 0;

    urls.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        done += 1;
        if (!cancelled && done >= urls.length) setLoaded(true);
      };
      img.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, [urls]);

  return loaded;
}