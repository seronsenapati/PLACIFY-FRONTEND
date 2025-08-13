import Sidebar from "../../components/Sidebar";
import { Link } from "react-router-dom";

export default function RecruiterDashboard() {
  const recruiterLinks = [
    { name: "Dashboard", path: "/recruiter/dashboard" },
    { name: "Posted Jobs", path: "/recruiter/jobs" },
    { name: "Applicants", path: "/recruiter/applicants" },
    { name: "Create Job", path: "/recruiter/create" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black bg-black text-white">
      <Sidebar links={recruiterLinks} />

      <div className="flex-1 p-6 md:p-10">
        <div className="bg-black bg-opacity-70 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6">Recruiter Dashboard</h1>
          <p className="text-gray-300 mb-6">
            Manage your posted jobs and view applicants here.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 bg-opacity-70 p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold">Jobs Posted</h2>
              <p className="text-2xl font-bold mt-2">12</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 bg-opacity-70 p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold">Applicants</h2>
              <p className="text-2xl font-bold mt-2">34</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 bg-opacity-70 p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold">Interviews Scheduled</h2>
              <p className="text-2xl font-bold mt-2">5</p>
            </div>
          </div>

          <div className="mt-8 flex gap-4 flex-wrap">
            <Link to="/recruiter/create" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition">
              Create New Job
            </Link>
            <Link to="/recruiter/jobs" className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition">
              View Posted Jobs
            </Link>
            <Link to="/recruiter/applicants" className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-lg transition">
              View Applicants
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
