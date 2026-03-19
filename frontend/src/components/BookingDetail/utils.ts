export const statusColor = (s: string) => {
  switch (s?.toLowerCase()) {
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "assigned":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "started":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "ended":
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};
