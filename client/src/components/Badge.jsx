export default function Badge({ children, color = "gray", className = "" }) {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
  const colors = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return <span className={`${base} ${colors[color] ?? colors.gray} ${className}`}>{children}</span>;
}
