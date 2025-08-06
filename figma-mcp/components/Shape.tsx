import React from 'react';

const imgEllipse1 = "http://localhost:3845/assets/7fad6b216810885a12cdd580862b65a65239d018.svg";

function Shape() {
  return (
    <div className="relative size-full" data-name="shape" id="node-1_126">
      <div
        className="absolute bottom-0 left-0 right-[33.33%] top-[25.93%]"
        id="node-1_19"
      >
        <img alt="" className="block max-w-none size-full" src={imgEllipse1} />
      </div>
      <div
        className="absolute bottom-[25.93%] left-[33.33%] right-0 top-0"
        id="node-1_20"
      >
        <img alt="" className="block max-w-none size-full" src={imgEllipse1} />
      </div>
    </div>
  );
}

export default Shape;