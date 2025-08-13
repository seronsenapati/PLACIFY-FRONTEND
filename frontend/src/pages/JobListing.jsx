// src/pages/JobListing.jsx
import { useEffect, useState } from "react";

export default function JobListing() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // TODO: replace with API call to /jobs
    setJobs([
      { id: 1, title: "Frontend Developer", company: "Tech Corp", location: "Remote", type: "Full-time" },
      { id: 2, title: "Backend Engineer", company: "CodeWorks", location: "Bangalore", type: "Part-time" },
      { id: 3, title: "UI/UX Designer", company: "Designify", location: "Delhi", type: "Contract" },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black bg-black flex justify-center items-start py-16 px-4 text-white">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold">Job Listings</h1>
          <p className="mt-2 text-gray-400">Explore available job opportunities and apply today.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-black bg-opacity-70 backdrop-blur-md p-6 rounded-2xl shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-gray-400">{job.company}</p>
              <p className="text-gray-500 text-sm mt-1">{job.location}</p>
              <span className="inline-block mt-3 px-3 py-1 text-sm rounded-full bg-blue-600">
                {job.type}
              </span>
              <button className="mt-4 w-full bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
