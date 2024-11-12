
import React from 'react';

const Grid = () => {
  return (
    <div className="pointer-events-none z-40">
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 border-opacity-0">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="border border-muted-foreground/50"></div>
        ))}
      </div>
    </div>
  );
};

export default Grid;
