import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import React from "react";

const statusColor = {
  TODO: "bg-gray-300 text-gray-800",
  IN_PROGRESS: "bg-blue-200 text-blue-800",
  IN_REVIEW: "bg-yellow-200 text-yellow-800",
  DONE: "bg-green-200 text-green-800",
};

const priorityColor = {
  LOW: "border-green-600 text-green-700",
  MEDIUM: "border-yellow-400 text-yellow-700",
  HIGH: "border-orange-400 text-orange-700",
  URGENT: "border-red-400 text-red-700",
};

function OrgIssueCard({ issue }) {
  const created = formatDistanceToNow(new Date(issue.createdAt), {
    addSuffix: true,
  });

  const statusKey = issue.status;
  const priorityKey = issue.priority;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold truncate">
          {issue.title}
        </CardTitle>
        <CardDescription className="truncate text-xs text-gray-500">
          {issue.project?.name ? `Project: ${issue.project.name}` : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 items-center pb-2">
        <Badge className={statusColor[statusKey] || ""}>{issue.status}</Badge>
        <Badge variant="outline" className={priorityColor[priorityKey] || ""}>
          {issue.priority}
        </Badge>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 items-start">
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-gray-400">Assignee:</span>
          <UserAvatar user={issue.assignee} />
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-gray-400">Reporter:</span>
          <UserAvatar user={issue.reporter} />
        </div>
        <div className="text-xs text-gray-400 w-full pt-1">
          Created {created}
        </div>
      </CardFooter>
    </Card>
  );
}

export default OrgIssueCard;
