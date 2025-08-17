import { getName } from "../../utils/auth";
import Sidebar from "../../components/Sidebar";

export default function AdminDashboard() {
  const username = getName();
  const links = [
    { name: "Dashboard", path: "/admin/dashboard", matchPrefix: "/admin/dashboard" },
    { name: "Users", path: "/admin/users" },
    { name: "Jobs", path: "/admin/jobs" },
    { name: "Reports", path: "/admin/reports" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pt-7">
      <div className="flex">
        <div className="w-64 shrink-0">
          <Sidebar links={links} />
        </div>
        <div className="flex-1">
          <div className="p-6 md:p-10">
            <h1 className="text-3xl font-bold mb-4">
              {username ? `${username}'s Admin Dashboard` : "Admin Dashboard"}
            </h1>
            <p className="text-gray-300">
              Overview, moderation and platform controls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
