import React from 'react';

// Image assets from Figma
const imgEllipse1 = "http://localhost:3845/assets/7fad6b216810885a12cdd580862b65a65239d018.svg";
const imgSignal = "http://localhost:3845/assets/f817c56ab307e427e543fd8d5bf8455aa4ac78b9.svg";
const imgBatteryThreeQuarters = "http://localhost:3845/assets/49b9c861b8f8f18de827fff530938dd95386999e.svg";
const imgWifi = "http://localhost:3845/assets/a88afcf40ea6ef102bab4346fb227da99a69f75e.svg";
const imgUndrawDoneCheckingRe6Vyx1 = "http://localhost:3845/assets/a29066f9d9de5401e16b470807b0ba8c1498eb20.svg";

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

function Button() {
  return (
    <div className="relative size-full" data-name="Button" id="node-1_124">
      <div
        className="absolute bg-[#50c2c9] inset-0 rounded-lg"
        id="node-1_121"
      />
      <div
        className="absolute font-['Poppins:SemiBold',_sans-serif] inset-[26.67%_35.79%_26.67%_36.84%] leading-[0] not-italic text-[#ffffff] text-[18px] text-center text-nowrap"
        id="node-1_122"
      >
        <p className="block leading-[1.57] whitespace-pre">Get Started</p>
      </div>
    </div>
  );
}

export default function Splashscreen() {
  return (
    <div
      className="bg-[#f0f4f3] relative size-full"
      data-name="Splashscreen"
      id="node-1_2"
    >
      <div
        className="absolute h-[270px] left-[-100px] top-[-87px] w-[300px]"
        data-name="shape"
        id="node-1_126"
      >
        <Shape />
      </div>
      <div
        className="absolute h-[22px] left-[25px] top-[21px] w-[380px]"
        data-name="notification"
        id="node-1_128"
      >
        <Notification />
      </div>
      <div
        className="absolute h-[193.998px] left-[82px] top-[261px] w-[254px]"
        data-name="undraw_done_checking_re_6vyx 1"
        id="node-1_55"
      >
        <img
          alt=""
          className="block max-w-none size-full"
          src={imgUndrawDoneCheckingRe6Vyx1}
        />
      </div>
      <div
        className="absolute font-['Poppins:Bold',_sans-serif] leading-[0] not-italic text-[#000000] text-[18px] text-left text-nowrap top-[520px]"
        id="node-1_105"
        style={{ left: "calc(20% + 28px)" }}
      >
        <p className="block leading-[normal] whitespace-pre">
          Gets things with TODs
        </p>
      </div>
      <div
        className="absolute font-['Poppins:Regular',_sans-serif] h-[100px] leading-[0] not-italic text-[13px] text-[rgba(0,0,0,0.8)] text-center top-[563px] translate-x-[-50%] w-[203px]"
        id="node-1_106"
        style={{ left: "calc(20% + 127.5px)" }}
      >
        <p className="block leading-[104.667%]">
          Lorem ipsum dolor sit amet consectetur. Eget sit nec et euismod.
          Consequat urna quam felis interdum quisque. Malesuada adipiscing
          tristique ut eget sed.
        </p>
      </div>
      <div
        className="absolute h-[60px] left-[23px] top-[799px] w-[380px]"
        data-name="Button"
        id="node-1_124"
      >
        <Button />
      </div>
    </div>
  );
}