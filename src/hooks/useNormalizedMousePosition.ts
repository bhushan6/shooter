import { useEffect } from "react";

function getNormalizedMousePosition(event: MouseEvent): {
  x: number;
  y: number;
} {
  // Get the mouse position relative to the viewport
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  // Get the width and height of the viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Normalize mouse position to the range of -1 to 1
  const normalizedX = (mouseX / viewportWidth) * 2 - 1;
  const normalizedY = (mouseY / viewportHeight) * -2 + 1;

  return { x: normalizedX, y: normalizedY };
}

export const useNormalizedMousePosition = (
  cb: (position: { x: number; y: number }) => void
) => {
  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const normalizedPosition = getNormalizedMousePosition(event);
      cb(normalizedPosition);
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [cb]);
};
