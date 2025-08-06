import React from 'react';

const imgEllipse1 = "http://localhost:3845/assets/7fad6b216810885a12cdd580862b65a65239d018.svg";
const imgSignal = "http://localhost:3845/assets/f817c56ab307e427e543fd8d5bf8455aa4ac78b9.svg";
const imgBatteryThreeQuarters = "http://localhost:3845/assets/49b9c861b8f8f18de827fff530938dd95386999e.svg";
const imgWifi = "http://localhost:3845/assets/a88afcf40ea6ef102bab4346fb227da99a69f75e.svg";

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

function InputField({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative size-full" data-name="input_filed">
      <div
        className="absolute bg-[#ffffff] inset-0 rounded-[100px]"
      />
      <div
        className="absolute font-['Poppins:Regular',_sans-serif] inset-[30%_40%_30%_6.58%] leading-[0] not-italic text-[13px] text-[rgba(0,0,0,0.8)] text-left"
      >
        <p className="block leading-[104.667%]">{placeholder}</p>
      </div>
    </div>
  );
}

export default function Registration() {
  return (
    <div
      className="bg-[#f0f4f3] relative size-full"
      data-name="Registration"
      id="node-1_129"
    >
      <div
        className="absolute h-[270px] left-[-100px] top-[-87px] w-[300px]"
        data-name="shape"
        id="node-1_130"
      >
        <Shape />
      </div>
      <div
        className="absolute h-[22px] left-[25px] top-[21px] w-[380px]"
        data-name="notification"
        id="node-1_131"
      >
        <Notification />
      </div>
      <div
        className="absolute h-[60px] left-[23px] top-[799px] w-[380px]"
        data-name="Button"
        id="node-1_183"
      >
        <div
          className="absolute bg-[#50c2c9] inset-0 rounded-lg"
          id="node-I1_183-1_121"
        />
        <div
          className="absolute font-['Poppins:SemiBold',_sans-serif] inset-[26.67%_35.79%_26.67%_36.84%] leading-[0] not-italic text-[#ffffff] text-[18px] text-center text-nowrap"
          id="node-I1_183-1_122"
        >
          <p className="block leading-[1.57] whitespace-pre">Register</p>
        </div>
      </div>
      <div
        className="absolute font-['Poppins:Bold',_sans-serif] leading-[0] not-italic text-[#000000] text-[18px] text-left text-nowrap top-[248px]"
        id="node-1_195"
        style={{ left: "calc(20% + 25px)" }}
      >
        <p className="block leading-[normal] whitespace-pre">{`Welcome to Onboard! `}</p>
      </div>
      <div
        className="absolute font-['Poppins:Regular',_sans-serif] leading-[0] not-italic text-[13px] text-[rgba(0,0,0,0.8)] text-center top-[306px] translate-x-[-50%] w-[203px]"
        id="node-1_196"
        style={{ left: "calc(20% + 127.5px)" }}
      >
        <p className="block leading-[104.667%]">
          Let's help to meet up your tasks.
        </p>
      </div>
      <div
        className="absolute h-[50px] left-[23px] top-[436px] w-[380px]"
        data-name="input_filed"
        id="node-1_200"
      >
        <InputField placeholder="Enter your full name" />
      </div>
      <div
        className="absolute h-[50px] left-[23px] top-[516px] w-[380px]"
        data-name="input_filed"
        id="node-1_201"
      >
        <InputField placeholder="Enter your Email" />
      </div>
      <div
        className="absolute h-[50px] left-[23px] top-[596px] w-[380px]"
        data-name="input_filed"
        id="node-1_204"
      >
        <InputField placeholder="Enter Password" />
      </div>
      <div
        className="absolute h-[50px] left-[23px] top-[676px] w-[380px]"
        data-name="input_filed"
        id="node-1_207"
      >
        <InputField placeholder="Confirm password" />
      </div>
      <div
        className="absolute font-['Poppins:Regular',_sans-serif] leading-[0] left-[213px] not-italic text-[#000000] text-[16px] text-center text-nowrap top-[878px] translate-x-[-50%]"
        id="node-1_210"
      >
        <p className="leading-[1.57] whitespace-pre">
          <span className="">{`Already have an account ? `}</span>
          <span className="text-[#50c2c9]">Sign In</span>
        </p>
      </div>
    </div>
  );
}