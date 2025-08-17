import { NavLink, useLocation } from "react-router-dom";

export default function Sidebar({ links = [] }) {
  const location = useLocation();

  return (
    <aside className="pt-7 w-full h-full backdrop-blur-lg border-r border-dashed border-white/30 text-white shadow-lg">

      {/* Nav */}
      <nav className="p-4 space-y-5">
        {links.map((link) => {
          const active =
            location.pathname === link.path ||
            (link.matchPrefix && location.pathname.startsWith(link.matchPrefix));
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={`block px-4 py-2.5 rounded-lg border transition
                ${
                  active
                    ? "bg-white/15 border-white/20"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm md:text-base">{link.name}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
