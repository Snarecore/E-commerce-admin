import { useState, useRef, useEffect } from "react";

interface CollapsibleProps {
  wrapperClass?: string;
  titleWrapClass?: string;
  titleWrapActiveClass?: string;
  iconClass?: string;
  titleClass?: string;
  title?: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  wrapperClass = "",
  titleWrapClass = "",
  titleWrapActiveClass = "",
  iconClass = "",
  titleClass = "",
  title = "Title here",
  defaultOpen = false,
  children,
  icon,
}) => {
  const [active, setActive] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Toggle Active State
  const handleActive = () => setActive(!active);

  // Update Content Height for Smooth Animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(active ? contentRef.current.scrollHeight + 20 : 0);
    }
  }, [active]);

  return (
    <div className={`grid grid-cols-1 ${wrapperClass}`}>
      <div className="grid grid-cols-1 gap-3">
        <div
          className="flex justify-between items-center gap-3 cursor-pointer"
          onClick={handleActive}
        >
          <div
            className={`flex items-center gap-2 text-base font-semibold ${titleWrapClass} ${
              active ? titleWrapActiveClass : ""
            }`}
          >
            <span className={`flex justify-center items-center ${iconClass}`}>
              {icon}
            </span>
            <span className={titleClass}>{title}</span>
          </div>

          {/* Chevron Icon for Toggle */}
          <div className="w-[25px] h-[25px] rounded-full border border-gray-500 flex justify-center items-center cursor-pointer transition-all duration-300">
            {active ? (
              <i className="bx bx-chevron-up"></i>
            ) : (
              <i className="bx bx-chevron-down"></i>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-slate-100"></div>
      </div>

      {/* Collapsible Content */}
      <div
        ref={contentRef}
        style={{ maxHeight: `${contentHeight}px` }}
        className="overflow-hidden overflow-y-auto transition-all duration-300 ease-in-out"
      >
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
};

export default Collapsible;
