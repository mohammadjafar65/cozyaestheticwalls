import React from "react";
import { useLocation } from "react-router-dom";
import BottomMenu from "./BottomMenu";

const Layout = ({ children }) => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Mobile";
      case "/desktop":
        return "Desktop";
      case "/tablet":
        return "Tablet";
      default:
        return "Mobile";
    }
  };
  return (
    <>
      <div className="wrapper relative">
        <div className="flex items-center justify-center absolute top-[-700px]">
          <img className="animate-spin-slow w-[70%] transition delay-150 ease-in-out" src="bg_gradient_purple.png" alt="#"/>
        </div>
        <div className="content-wrapper relative">{children}</div>
        <BottomMenu />
      </div>
    </>
  );
};

export default Layout;
