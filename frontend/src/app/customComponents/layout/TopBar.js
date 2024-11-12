import { SidebarTrigger } from "../../../components/ui/sidebar";
import { useLocation } from "react-router-dom";

const TopBar = () => {
  const location = useLocation();

  return (
    <>
      <div className="w-full">
        <div className="flex items-center gap-5 bg-[#18181B] py-4 px-8 border-b border-[216 34% 17%]">
            <SidebarTrigger className="lg:hidden" />
            <h3 className="font-bold text-[#EEEEEE]">Cozy Aesthetic Wallpaper</h3>
        </div>
      </div>
    </>
  );
};

export default TopBar;
