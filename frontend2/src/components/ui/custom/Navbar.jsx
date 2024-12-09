import React from "react";
// import logo from "../Images/Qusamba Logo.png"
// import cart from "../Images/cart-icon.svg"
import DropDown from "./DropDown";
export default function Navbar() {
  return (
    <div
      data-theme
      className="navbar z-10 flex justify-between  p-3 mb-5 bg-background  text-right pr-10  sticky top-0"
    >
      <div className="flex">
        {/* Logo */}
        {/* <img className=" w-15 h-16" src={logo} alt="logo" /> */}
        <a
          href="/"
          className=" btn btn-ghost text-4xl font-extrabold  text great-vibes-regular"
        >
          Qusamba
        </a>
      </div>
      <div className="flex space-x-10  mt-3 ">
        {/* search bar */}
        <a className="hover:scale-110" href="/">
          Home
        </a>
        <a className="hover:scale-110" href="/">
          Bangle
        </a>
        <a className="hover:scale-110" href="/">
          Brass Bangle
        </a>
        <a className="hover:scale-110" href="/">
          Customize Order
        </a>
      </div>
      <div className="flex space-x-10 mt-3">
        {/* cart & profile */}
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="hover:scale-110 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        </div>
        <div className="flex hover:scale-110">
          {/* <svg class="h-8 w-8 text-red-900"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1"  stroke-linecap="round"  stroke-linejoin="round">  <circle cx="9" cy="21" r="1" />  <circle cx="20" cy="21" r="1" />  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className=" w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>

          <div className=" bg-red-900 text-white rounded-full text-center w-5 h-5 relative right-3 bottom-2 font-bold">
            0
          </div>
        </div>

        <DropDown />
      </div>
    </div>
  );
}
