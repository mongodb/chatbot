import { useRef, useEffect } from "react";

type UseElementBoundingBoxClickHandlerProps = {
  onClickInside?: () => void;
  onClickOutside?: () => void;
};

export default function useElementBoundingBoxClickHandler({
  onClickInside,
  onClickOutside,
}: UseElementBoundingBoxClickHandlerProps) {
  const elementRef = useRef();
  useEffect(() => {
    function handleClick(e) {
      if (!elementRef.current) {
        console.warn(
          `useElementBoundingBoxClickHandler tried to handle an element that does not exist.`
        );
        return;
      }
      if (elementRef.current?.contains(e.target)) {
        // Clicked in box
        onClickInside?.();
      } else {
        // Clicked outside the box
        onClickOutside?.();
      }
    }

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);
  return elementRef;
}
