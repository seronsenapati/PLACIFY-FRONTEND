// Utility functions for formatting data

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getStatusStyles = (status) => {
  const baseStyles = "px-3 py-1.5 rounded-full text-xs font-medium flex items-center";

  switch (status) {
    case "reviewed":
      return `${baseStyles} bg-blue-500/20 text-blue-300 border border-blue-500/30`;
    case "rejected":
      return `${baseStyles} bg-red-500/20 text-red-300 border border-red-500/30`;
    case "pending":
      return `${baseStyles} bg-yellow-500/20 text-yellow-300 border border-yellow-500/30`;
    case "withdrawn":
      return `${baseStyles} bg-gray-500/20 text-gray-300 border border-gray-500/30`;
    case "active":
      return `${baseStyles} bg-green-500/20 text-green-300 border border-green-500/30`;
    case "expired":
      return `${baseStyles} bg-red-500/20 text-red-300 border border-red-500/30`;
    default:
      return `${baseStyles} bg-gray-500/20 text-gray-300 border border-gray-500/30`;
  }
};