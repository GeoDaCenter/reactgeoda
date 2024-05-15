import React, {useState, MouseEvent} from 'react';

export type SplitterProps = {
  mode: 'vertical' | 'horizontal';
  initialSize: number;
  minimumSize?: number;
  onSplitterChange: (divSize: number) => void;
};

/**
 * The Splitter component is used to create a draggable divider between two elements.
 * Note: the parent element should have `position: relative` style.
 *
 */
export function Splitter({mode, initialSize, minimumSize = 0, onSplitterChange}: SplitterProps) {
  const [mousePosition, setMousePosition] = useState<number>(0);
  const [divSize, setDivSize] = useState<number>(initialSize);
  const [dragging, setDragging] = useState<boolean>(false);

  const handleDragStart = (e: MouseEvent<HTMLDivElement>) => {
    // Prevent the default action, which would be to select the element.
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    const startPos = mode === 'horizontal' ? e.clientX : e.clientY;
    setMousePosition(startPos);
  };

  const handleDragMove = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragging) {
      const currentPos = mode === 'horizontal' ? e.clientX : e.clientY;
      const diff = mousePosition - currentPos;
      const newDivSize = divSize + diff;
      setDivSize(newDivSize > minimumSize ? newDivSize : minimumSize);
      setMousePosition(currentPos);
      // call the callback function to update the div size
      onSplitterChange(newDivSize);
    }
  };

  const handleDragEnd = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const screenClass =
    mode === 'horizontal' ? 'h-full cursor-col-resize' : 'w-full cursor-row-resize';

  const splitterExpanderStyle =
    mode === 'horizontal'
      ? {width: dragging ? '100px' : '20px', top: 0, left: dragging ? '-50px' : '0'}
      : {height: dragging ? '100px' : '20px', top: dragging ? '-50px' : '0', left: 0};

  return (
    <div
      className={`absolute ${screenClass} z-[100] cursor-col-resize`}
      // adjust the width of the splitter div based on dragging state to make mouse cursor stay on top of the splitter
      style={splitterExpanderStyle}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseOut={handleDragEnd}
    ></div>
  );
}
