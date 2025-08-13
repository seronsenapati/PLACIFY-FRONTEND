import { NavLink } from "react-router-dom";

export default function Sidebar({ links }) {
  return (
    <div className="text-white h-screen mt-16 p-6 w-64 bg-black/90 shadow-lg">
      <nav className="space-y-3" aria-label="Sidebar navigation">
        {links.map((link, idx) => (
          <NavLink
            key={idx}
            to={link.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 transition-all duration-300 text-sm md:text-base
              ${
                isActive
                  ? "bg-white/10 border border-white/30 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
