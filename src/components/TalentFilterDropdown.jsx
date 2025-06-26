import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { FaRegChartBar } from 'react-icons/fa';

function TalentFilterDropdown() {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="ml-2 p-2 rounded-full hover:bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200">
        <FaRegChartBar className="text-blue-600" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow z-20">
          <Menu.Item>
            {({ active }) => (
              <button className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-blue-100' : ''}`}>Match %</button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-blue-100' : ''}`}>Status</button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default TalentFilterDropdown; 