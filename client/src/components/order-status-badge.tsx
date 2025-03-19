import { Badge } from "@/components/ui/badge";

type OrderStatusBadgeProps = {
  status: string;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let statusClass = "";
  
  switch (status) {
    case "Pending":
      statusClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
      break;
    case "In Progress":
      statusClass = "bg-blue-100 text-blue-800 border-blue-200";
      break;
    case "Completed":
      statusClass = "bg-green-100 text-green-800 border-green-200";
      break;
    case "Cancelled":
      statusClass = "bg-red-100 text-red-800 border-red-200";
      break;
    default:
      statusClass = "bg-gray-100 text-gray-800 border-gray-200";
  }
  
  return (
    <Badge variant="outline" className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
      {status}
    </Badge>
  );
}
