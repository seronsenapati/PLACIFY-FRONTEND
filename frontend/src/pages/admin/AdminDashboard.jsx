import { useEffect, useState } from "react";
import { 
  Users as UsersIcon, 
  Briefcase as BriefcaseIcon,
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  Building as BuildingOfficeIcon,
  FileText as DocumentTextIcon
} from "../../components/CustomIcons";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Example demo data (replace with API later)
    setReports([
      { 
        id: 1, 
        title: "Spam Job Post", 
        status: "Pending Review",
        reportedBy: "John Doe",
        date: "2023-06-15"
      },
      { 
        id: 2, 
        title: "Abusive User", 
        status: "Resolved",
        reportedBy: "Jane Smith",
        date: "2023-06-10"
      },
      { 
        id: 3, 
        title: "Fake Company Profile", 
        status: "In Progress",
        reportedBy: "Alex Johnson",
        date: "2023-06-05"
      },
    ]);
  }, []);

  const stats = [
    {
      label: "Total Users",
      value: "1,284",
      change: "+12.5%",
      icon: <UsersIcon className="w-5 h-5 text-blue-300" />,
    },
    {
      label: "Active Jobs",
      value: "342",
      change: "+5.2%",
      icon: <BriefcaseIcon className="w-5 h-5 text-emerald-300" />,
    },
    {
      label: "Companies",
      value: "128",
      icon: <BuildingOfficeIcon className="w-5 h-5 text-amber-300" />,
    },
    {
      label: "New Applications",
      value: "1,284",
      change: "+24.1%",
      icon: <DocumentTextIcon className="w-5 h-5 text-purple-300" />,
    },
    {
      label: "Reports Pending",
      value: reports.filter((r) => r.status === "Pending Review").length,
      icon: <AlertCircleIcon className="w-5 h-5" />,
      change: "-2"
    },
    {
      label: "Resolved Reports",
      value: reports.filter((r) => r.status === "Resolved").length,
      icon: <CheckCircleIcon className="w-5 h-5" />,
    },
  ];

  const getStatusStyles = (status) => {
    const baseStyles = "px-3 py-1.5 rounded-full text-xs font-medium flex items-center";
    
    switch(status) {
      case "Resolved":
        return `${baseStyles} bg-green-500/10 text-green-400`;
      case "In Progress":
        return `${baseStyles} bg-blue-500/10 text-blue-400`;
      case "Pending Review":
        return `${baseStyles} bg-yellow-500/10 text-yellow-400`;
      default:
        return `${baseStyles} bg-gray-500/10 text-gray-400`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10 hover:border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                {stat.change && (
                  <span className="inline-flex items-center text-xs mt-1 text-green-400">
                    {stat.change} from last week
                  </span>
                )}
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Reports */}
      <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
        <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
          <h2 className="text-xl font-semibold">Recent Reports</h2>
          <p className="text-sm text-gray-400 mt-1">Latest reports from users and system</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Report</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reported By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reports.map((report, index) => (
                <tr 
                  key={report.id}
                  className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/2.5' : 'bg-white/5'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{report.title}</div>
                    <div className="text-sm text-gray-400">ID: {report.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {report.reportedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1.5 text-gray-500" />
                      {report.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={getStatusStyles(report.status)}>
                      {report.status === "In Progress" && (
                        <span className="w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
                      )}
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
              
              {!reports.length && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="text-gray-400">No reports found</div>
                    <p className="mt-1 text-sm text-gray-500">New reports will appear here</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing <span className="font-medium">1-{reports.length}</span> of <span className="font-medium">{reports.length}</span> reports
          </p>
          <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            View all reports →
          </button>
        </div>
      </section>
    </div>
  );
}
