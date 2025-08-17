import { useEffect, useState } from "react";
import { 
  Briefcase as BriefcaseIcon,
  Calendar as CalendarIcon,
  Bookmark as BookmarkIcon,
  UserCheck as UserCheckIcon,
  Eye as EyeIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon
} from "lucide-react";

export default function StudentDashboard() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Example demo data
    setApplications([
      { 
        id: 1, 
        title: "Frontend Developer", 
        company: "Tech Corp", 
        status: "Pending",
        appliedDate: "2023-06-15",
        location: "Remote"
      },
      { 
        id: 2, 
        title: "Backend Engineer", 
        company: "CodeWorks", 
        status: "Accepted",
        appliedDate: "2023-06-12",
        location: "New York, NY"
      },
      { 
        id: 3, 
        title: "UI/UX Designer", 
        company: "Designify", 
        status: "Rejected",
        appliedDate: "2023-06-05",
        location: "San Francisco, CA"
      },
    ]);
  }, []);

  const stats = [
    { 
      label: "Applications Sent", 
      value: applications.length, 
      change: "+3 this week",
      icon: <BriefcaseIcon className="w-5 h-5 text-blue-300" />,
    },
    { 
      label: "Interviews", 
      value: "5", 
      change: "+2 this week",
      icon: <CalendarIcon className="w-5 h-5 text-amber-300" />,
    },
    { 
      label: "Saved Jobs", 
      value: "12", 
      icon: <BookmarkIcon className="w-5 h-5 text-purple-300" />,
    },
    { 
      label: "Profile Completion", 
      value: "85%", 
      icon: <UserCheckIcon className="w-5 h-5" />,
      progress: 85
    },
  ];

  const getStatusStyles = (status) => {
    const baseStyles = "px-3 py-1.5 rounded-full text-xs font-medium flex items-center";
    
    switch(status) {
      case "Accepted":
        return `${baseStyles} bg-green-500/10 text-green-400`;
      case "Rejected":
        return `${baseStyles} bg-red-500/10 text-red-400`;
      case "Pending":
        return `${baseStyles} bg-yellow-500/10 text-yellow-400`;
      case "Interview":
        return `${baseStyles} bg-blue-500/10 text-blue-400`;
      default:
        return `${baseStyles} bg-gray-500/10 text-gray-400`;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Accepted":
        return <CheckCircleIcon className="w-4 h-4 mr-1.5" />;
      case "Rejected":
        return <XCircleIcon className="w-4 h-4 mr-1.5" />;
      case "Pending":
        return <ClockIcon className="w-4 h-4 mr-1.5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10 hover:border-white/20 h-full flex flex-col"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-400 truncate">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{stat.value}</p>
                {stat.change && (
                  <span className="inline-flex items-center text-xs mt-1 text-green-400">
                    {stat.change} from last week
                  </span>
                )}
                {stat.progress && (
                  <div className="mt-2 w-full bg-gray-700/50 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full" 
                      style={{ width: `${stat.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 ml-4 p-2.5 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm flex items-center justify-center h-10 w-10">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Applications */}
      <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 mt-8">
        <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
          <h2 className="text-xl font-semibold">Recent Applications</h2>
          <p className="text-sm text-gray-400 mt-1">Your recent job applications</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applied</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {applications.map((app, index) => (
                <tr 
                  key={app.id}
                  className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/2.5' : 'bg-white/5'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{app.title}</div>
                    <div className="text-sm text-gray-400">ID: {app.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {app.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {app.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1.5 text-gray-500" />
                      {app.appliedDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={getStatusStyles(app.status)}>
                      {getStatusIcon(app.status)}
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
              
              {!applications.length && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-400">No applications found</div>
                    <p className="mt-1 text-sm text-gray-500">Your job applications will appear here</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing <span className="font-medium">1-{applications.length}</span> of <span className="font-medium">{applications.length}</span> applications
          </p>
          <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            View all applications →
          </button>
        </div>
      </section>
    </div>
  );
}
