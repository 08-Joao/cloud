import React from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

function Layout({children, isOpen, setIsOpen}: {children: React.ReactNode, isOpen: boolean, setIsOpen: (value: boolean) => void}) {
  return (
    <div className="flex w-full h-screen">
        <Sidebar />
        <div className="flex flex-col w-full gap-2">
            <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
            {children}
        </div>
    </div>
  )
}

export default Layout