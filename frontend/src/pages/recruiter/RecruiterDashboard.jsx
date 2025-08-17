// src/pages/recruiter/RecruiterDashboard.jsx
import Sidebar from "../../components/Sidebar";
import { useMemo } from "react";
import { getName } from "../../utils/auth";

export default function RecruiterDashboard() {
  const links = useMemo(
    () => [
      { name: "Dashboard", path: "/recruiter", matchPrefix: "/recruiter" },
      { name: "Posted Jobs", path: "/recruiter/jobs" },
      { name: "Create Job", path: "/recruiter/create" },
      { name: "Applicants", path: "/recruiter/applicants" },
    ],
    []
  );

  const cards = [
    { label: "Active Jobs", value: 4 },
    { label: "Total Applicants", value: 28 },
    { label: "Interviews Scheduled", value: 3 },
    { label: "Hires", value: 1 },
  ];

  const username = getName();

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
              {username ? `${username}'s Dashboard` : "Recruiter Dashboard"}
            </h1>
            <p className="text-gray-300 mt-1">Manage jobs and applicants.</p>
          </header>

          {/* Summary Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {cards.map((c) => (
              <div
                key={c.label}
                className="rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 p-5 shadow"
              >
                <p className="text-sm text-gray-300">{c.label}</p>
                <p className="text-2xl font-semibold mt-2">{c.value}</p>
              </div>
            ))}
          </section>

          {/* Recent Applicants */}
          <section className="rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Applicants</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-300">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: 1,
                      name: "Aarav Shah",
                      role: "Frontend Dev",
                      status: "Under Review",
                    },
                    {
                      id: 2,
                      name: "Isha Singh",
                      role: "Backend Dev",
                      status: "Interview",
                    },
                  ].map((a) => {
                    const statusColors = {
                      "Under Review": "bg-blue-500/20 text-blue-300 border-blue-500/30",
                      Interview: "bg-purple-500/20 text-purple-300 border-purple-500/30",
                      Hired: "bg-green-500/20 text-green-300 border-green-500/30",
                      Rejected: "bg-red-500/20 text-red-300 border-red-500/30",
                      "Offer Sent": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                      default: "bg-white/5 text-gray-200 border-white/10",
                    };

                    const statusClass = statusColors[a.status] || statusColors["default"];

                    return (
                      <tr
                        key={a.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 pr-4">{a.name}</td>
                        <td className="py-3 pr-4 text-gray-300">{a.role}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClass}`}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          
        </div>
      </div>
    </div>
  );
}
