const BottomMenu = () => {
  return (
    <>
      <div className="fixed bottom-[50px] left-0 flex items-center justify-center w-full">
        <div className="backdrop-blur-sm bg-[#262626]/[50%] rounded-[50px] py-2 px-2 flex items-center gap-2">
          <a href="/" className="bg-white text-black py-2 px-5 rounded-[50px]">
            Phone
          </a>
          <a href="/desktop" className="text-white py-2 px-5 rounded-[50px]">
            Desktop
          </a>
          <a href="/tablet" className="text-white py-2 px-5 rounded-[50px]">
            Tablet
          </a>
        </div>
      </div>
    </>
  );
};

export default BottomMenu;
