import React, { useEffect, useRef, type ReactNode } from "react";

interface AutoScrollContainerProps {
  children: ReactNode;
}

const AutoScrollContainer: React.FC<AutoScrollContainerProps> = (props) => {
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [props.children]);

  return (
    <div className="flex h-full w-full flex-col overflow-y-scroll px-2">
      {props.children}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default AutoScrollContainer;
