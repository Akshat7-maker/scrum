import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import IssueDetailsDialog from "./issue-dialog";
import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

const priorityColor = {
  LOW: "border-green-600",
  MEDIUM: "border-yellow-300",
  HIGH: "border-orange-400",
  URGENT: "border-red-400",
};

function IssueCard({ issue, showStatus = true, handleIssueCreated }) {
  const created = formatDistanceToNow(new Date(issue.createdAt), {
    addSuffix: true,
  });

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: issue.id,
    });

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <>
      <div
        style={{
          transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
          opacity: isDragging ? 0.5 : 1,
        }}
        ref={setNodeRef}
      >
        <Card
          className={`cursor-pointer hover:shadow-md transition-shadow ${
            isDragging ? "shadow-lg" : ""
          }`}
          onClick={() => setIsDialogOpen(true)}
        >
          <CardHeader
            className={`border-t-2 ${
              priorityColor[issue.priority]
            } rounded-lg relative`}
          >
            <CardTitle className="pr-8">{issue.title}</CardTitle>

            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              className="absolute top-2 right-2 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors"
              onClick={(e) => e.stopPropagation()} // prevent opening dialog
              title="Drag to move issue"
            >
              <GripVertical size={16} className="text-gray-500" />
            </div>
          </CardHeader>

          <CardContent className="flex gap-2 -mt-3">
            {showStatus && <Badge>{issue.status}</Badge>}
            <Badge variant="outline" className="-ml-1">
              {issue.priority}
            </Badge>
          </CardContent>

          <CardFooter className="flex flex-col items-start space-y-3">
            <UserAvatar user={issue.assignee} />
            <div className="text-xs text-gray-400 w-full">
              Created {created}
            </div>
          </CardFooter>
        </Card>

        {isDialogOpen && (
          <IssueDetailsDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            issue={issue}
            onUpdate={handleIssueCreated}
          />
        )}
      </div>
    </>
  );
}

export default IssueCard;
