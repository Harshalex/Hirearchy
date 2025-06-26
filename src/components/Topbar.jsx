import { FaRegBell, FaSearch, FaRegCheckCircle } from 'react-icons/fa';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export function NotificationPopover() {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button className="relative focus:outline-none">
            <FaRegBell className="text-2xl text-gray-500" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-20 mt-2 w-80 bg-white rounded-md shadow-lg p-6">
              <div className="font-bold text-lg mb-2">Notifications</div>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>"Michael hasn't replied in 3 days"</li>
                <li>"AI found 5 new UX Designers"</li>
              </ul>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

function Topbar() {
  return (
    <header className="flex items-center justify-between px-10 py-5 border-b bg-white sticky top-0 z-10 shadow-sm">
      <div>
        <h1 className="text-3xl font-extrabold leading-tight">Dashboard</h1>
        <p className="text-gray-500 text-base mt-1">Welcome back! Here's your recruitment overview.</p>
      </div>
      <div className="flex items-center gap-5">
        <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm">
          <FaRegCheckCircle /> AI Active
        </span>
        <div className="relative">
          <input type="text" placeholder="Search..." className="border border-gray-200 rounded-full px-5 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm w-56" />
          <FaSearch className="absolute right-4 top-3 text-gray-400" />
        </div>
        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-600 transition">New Search</button>
        <NotificationPopover />
      </div>
    </header>
  );
}

export default Topbar; 