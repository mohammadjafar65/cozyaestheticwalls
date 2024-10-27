import React, { useEffect, useState } from "react";
import Layout from "../../customComponents/layout/Layout";
import { Button } from "../../../components/ui/button";
import { Download, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import axios from "axios"; // Import axios for API requests

const HomePage = () => {
  const [wallpapers, setWallpapers] = useState([]);

  // Function to download the wallpaper
  const downloadImage = (url, title) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = urlBlob;
        link.setAttribute("download", title); // Sets the filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(urlBlob); // Clean up
      })
      .catch(() => alert("Failed to download the image. Try again later."));
  };  

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}api/wallpapers`)
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
    return <p>Loading wallpapers...</p>;
  }

  return (
    <>
      <Layout>
        <div className="w-full flex flex-col items-center justify-center pt-[5%] mb-[5%]">
          <img src="logo.png" className="h-[75px]" alt="Logo" />
          <h1 className="font-bold text-[50px] text-white mt-2">
            Explore. Click. Download.
          </h1>
          <p className="w-[20%] text-center text-[16px] text-white/[42%]">
            Browse through a vast collection of stunning wallpapers to match
            your style.{" "}
            <span className="text-white">Download your favorites now!</span>
          </p>
        </div>

        <div className="container pb-[8%]">
          <div className="grid grid-cols-4 gap-y-8">
            {wallpapers.map((wallpaper) => (
              <div
                className="group w-[250px] h-[350px] relative overflow-hidden rounded-[10px]"
                key={wallpaper._id} // Use unique id for the key
              >
                <img
                  src={`${process.env.REACT_APP_API_URL}${wallpaper.url}`}
                  className="object-cover w-[250px] h-[350px] rounded-[10px] transition-transform duration-500 ease-in-out transform group-hover:scale-105"
                  alt={wallpaper.title}
                  loading="lazy"
                />
                <div className="absolute top-0 left-0 z-10 flex items-center justify-center w-full h-full bg-gradient-to-t from-black/[.7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out rounded-[10px]">
                  <Dialog>
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
                  </Dialog>
                  {/* Download button with correct wallpaper URL */}
                  <Button
                    className="bg-white rounded-full text-black px-4 py-2 transition-transform duration-500 ease-in-out transform group-hover:scale-110 hover:bg-white/[90%]"
                    onClick={() =>
                      downloadImage(
                        `${process.env.REACT_APP_API_URL}${wallpaper.url}`,
                        wallpaper.title
                      )
                    }
                  >
                    <Download /> Download
                  </Button>
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
