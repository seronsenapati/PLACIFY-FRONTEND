import Sidebar from "../../components/Sidebar";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const [applications, setApplications] = useState([]);

  const studentLinks = [
    { name: "Dashboard", path: "/student/dashboard" },
    { name: "Search Jobs", path: "/student/jobs" },
    { name: "My Applications", path: "/student/applications" },
    { name: "Profile", path: "/student/profile" },
  ];

  useEffect(() => {
    // TODO: replace with GET /applications/me
    setApplications([
      { id: 1, title: "Frontend Developer", company: "Tech Corp", status: "Pending" },
      { id: 2, title: "Backend Engineer", company: "CodeWorks", status: "Accepted" },
      { id: 3, title: "UI/UX Designer", company: "Designify", status: "Rejected" },
    ]);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black bg-black text-white">
      <Sidebar links={studentLinks} />

      <div className="flex-1 p-6 md:p-10">
        <div className="bg-black bg-opacity-70 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Applied Jobs", value: applications.length },
              { label: "Interviews", value: 2 },
              { label: "Jobs Saved", value: 5 },
              { label: "Profile Completion", value: "85%" },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/20 bg-opacity-70 p-4 rounded-xl shadow hover:shadow-lg transition">
                <h2 className="text-lg font-semibold">{item.label}</h2>
                <p className="text-2xl font-bold mt-2">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/20 bg-opacity-70 p-6 rounded-xl shadow mb-8 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-2">Job Title</th>
                  <th className="pb-2">Company</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-800">
                    <td className="py-2">{app.title}</td>
                    <td className="py-2">{app.company}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          app.status === "Accepted"
                            ? "bg-green-700"
                            : app.status === "Rejected"
                            ? "bg-red-700"
                            : "bg-yellow-700"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Link to="/student/jobs" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition">
              Search Jobs
            </Link>
            <Link to="/student/profile" className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
