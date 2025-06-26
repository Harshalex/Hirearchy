import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

function FilterDropdown({ options, selected, setSelected, label }) {
  return (
    <Menu as="div" className="relative w-full">
      <Menu.Button className="w-full bg-white border rounded-md px-4 py-2 text-left text-gray-700 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-200">
        {selected} <span className="ml-2 text-gray-400">▼</span>
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
        <Menu.Items className="absolute left-0 mt-2 w-full bg-white border rounded-md shadow-lg z-10">
          {options.map(option => (
            <Menu.Item key={option}>
              {({ active }) => (
                <button
                  className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-blue-100' : ''}`}
                  onClick={() => setSelected(option)}
                >
                  {option}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default FilterDropdown; 