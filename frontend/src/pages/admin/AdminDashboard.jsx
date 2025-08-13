import Sidebar from "../../components/Sidebar";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Manage Users", path: "/admin/users" },
    { name: "Manage Jobs", path: "/admin/jobs" },
    { name: "Reports", path: "/admin/reports" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black bg-black text-white">
      <Sidebar links={adminLinks} />

      <div className="flex-1 p-6 md:p-10">
        <div className="bg-black bg-opacity-70 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          <p className="text-gray-300 mb-6">
            Monitor platform activity, manage users, and oversee job postings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 bg-opacity-70 p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold">Total Users</h2>
              <p className="text-2xl font-bold mt-2">250</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 bg-opacity-70 p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold">Active Jobs</h2>
              <p className="text-2xl font-bold mt-2">87</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 bg-opacity-70 p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold">Reports</h2>
              <p className="text-2xl font-bold mt-2">15</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 bg-opacity-70 p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold">Pending Approvals</h2>
              <p className="text-2xl font-bold mt-2">4</p>
            </div>
          </div>

          <div className="mt-8">
            <Link to="/admin/users" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition">
              Manage Users
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
