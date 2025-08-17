// src/pages/student/StudentDashboard.jsx
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getName } from "../../utils/auth";

export default function StudentDashboard() {
  const [applications, setApplications] = useState([]);
  const username = getName();

  const links = [
    { name: "Dashboard", path: "/student/dashboard", matchPrefix: "/student/dashboard" },
    { name: "Search Jobs", path: "/student/jobs" },
    { name: "My Applications", path: "/student/applications" },
    { name: "Profile", path: "/student/profile" },
  ];

  useEffect(() => {
    setApplications([
      { id: 1, title: "Frontend Developer", company: "Tech Corp", status: "Pending" },
      { id: 2, title: "Backend Engineer", company: "CodeWorks", status: "Accepted" },
      { id: 3, title: "UI/UX Designer", company: "Designify", status: "Rejected" },
    ]);
  }, []);

  return (
    <div className="flex bg-gradient-to-br from-gray-900 to-black text-white pt-7">
      {/* Sidebar */}
      <div className="w-64">
        <Sidebar links={links} />
      </div>

      {/* Main content area */}
      <div className="flex-1">
        <div className="p-6 md:p-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">
              {username ? `${username}'s Dashboard` : "Student Dashboard"}
            </h1>
            <p className="text-gray-300 mt-1">Track your applications and profile.</p>
          </header>

          {/* Summary Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Applied Jobs", value: applications.length },
              { label: "Interviews", value: 2 },
              { label: "Jobs Saved", value: 5 },
              { label: "Profile Completion", value: "85%" },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 p-5 shadow"
              >
                <p className="text-sm text-gray-300">{c.label}</p>
                <p className="text-2xl font-semibold mt-2">{c.value}</p>
              </div>
            ))}
          </section>

          {/* Recent Applications */}
          <section className="rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-300">
                    <th className="py-2 pr-4">Job Title</th>
                    <th className="py-2 pr-4">Company</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-4">{app.title}</td>
                      <td className="py-3 pr-4 text-gray-300">{app.company}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-2.5 py-1 rounded text-xs border ${
                            app.status === "Accepted"
                              ? "bg-green-500/20 border-green-500/30 text-green-300"
                              : app.status === "Rejected"
                              ? "bg-red-500/20 border-red-500/30 text-red-300"
                              : "bg-yellow-500/20 border-yellow-500/30 text-yellow-300"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!applications.length && (
                    <tr>
                      <td colSpan={3} className="py-6 text-gray-400">
                        No applications yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
