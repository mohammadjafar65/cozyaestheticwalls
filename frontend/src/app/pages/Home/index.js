import React, { useEffect, useState } from "react";
import Layout from "../../customComponents/layout/Layout";
import { Button } from "../../../components/ui/button";
import { Download, Info, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import axios from "axios"; // Import axios for API requests
import TopBar from "../../customComponents/layout/TopBar";

const HomePage = () => {
  const [wallpapers, setWallpapers] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/wallpapers/category/Phone`) // Fetch only Phone category wallpapers
      .then((response) => {
        setWallpapers(response.data);
        setLoading(false); // Stop loading when data is fetched
      })
      .catch((error) => {
        console.error("Error fetching wallpapers:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <p className="w-full h-[100vh] flex items-center justify-center">
        Loading wallpapers...
      </p>
    );
  }

  return (
    <>
      <Layout>
        <TopBar />
        <div className="lg:pb-[8%] sm:pb-[10%] min-[320px]:pb-[30%] min-[320px]:px-[20px] px-[20px] py-[20px]">
          <div className="grid lg:grid-cols-7 md:grid-cols-3 gap-4 min-[320px]:grid-cols-2 justify-items-center p-0">
            {wallpapers.map((wallpaper) => (
              <div
                className="group lg:w-full lg:h-[350px] min-[320px]:w-full min-[320px]:h-[300px] relative overflow-hidden rounded-[10px] p-0"
                key={wallpaper._id} // Use unique id for the key
              >
                <img
                  src={`${process.env.REACT_APP_API_URL}${wallpaper.thumbnailUrl}`}
                  className="object-cover w-[250px] h-[350px] rounded-[10px] transition-transform duration-500 ease-in-out transform group-hover:scale-105"
                  alt={wallpaper.title}
                  loading="lazy"
                />
                {wallpaper.isNew && <span className="new-tag">New</span>}
                <div className="absolute top-0 left-0 z-10 flex items-center justify-center w-full bg-gradient-to-t from-black/[.3] to-transparent opacity-0 h-full group-hover:opacity-100 transition-opacity duration-500 ease-in-out rounded-[10px]">
                  {/* <Dialog>
                    <DialogTrigger className="absolute top-2 right-2 hover:bg-slate-900/[0.6] p-2 rounded-[50%]">
                      <Info className="w-5 h-5" />
                    </DialogTrigger>
                    <DialogContent className="bg-background border-background">
                      <DialogHeader>
                        <DialogTitle>{wallpaper.title}</DialogTitle>
                        <DialogDescription>
                          {wallpaper.description}
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog> */}
                  {/* Download button with correct wallpaper URL */}
                  <a
                    className="bg-white rounded-full text-[15px] flex items-center gap-2 text-black px-2 py-2 transition-transform duration-500 ease-in-out transform group-hover:scale-110 hover:bg-white/[90%] absolute bottom-5 right-5"
                    href={`${
                      process.env.REACT_APP_API_URL
                    }/api/wallpapers/download/${wallpaper.url
                      .split("/")
                      .pop()}`} // Get the filename from wallpaper URL
                    download // Just adding this as a safeguard to force the download
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default HomePage;
