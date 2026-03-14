import { useEffect } from "react";
import { useLocation } from "react-router";

const useScrollToHash = (): void => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");

    const element = document.getElementById(id) as HTMLElement | null;

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [location]);
};

export default useScrollToHash;