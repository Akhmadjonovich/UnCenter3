import React from "react";
import Selbar from "../components/Selbar";
import Navbar from "../components/Navbar";
import { useState } from "react";
const Layout = ({ children }) => {

  let [isOpenSelbar , setIsOpenSelbar] = useState(false) 
  return (
    <div className="flex max-sm:relative">
      {/* Sidebar */}
      <Selbar isOpenSelbar={isOpenSelbar} setIsOpenSelbar={setIsOpenSelbar}/>

      {/* Main content */}
      <div className="ml-[20%] max-sm:w-full max-sm:ml-0 w-[80%] h-screen flex flex-col bg-gray-50">
        <Navbar setIsOpenSelbar={setIsOpenSelbar}/>

        {/* Scroll bo‘ladigan joy */}
        <div className="flex-1 max-sm:w-full overflow-y-auto p-6 max-sm:px-2 text-gray-800">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
