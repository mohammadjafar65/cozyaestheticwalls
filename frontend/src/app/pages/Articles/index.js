import React, { useEffect, useState } from "react";
import { ArrowLeft } from 'lucide-react';
import { Link } from "react-router-dom";

const Articles = () => {
  return (
    <>
      <div className="w-full sticky top-0 z-20 backdrop-blur-md bg-[#18181B]/80 py-4 px-8 min-[320px]:px-5 border-b border-[216 34% 17%] flex items-center justify-between">
        <div className="grid grid-cols-3 items-center w-full justify-items-center">
          <a className="flex gap-2 text-[#EEEEEE]" href="/"><ArrowLeft /> Go Home</a>
          <div className="flex items-center gap-3 min-[320px]:gap-2">
            <img
              src="../logo.png"
              className="w-7"
              alt="Cozy Aesthetic Wallpaper"
            />
            <h1 className="text-[#EEEEEE] font-bold m-0 p-0 min-[320px]:text-[14px]">
              Cozy Aesthetic Wallpaper
            </h1>
          </div>
          {/* <h3 className="text-[#EEEEEE] max-sm:hidden">
            Articles
          </h3> */}
        </div>
      </div>
    </>
  );
};

export default Articles;
