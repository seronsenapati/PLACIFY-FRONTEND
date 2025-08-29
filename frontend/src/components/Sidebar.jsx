import { NavLink, useLocation } from "react-router-dom";
import { Users as UsersIcon } from "./CustomIcons";

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
} from "./CustomIcons";
import { Link } from "react-router-dom";

const getIcon = (name) => {
  const iconClass =
    "w-5 h-5 transition-transform duration-200 group-hover:scale-110";

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
      return <MessageIcon className={iconClass} />;
    case "bookmarks":
    case "saved jobs":
      return <BookmarkIcon className={iconClass} />;
    default:
      return <span className="w-5 h-5"></span>;
  }
};

export default function Sidebar({ links = [] }) {
  const location = useLocation();

  return (
    <aside className="w-full h-full text-white/100 relative border-r border-dashed border-white/20">
      <div className="p-2 h-full flex flex-col">
        <div className="flex-1">
          <div className="p-2 pt-4 mb-2 text-center">
            <Link
              to="/"
              className="text-4xl font-bold tracking-wide placify-font-style"
            >
              Placify
            </Link>
          </div>

          <nav className="space-y-2">
            {links.map((link) => {
              const active =
                location.pathname === link.path ||
                (link.matchPrefix &&
                  location.pathname.startsWith(link.matchPrefix));

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                  ${
                    active
                      ? "bg-gradient-to-r from-white/15 to-white/2 text-white"
                      : "text-gray-300 hover:bg-gradient-to-r from-white/8 to-white/1"
                  }`}
                >
                  <div className="mr-3">{getIcon(link.name)}</div>
                  <span className="text-sm font-medium">{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-auto pt-4 text-center text-xs text-gray-400 border-t border-white/5">
          {new Date().getFullYear()} Placify. All rights reserved.
        </div>
      </div>
    </aside>
  );
}
