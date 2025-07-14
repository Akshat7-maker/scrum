"use client";

import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeSprintStatus } from "@/actions/Sprints";
import useFetch from "@/hooks/use-fetch";
import { isBefore, isAfter, format, isEqual } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function SprintManager({ sprints, projectId, setSprint, sprint }) {
  console.log("sprints", sprints);

  const router = useRouter();

  const {
    loading: changeSprintStatusLoading,
    error: sprintError,
    data: updatedSprint,
    fn: updatedSprintFn,
  } = useFetch(changeSprintStatus);

  const today = new Date();
  const sprintStart = new Date(sprint.startDate);
  const sprintEnd = new Date(sprint.endDate);

  const canStart =
    (isBefore(today, sprintEnd) ||
    (isEqual(today, sprintStart) || isAfter(today, sprintStart)) )&&
    sprint.status === "PLANNED";

  const canEnd = sprint.status === "ACTIVE";

  const handleSprintChange = (value) => {
    const selectedSprint = sprints.find((s) => s.id === value);
    if (selectedSprint) {
      setSprint(selectedSprint);
    }
  };

  const handleSprintStatusChange = async (sprintId, status) => {
    try {
      const result = await updatedSprintFn(sprintId, projectId, status);
      if (result) {
        toast.success("Sprint status updated successfully");
        router.refresh();
        setSprint((prevSprint) => ({
          ...prevSprint,
          status: result.status,
        }));
      }
    } catch (err) {
      toast.error("Failed to update sprint status");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold ml-4 mt-4">Sprint Manager {sprint.name}</h1>

      <div className="flex justify-between p-4">
        <Select onValueChange={handleSprintChange} defaultValue={sprint.id}>
          <SelectTrigger className="w-[90%] cursor-pointer">
            <SelectValue placeholder="Select a Sprint" />
          </SelectTrigger>
          <SelectContent>
            {sprints?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {canStart && (
          <Button
            onClick={() => handleSprintStatusChange(sprint.id, "ACTIVE")}
            disabled={changeSprintStatusLoading}
            className="cursor-pointer"
          >
            Start Sprint
          </Button>
        )}

        {canEnd && (
          <Button
            variant="destructive"
            onClick={() => handleSprintStatusChange(sprint.id, "COMPLETED")}
            disabled={changeSprintStatusLoading}
            className="cursor-pointer"
          >
            End Sprint
          </Button>
        )}
      </div>
    </div>
  );
}

export default SprintManager;
