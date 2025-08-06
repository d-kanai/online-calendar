import React from 'react';

const imgSignal = "http://localhost:3845/assets/f817c56ab307e427e543fd8d5bf8455aa4ac78b9.svg";
const imgBatteryThreeQuarters = "http://localhost:3845/assets/49b9c861b8f8f18de827fff530938dd95386999e.svg";
const imgWifi = "http://localhost:3845/assets/a88afcf40ea6ef102bab4346fb227da99a69f75e.svg";

function Notification() {
  return (
    <div
      className="relative size-full"
      data-name="notification"
      id="node-1_128"
    >
      <div
        className="absolute bottom-[3.68%] left-[76.58%] right-[17.84%] top-0"
        data-name="signal"
        id="node-1_13"
      >
        <img alt="" className="block max-w-none size-full" src={imgSignal} />
      </div>
      <div
        className="absolute bottom-[3.68%] left-[94.42%] right-0 top-0"
        data-name="battery-three-quarters"
        id="node-1_11"
      >
        <img
          alt=""
          className="block max-w-none size-full"
          src={imgBatteryThreeQuarters}
        />
      </div>
      <div
        className="absolute bottom-[3.68%] left-[85.5%] right-[8.92%] top-0"
        data-name="wifi"
        id="node-1_9"
      >
        <img alt="" className="block max-w-none size-full" src={imgWifi} />
      </div>
      <div
        className="absolute bottom-0 font-['Poppins:Bold',_sans-serif] leading-[0] left-0 not-italic right-[85%] text-[#000000] text-[14.553px] text-left text-nowrap top-0"
        id="node-1_16"
      >
        <p className="block leading-[normal] whitespace-pre">9:30 PM</p>
      </div>
    </div>
  );
}

export default Notification;