import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Info, Eye, Share2, Download } from "lucide-react";

const WallpaperDetails = ({ isOpen, onClose, wallpaper }) => {
  if (!wallpaper) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-background border-background lg:rounded-[20px] md:rounded-[20px] sm:rounded-[20px] rounded-[20px] w-[600] min-[320px]:w-[350px]">
          <DialogHeader>
            {/* <DialogTitle>{wallpaper.title}</DialogTitle> */}
            <DialogDescription>
              <div className="flex items-center w-full justify-center relative">
                <img
                  src="iPhone_Frame.png"
                  alt="iPhone Frame"
                  className="h-[600px]"
                />
                <img
                  src="time_iPhone.png"
                  alt="Dinamy Island"
                  className="absolute w-[95%] z-10 top-5"
                />
                <img
                  src="Bottom.png"
                  alt="Dinamy Island"
                  className="absolute w-[95%] z-10 bottom-5"
                />
                <img
                  src={`${process.env.REACT_APP_API_URL}${wallpaper.thumbnailUrl}`}
                  alt={wallpaper.title}
                  className="object-cover w-[264px] h-[574px] rounded-[31px] transition-transform duration-500 ease-in-out transform group-hover:scale-105 absolute"
                />
              </div>
              <a
                className="bg-white rounded-full text-[18px] text-black hover:text-white bg-[#f39f5a] flex items-center justify-center gap-2 text-black px-5 py-4 mt-[20px] transition-transform duration-500 ease-in-out transform group-hover:scale-110 hover:bg-[#f39f5a]/[90%]"
                href={`${
                  process.env.REACT_APP_API_URL
                }/api/wallpapers/download/${wallpaper.url.split("/").pop()}`} // Get the filename from wallpaper URL
                download // Just adding this as a safeguard to force the download
              >
                <Download className="w-5 h-5" /> Download Free
              </a>
              {/* <img
                src={`${process.env.REACT_APP_API_URL}${wallpaper.url}`}
                alt={wallpaper.title}
                className="object-cover w-[290px] h-[644px] rounded-[10px] transition-transform duration-500 ease-in-out transform group-hover:scale-105"
              /> */}
              {/* {wallpaper.description} */}
              {/* Tags Section */}
              <div>
                {wallpaper.tags && wallpaper.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {wallpaper.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/* <Dialog
        open={isOpen}
        onOpenChange={onClose}
        className="flex items-center"
      >
        <DrawerContent className="bg-background border-border h-full w-[600px]">
          <DrawerHeader className="p-9">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-[50px] block text-white bg-transparent border-transparent hover:bg-transparent hover:text-white flex items-center"
            >
              <ArrowLeft /> Back
            </Button>
            <DrawerTitle>{wallpaper.title}</DrawerTitle>
            <DrawerDescription>Wallpaper ID: {wallpaper._id}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <img
              src={`${process.env.REACT_APP_API_URL}${wallpaper.thumbnailUrl}`}
              alt={wallpaper.title}
              className="object-cover w-[250px] h-[350px] rounded-[10px] transition-transform duration-500 ease-in-out transform group-hover:scale-105"
            />
          </div>
        </DrawerContent>
      </Dialog> */}
    </>
  );
};

export default WallpaperDetails;
