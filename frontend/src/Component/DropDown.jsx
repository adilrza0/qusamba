import React, { useState } from "react";

export default function DropDown() {
  const [option, setOption] = useState("");

  const handleChange = (e) => {
    setOption(e.target.value);
  };
  return (
    <div>
      <div className="dropdown dropdown-end dropdown-hover ">
        <div tabIndex={0} role="button" className="">
          <div className="hover:scale-110">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </div>
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content absolute z-10  menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <a href="/login">Login</a>
          </li>
          <li>
            <a href="/register">SingUp</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
