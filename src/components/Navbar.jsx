import React from 'react'

import { FaTruck, FaBox, FaMoneyBillWave, FaUser, FaMoon, FaFonticonsFi, FaBars } from "react-icons/fa";
import { IoIosNotifications } from 'react-icons/io';

const Navbar = ({setIsOpenSelbar}) => {
  return (
    <div className='items-center justify-between flex p-4 shadow-xl fixed top-0 right-0 left-0 bg-white '>
        <div className='flex items-center gap-1'>
          <img src="/logo.png" className='w-10' alt="" />
          <h3 className='text-3xl max-md:text-2xl font-bold'>UnCenter</h3>
        </div>
        <div className='flex items-center gap-10 max-sm:gap-5'>
            {/* <FaMoon className='text-xl'/>
            <IoIosNotifications className='text-2xl' /> 
            <FaUser className='text-xl' /> */}
            <button onClick={() => setIsOpenSelbar(true)}><FaBars className='text-xl sm:hidden'/></button>
        </div>
        
    </div>
  )
}

export default Navbar