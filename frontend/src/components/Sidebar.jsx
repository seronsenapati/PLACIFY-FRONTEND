import { NavLink, useLocation } from "react-router-dom";
import { Users as UsersIcon } from "./CustomIcons";
import { Link } from "react-router-dom";
import { useState } from "react";

import {
  Home as HomeIcon,
  User as UserIcon,
  Briefcase as BriefcaseIcon,
  MessageSquare as MessageIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  FileText as FileTextIcon,
  Building2 as BuildingIcon,
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  Bell as BellIcon,
  ChevronLeft as ChevronLeftIcon,
  ClipboardList as ClipboardListIcon,
} from "./CustomIcons";

const getIcon = (name, collapsed = false) => {
  const iconClass = `w-5 h-5 transition-all duration-200 group-hover:scale-110 ${
    collapsed ? "mx-auto" : ""
  }`;

  switch (name.toLowerCase()) {
    case "dashboard":
      return <HomeIcon className={iconClass} />;
    case "search jobs":
      return <SearchIcon className={iconClass} />;
    case "my applications":
      return <FileTextIcon className={iconClass} />;
    case "profile":
      return <UserIcon className={iconClass} />;
    case "settings":
      return <SettingsIcon className={iconClass} />;
    case "company profile":
      return <BuildingIcon className={iconClass} />;
    case "manage jobs":
    case "jobs":
      return <BriefcaseIcon className={iconClass} />;
    case "applicants":
    case "users":
    case "companies":
      return <UsersIcon className={iconClass} />;
    case "notifications":
      return <BellIcon className={iconClass} />;
    case "bookmarks":
    case "saved jobs":
      return <BookmarkIcon className={iconClass} />;
    case "applications":
      return <ClipboardListIcon className={iconClass} />;
    default:
      return <span className="w-5 h-5"></span>;
  }
};

export default function Sidebar({ links = [], collapsed = false, onToggle, role, username }) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <aside className="w-full h-full text-white relative flex flex-col">
      <div className="p-2 h-full flex flex-col">
        {/* Header Section */}
        <div className="flex-1">
          {/* Logo */}
          <div className={`${collapsed ? 'p-2 pt-5 mb-2 text-center' : 'p-2 pt-4 mb-2 text-center'} transition-all duration-300`}>
            <Link
              to="/"
              className={`font-bold tracking-wide placify-font-style transition-all duration-300 ${
                collapsed 
                  ? 'text-5xl border-3 border-white rounded-full w-13 h-13 flex items-center justify-center mx-auto -mt-2' 
                  : 'text-5xl'
              }`}
            >
              {collapsed ? 'P' : 'Placify'}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {links.map((link, index) => {
              const active =
                location.pathname === link.path ||
                (link.matchPrefix &&
                  location.pathname.startsWith(link.matchPrefix));

              return (
                <div key={link.path} className="relative">
                  <NavLink
                    to={link.path}
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`relative flex items-center ${collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'} rounded-lg transition-all duration-200 group overflow-hidden
                    ${
                      active
                        ? "bg-gradient-to-r from-white/15 to-white/2 text-white shadow-lg"
                        : "text-gray-300 hover:bg-gradient-to-r hover:from-white/8 hover:to-white/1 hover:text-white"
                    }`}
                  >
                    {/* Icon and content */}
                    <div className={`relative flex items-center ${collapsed ? 'justify-center w-full' : 'w-full'}`}>
                      <div className={`flex-shrink-0 ${collapsed ? '' : 'mr-3'}`}>
                        {getIcon(link.name, collapsed)}
                      </div>
                      
                      {!collapsed && (
                        <>
                          <span className="text-sm font-medium flex-1 truncate">
                            {link.name}
                          </span>
                          
                          {/* Notification Badge */}
                          <div className="ml-2 flex-shrink-0 flex items-center">
                            {link.badge && (
                              <div className="flex items-center">
                                {link.badge === 'New' ? (
                                  <div className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full">
                                    {link.badge}
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {link.badge}
                                  </div>
                                )}
                              </div>
                            )}
                            {/* Red dot for unread notifications */}
                            {link.name === 'Notifications' && link.badge && parseInt(link.badge) > 0 && (
                              <div className="w-2 h-2 bg-red-500 rounded-full ml-1 animate-pulse"></div>
                            )}
                          </div>

                        </>
                      )}
                    </div>
                  </NavLink>
                  
                  {/* Tooltip for collapsed mode */}
                  {collapsed && hoveredItem === index && (
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 z-50">
                      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl border border-white/20 whitespace-nowrap text-sm">
                        {link.name}
                        <div className="flex items-center">
                          {link.badge && (
                            <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-xs rounded-full">
                              {link.badge}
                            </span>
                          )}
                          {/* Red dot for unread notifications in tooltip */}
                          {link.name === 'Notifications' && link.badge && parseInt(link.badge) > 0 && (
                            <div className="w-2 h-2 bg-red-500 rounded-full ml-1 animate-pulse"></div>
                          )}
                        </div>
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </nav>
        </div>

        {/* Collapse Toggle Button */}
        {onToggle && (
          <div className="px-2 pb-2">
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 group"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeftIcon 
                className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                  collapsed ? 'rotate-180' : ''
                }`} 
              />
              {!collapsed && (
                <span className="ml-2 text-xs font-medium">Collapse</span>
              )}
            </button>
          </div>
        )}

        {/* Copyright Footer */}
        <div className="mt-auto pt-4 text-center text-xs text-gray-400 border-t border-white/5">
          {new Date().getFullYear()} Placify. All rights reserved.
        </div>
      </div>
    </aside>
  );
}