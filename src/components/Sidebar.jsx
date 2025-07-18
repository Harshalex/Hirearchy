import {
  FaRegChartBar,
  FaRegCheckCircle,
  FaRegFileAlt,
  FaRegLightbulb,
  FaRegBuilding,
  FaRegCreditCard,
  FaCog,
  FaRegUser,
  FaRegArrowAltCircleRight,
} from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi";
import { FiMessageSquare } from "react-icons/fi";
import { BsLightningCharge } from "react-icons/bs";
import { HiOutlineDocumentText } from "react-icons/hi";
import { GoLightBulb } from "react-icons/go";
import { VscGraph } from "react-icons/vsc";
import { LuMessageSquare } from "react-icons/lu";
import { IoSearchOutline } from "react-icons/io5";
import { TbBrain } from "react-icons/tb";
import { FiHome } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import images from "../common/images";
import React from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const mainLinks = [
    { icon: <FiHome />, label: "Dashboard" },
    { icon: <IoSearchOutline />, label: "Talent Search", to: "/talent-search" },
    { icon: <TbBrain />, label: "AI Agents" },
    { icon: <LuMessageSquare />, label: "Messaging" },
    { icon: <HiOutlineDocumentText />, label: "Contracts" },
    { icon: <VscGraph />, label: "Reports" },
    { icon: <GoLightBulb />, label: "Idea Box" },
  ];

  return (
    <aside className="w-64 flex-shrink-0 min-h-screen bg-[#f8f7f2] border-r flex flex-col justify-between px-6 py-6">
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 rounded-md p-2">
            <img src={images.logo} alt="logo" srcSet="" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight">
            Hirearchy.ai
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          {mainLinks.map((link) => (
            <SidebarLink
              key={link.label}
              icon={link.icon}
              label={link.label}
              to={link.to}
              active={
                (link.to === "/talent-search" && (/^\/talent-search(\/\d+)?$/.test(location.pathname))) ||
                (link.to &&
                  link.to !== "/talent-search" &&
                  location.pathname.startsWith(link.to))
              }
            />
          ))}
        </nav>
        <div className="mt-8 space-y-2">
          <SidebarSection title="Company" />
          <SidebarLink icon={<FaRegBuilding />} label="Company Profile" />
          <SidebarSection title="Talent" />
          <SidebarLink icon={<FaRegUser />} label="Approved Users" />
          <SidebarSection title="Integration" />
          <SidebarLink
            icon={<FaRegArrowAltCircleRight />}
            label="All Integrations"
          />
          <SidebarSection title="Billing" />
          <SidebarLink icon={<FaRegCreditCard />} label="Subscription Plans" />
          <SidebarSection title="Setting" />
          <SidebarLink icon={<FaCog />} label="Ai Settings" />
        </div>
      </div>
      <div className="flex items-center gap-3 bg-[#f3f2ed] rounded-md p-3 mt-8">
        <FaUserCircle className="text-3xl text-blue-600" />
        <div className="flex-1">
          <div className="text-xs font-bold">User</div>
          <div className="text-xs text-gray-500">user@company.com</div>
        </div>
        <div className="ml-auto">
          <button className="w-10 h-5 bg-blue-100 rounded-full flex items-center transition-all duration-200">
            <span className="w-4 h-4 bg-blue-600 rounded-full ml-1"></span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export function SidebarLink({ icon, label, active, to }) {
  const baseClass = `flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition font-medium`;
  const activeClass = `bg-blue-500 text-white font-bold`;
  const inactiveClass = `text-black hover:bg-blue-500 hover:text-white`;

  // Image filter class
  const imageClass = `${
    active
      ? "filter invert brightness-0"
      : "group-hover:filter group-hover:invert group-hover:brightness-0"
  } transition`;

  const content = (
    <>
      <span className="text-lg">
        {/* Apply image filter class if using image */}
        {typeof icon === "string" ? (
          <img src={icon} alt="icon" className={imageClass} />
        ) : (
          icon
        )}
      </span>
      <span>{label}</span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={`group ${baseClass} ${active ? activeClass : inactiveClass}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`group ${baseClass} ${active ? activeClass : inactiveClass}`}
    >
      {content}
    </div>
  );
}

export function SidebarSection({ title }) {
  return (
    <div className="text-xs text-gray-400 font-semibold mt-4 mb-1 pl-1 tracking-wide">
      {title}
    </div>
  );
}

export default Sidebar;

// export function SidebarLink({ icon, label, active, to }) {
//   if (to) {
//     return (
//       <Link to={to} className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition font-medium ${active ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50 text-gray-700'}`}>
//         <span className="text-lg">{icon}</span>
//         <span>{label}</span>
//       </Link>
//     );
//   }
//   return (
//     <div className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition font-medium ${active ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50 text-gray-700'}`}>
//       <span className="text-lg">{icon}</span>
//       <span>{label}</span>
//     </div>
//   );
// }
