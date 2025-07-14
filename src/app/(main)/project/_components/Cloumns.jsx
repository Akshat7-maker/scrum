import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import IssueCard from "./issue-card";
import { useDroppable } from "@dnd-kit/core";
import toast from "react-hot-toast";

function Cloumns({ column, issues, addIssue, handleIssueCreated , sprint}) {

  
  const filteredIssues = issues.filter(
    (issue) => issue.status === column.key
  );

  const handleAddIssue = () => {
    if(sprint.status !== "ACTIVE") {
      toast.error("Sprint is not active");
      return
    }
    addIssue();
  };

  const { setNodeRef, isOver } = useDroppable({
    id: column.key,
  });

  return (
    <div
      className={`flex flex-col w-80 min-h-[600px] border rounded-md border-black transition-colors ${
        isOver ? "bg-gray-100 border-blue-400" : ""
      }`}
    >
      {/* Column title */}
      <h1
        className={`text-white self-center p-2 ${
          isOver ? "text-blue-400" : ""
        }`}
      >
        {column.name}
      </h1>

      {/* Issues in this column */}
      <div
        className={`flex flex-col gap-2 p-2 flex-1 transition-colors ${
          isOver ? "bg-blue-50/20" : ""
        }`}
        ref={setNodeRef}
      >
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              handleIssueCreated={handleIssueCreated}
            />
          ))
        ) : (
          <div
            className={`flex items-center justify-center h-32 text-center transition-colors ${
              isOver ? "text-blue-400" : "text-white"
            }`}
          >
            <h1>
              {isOver
                ? `Drop here to move to ${column.name}`
                : `No issues in "${column.name}"`}
            </h1>
          </div>
        )}
      </div>

      {/* Add issue button (only in TODO column) */}
      {column.key === "TODO" && (
        <Button variant="ghost" className="w-full" onClick={handleAddIssue}>
          <Plus className="mr-2 h-4 w-4" />
          Create Issue
        </Button>
      )}
    </div>
  );
}

export default Cloumns;
