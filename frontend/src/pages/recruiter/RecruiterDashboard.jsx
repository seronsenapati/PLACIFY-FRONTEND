import { useEffect, useState } from "react";
import { 
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
  Clock as ClockIcon,
  MessageSquare as MessageSquareIcon,
  FileText as FileTextIcon
} from "../../components/CustomIcons";

export default function RecruiterDashboard() {
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    // Example demo data (can be replaced with API call later)
    setApplicants([
      { id: 1, name: "Aarav Shah", role: "Frontend Developer", status: "Under Review", appliedDate: "2023-06-15" },
      { id: 2, name: "Isha Singh", role: "Backend Engineer", status: "Interview", appliedDate: "2023-06-10" },
      { id: 3, name: "Rohan Mehta", role: "UI/UX Designer", status: "Hired", appliedDate: "2023-06-05" },
      { id: 4, name: "Priya Patel", role: "Full Stack Developer", status: "Rejected", appliedDate: "2023-06-01" },
      { id: 5, name: "Vikram Joshi", role: "DevOps Engineer", status: "Interview", appliedDate: "2023-05-28" },
    ]);
  }, []);

  const stats = [
    {
      label: "Total Jobs Posted",
      value: "24",
      change: "+2.1%",
      icon: <BriefcaseIcon className="w-5 h-5 text-blue-300" />,
    },
    {
      label: "Active Applications",
      value: applicants.length,
      change: "+12.4%",
      icon: <FileTextIcon className="w-5 h-5 text-emerald-300" />,
    },
    {
      label: "Interview Scheduled",
      value: 3,
      icon: <CalendarIcon className="w-5 h-5 text-amber-300" />,
    },
    {
      label: "New Messages",
      value: "5",
      icon: <MessageSquareIcon className="w-5 h-5 text-purple-300" />,
    },
  ];

  const getStatusStyles = (status) => {
    const baseStyles = "px-3 py-1.5 rounded-full text-xs font-medium flex items-center";
    
    switch(status) {
      case "Hired":
        return `${baseStyles} bg-green-500/10 text-green-400`;
      case "Rejected":
        return `${baseStyles} bg-red-500/10 text-red-400`;
      case "Interview":
        return `${baseStyles} bg-purple-500/10 text-purple-400`;
      case "Under Review":
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
            className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10 hover:border-white/20 hover:bg-white/10"
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

      {/* Recent Applicants */}
      <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
        <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
          <h2 className="text-xl font-semibold">Recent Applicants</h2>
          <p className="text-sm text-gray-400 mt-1">Latest job applications from candidates</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applied</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {applicants.slice(0, 3).map((applicant, index) => (
                <tr 
                  key={applicant.id} 
                  className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/2.5' : 'bg-white/5'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                        {applicant.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">{applicant.name}</div>
                        <div className="text-sm text-gray-400">ID: {applicant.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{applicant.role}</div>
                    <div className="text-sm text-gray-400">Engineering</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1.5 text-gray-500" />
                      {applicant.appliedDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={getStatusStyles(applicant.status)}>
                      {applicant.status === 'Interview' && (
                        <span className="w-2 h-2 rounded-full bg-purple-400 mr-2 animate-pulse"></span>
                      )}
                      {applicant.status}
                    </span>
                  </td>
                </tr>
              ))}
              
              {!applicants.length && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="text-gray-400">No applicants found</div>
                    <p className="mt-1 text-sm text-gray-500">New applications will appear here</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-sm text-gray-400">Showing <span className="font-medium">1-{applicants.length}</span> of <span className="font-medium">{applicants.length}</span> applicants</p>
          <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            View all applicants →
          </button>
        </div>
      </section>
    </div>
  );
}
