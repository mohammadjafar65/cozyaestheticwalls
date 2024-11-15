import React, { useEffect, useState } from "react";
import Layout from "../../customComponents/layout/Layout";
import WallpaperDetails from "../wallpaperDetails";
import { Button } from "../../../components/ui/button";
import axios from "axios"; // Import axios for API requests
import TopBar from "../../customComponents/layout/TopBar";

const HomePage = () => {
  const [wallpapers, setWallpapers] = useState([]); // All wallpapers
  const [filteredWallpapers, setFilteredWallpapers] = useState([]); // Filtered wallpapers
  const [loading, setLoading] = useState(true);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null); // State to hold selected wallpaper
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTag, setActiveTag] = useState("All Wallpapers");

  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/wallpapers`
        );
        const data = response.data;

        // Sort wallpapers by createdAt in descending order in the frontend as a backup
        const sortedWallpapers = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setWallpapers(sortedWallpapers);
        setFilteredWallpapers(sortedWallpapers);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching wallpapers:", error);
        setLoading(false);
      }
    };

    fetchWallpapers();
  }, []);

  const handleWallpaperClick = (wallpaper) => {
    setSelectedWallpaper(wallpaper);
    setIsDrawerOpen(true);
  };

  if (loading) {
    return (
      <p className="w-full h-[100vh] flex items-center justify-center">
        Loading wallpapers...
      </p>
    );
  }

  return (
    <>
      <Layout
        wallpapers={wallpapers}
        filteredWallpapers={filteredWallpapers}
        setFilteredWallpapers={setFilteredWallpapers}
      >
        <div className="py-6 px-2">
          <div className="grid gap-y-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 justify-items-center">
            {filteredWallpapers.map((wallpaper) => (
              <div
                onClick={() => handleWallpaperClick(wallpaper)} // Open drawer with selected wallpaper data
                className="group relative overflow-hidden rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-300"
                key={wallpaper._id || wallpaper.id}
              >
                <div className="flex items-center justify-center relative">
                  <img
                    src="iPhone_Frame.png"
                    alt="iPhone Frame"
                    className="h-[500px]"
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
                    className="object-cover w-[90%] h-[96.2%] rounded-[26px] absolute top-2.5"
                  />
                </div>
                <div className="absolute top-0 z-10">
                  {wallpaper.isNew === 1 && (
                    <span className="new-tag bg-red-500 text-white px-2 py-1 rounded">
                      New
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <WallpaperDetails
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          wallpaper={selectedWallpaper}
        />
      </Layout>
    </>
  );
};

export default HomePage;
