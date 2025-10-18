import React from "react";
import { NavLink } from "react-router-dom";
import { FaEdit, FaExchangeAlt, FaShoppingCart, FaUsers } from "react-icons/fa";
import { HiHome } from "react-icons/hi";
import { MdOutlineAddBusiness, MdOutlineBusiness, MdOutlineSell } from "react-icons/md";

const Selbar = ({isOpenSelbar, setIsOpenSelbar}) => {
  console.log(isOpenSelbar);
  const menu = [
    { name: "Sklad", icon: <HiHome className="text-xl" />, path: "/" },
    { name: "Buyurtmalar", icon: <FaShoppingCart className="text-xl" />, path: "/orders" },
    { name: "Maxsulot qo'shish", icon: <MdOutlineAddBusiness className="text-2xl" />, path: "/addProducts" },
    { name: "Maxsulot sotish", icon: <MdOutlineSell className="text-2xl" />, path: "/sellProducts" },
    { name: "Narxlarni o'zgartirish", icon: <FaEdit className="text-2xl" />, path: "/editProducts" },
    // { name: "Mijozlar", icon: <FaUsers className="text-2xl" />, path: "/clients" },
  ];

  return (
    <div>
    <div className="w-[20%] fixed max-sm:hidden max-sm:w-[50%] max-sm:z-10  shadow-2xl top-0 bottom-0 bg-white">
      <div className="pt-25 max-sm:pt-10 pl-0">
        <ul  className="text-lg max-lg:text-sm font-semibold flex flex-col gap-7">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpenSelbar(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-300 
                ${
                  isActive
                    ? "border-l-4 border-[#155CA5] text-[#155CA5] bg-purple-50 font-bold"
                    : "text-gray-600 hover:text-blue-600 hover:bg-purple-50"
                }`
              }
            >
              {item.icon}
              <button >{item.name}</button>
            </NavLink>
          ))}
        </ul>
      </div>
    </div>

    {
      isOpenSelbar && 

<div className="w-[20%] fixed max-sm:absolute max-sm:w-[70%] max-sm:z-10  shadow-2xl top-0 bottom-0 bg-white">
      <div className="pt-25 relative max-sm:pt-10 pl-0">
        <button onClick={() => setIsOpenSelbar(false)} className="absolute top-2 right-2">✖</button>
        <ul className="text-lg max-lg:text-sm font-semibold flex flex-col gap-7">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth <= 640) setIsOpenSelbar(false);
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-300 
                ${
                  isActive
                    ? "border-l-4 border-blue-600 text-blue-600 bg-purple-50 font-bold"
                    : "text-gray-600 hover:text-blue-600 hover:bg-purple-50"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </ul>
      </div>
    </div>
    
    }
    
    </div>
  );
};

export default Selbar;
