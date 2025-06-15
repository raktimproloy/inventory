import React, { useEffect, useRef } from 'react';

interface DropdownOption {
  id: any;
  name: string;
  title: string;
  action: () => void;
}

interface DropdownProps {
  id: any;
  options: DropdownOption[];
  isOpen?: boolean;
  toggleDropdown?: () => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, isOpen, toggleDropdown }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        toggleDropdown?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleDropdown]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-7 mb-2 w-48 rounded-lg bg-white shadow-lg border border-[#D0D5DD] py-1 z-50">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                option.action();
                toggleDropdown?.();
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#e8eaeb] transition-colors duration-200 ease-in-out flex items-center gap-2"
            >
              <img src={option.name} alt={option.title} className="w-4 h-4" />
              <span>{option.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
