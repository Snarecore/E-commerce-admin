import React, { useEffect, useRef } from "react";

interface ClickOutsideWrapperProps {
  children: React.ReactNode;
  onClickOutside: () => void;
}

const ClickOutsideWrapper: React.FC<ClickOutsideWrapperProps> = ({
  children,
  onClickOutside,
}) => {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        elementRef.current &&
        !elementRef.current.contains(event.target as Node)
      ) {
        onClickOutside();
      }
    };

    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [onClickOutside]);

  return <div ref={elementRef}>{children}</div>;
};

export default ClickOutsideWrapper;
