import { SidebarTrigger } from "../../../components/ui/sidebar";
import { useLocation } from "react-router-dom";

const TopBar = ({ activeTag }) => {
  const location = useLocation();

  return (
    <>
      <div className="w-full sticky top-0 z-20">
        <div className="flex items-center gap-5 backdrop-blur-md bg-[#18181B]/80 py-4 px-8 border-b border-[216 34% 17%]">
          <SidebarTrigger className="lg:hidden" />
          <h3 className="font-bold text-[#EEEEEE]">
            {activeTag && `${activeTag}`}
          </h3>
        </div>
      </div>
    </>
  );
};

export default TopBar;
