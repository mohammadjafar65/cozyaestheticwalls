import { SidebarTrigger } from "../../../components/ui/sidebar";
import { useLocation } from "react-router-dom";

const TopBar = ({ activeTag }) => {
  const location = useLocation();

  return (
    <>
      <div className="w-full sticky top-0 z-20">
        <div className="flex items-center gap-3 backdrop-blur-md bg-[#18181B]/80 py-4 px-8 border-b border-[216 34% 17%]">
          <SidebarTrigger className="lg:hidden" />
          <div className="flex items-center gap-3">
            <img
              src="../logo.png"
              className="w-7"
              alt="Cozy Aesthetic Wallpaper"
            />
            <h1 className="text-[#EEEEEE] font-bold m-0 p-0">Cozy Aesthetic Wallpaper</h1>|
          </div>
          <h3 className="text-[#EEEEEE]">
            {activeTag && `${activeTag}`}
          </h3>
        </div>
      </div>
    </>
  );
};

export default TopBar;
