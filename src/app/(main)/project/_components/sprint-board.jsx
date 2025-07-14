"use client";

import React, { useEffect, useState } from "react";
import SprintManager from "./sprint-manager";
import Columns from "./Cloumns";
import IssueCreationDrawer from "./create-issue";
import { getIssues, updateIssueStatus } from "@/actions/Issues";
import useFetch from "@/hooks/use-fetch";
import statusList from "@/data/status.json";
import { BarLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

export default function SprintBoard({ sprints, projectId, orgId }) {
  const [currSprint, setCurrSprint] = useState(
    sprints.find((sprint) => sprint.status === "ACTIVE") || sprints[0]
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [issue, setIssue] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    loading: issuesLoading,
    data: issues,
    fn: getIssuesFn,
  } = useFetch(getIssues);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (currSprint?.id) getIssuesFn(currSprint.id);
  }, [currSprint]);

  useEffect(() => {
    if (issues) setIssue(issues);
  }, [issues]);

  const handleIssueCreated = () => {
    getIssuesFn(currSprint.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const issueId = active.id;
    const newStatus = over.id;

    const currentIssue = issue?.find((i) => i.id === issueId);
    if (!currentIssue || currentIssue.status === newStatus) return;

    setIsUpdating(true);

    // Optimistic UI update
    setIssue((prev) =>
      prev?.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
    );

    try {
      await updateIssueStatus(issueId, newStatus, projectId);
      await getIssuesFn(currSprint.id);
      toast.success(`Issue moved to ${newStatus}`);
    } catch (error) {
      // console.error("Failed to update issue status:", error);
      // Revert update on failure
      setIssue((prev) =>
        prev?.map((i) =>
          i.id === issueId ? { ...i, status: currentIssue.status } : i
        )
      );
      toast.error("Failed to update issue status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      {/* Sprint Selector */}
      <SprintManager
        sprint={currSprint}
        setSprint={setCurrSprint}
        sprints={sprints}
        projectId={projectId}
      />

      {/* Loader */}
      {(issuesLoading || isUpdating) && (
        <>
          <BarLoader color="#36d7b7" width="100%" />
          <h1 className="text-white text-center">
            {isUpdating ? "Updating issue..." : "Fetching issues"}
          </h1>
        </>
      )}

      {/* Board Columns */}
      {issue && (
        <div className="flex gap-8 justify-around">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            {statusList.map((status) => (
              <Columns
                sprint={currSprint}
                key={status.key}
                column={status}
                issues={issue}
                addIssue={() => setIsDrawerOpen(true)}
                handleIssueCreated={handleIssueCreated}
              />
            ))}
          </DndContext>
        </div>
      )}

      {/* Drawer for creating new issues */}
      <IssueCreationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sprintId={currSprint.id}
        status={currSprint.status}
        projectId={projectId}
        onIssueCreated={handleIssueCreated}
        orgId={orgId}
      />
    </div>
  );
}
