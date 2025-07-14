"use client";

import React, { useEffect, use } from "react";
import { getProject } from "@/actions/Project";
import { notFound } from "next/navigation";
import CreateSprint from "../_components/create-sprint";
import SprintBoard from "../_components/sprint-board";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";

const ProjectPage = ({ params }) => {
  const { projectId } = use(params);

  // console.log("project id", projectId);

  const {
    loading: projectLoading,
    error,
    data: project,
    fn: getProjectFn,
  } = useFetch(getProject);

  useEffect(() => {
    getProjectFn(projectId);
  }, [projectId]);

  // console.log("project", project);

  if (projectLoading) return <BarLoader color="#36d7b7" width="100%" />;
  if (error) return <h1>{error.message}</h1>;
  if (!project) return null;

  return (
    <div className="container mx-auto">
      {/* sprint creation */}
      <CreateSprint
        projectTitle={project.name}
        projectId={projectId}
        projectKey={project.key}
        sprintKey={project.sprints?.length + 1}
        onSprintCreated={() => getProjectFn(projectId)}
      />

      {/* sprint board */}
      {project?.sprints?.length === 0 ? (
        <h1 className="text-2xl font-bold">No sprints found</h1>
      ) : (
        <SprintBoard
          sprints={project.sprints}
          projectId={projectId}
          orgId={project.organizationId}
        />
      )}
    </div>
  );
};

export default ProjectPage;
