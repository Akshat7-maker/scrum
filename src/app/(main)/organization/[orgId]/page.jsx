"use client";

import React, { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
// import { getOrganization } from "@/actions/organizations";
import OrgSwitcher from "@/components/org-swith";
import useFetch from "@/hooks/use-fetch";
// import { getProjects } from "@/actions/Project";
import Projectlist from "./_components/projectlist";
import { Button } from "@/components/ui/button";
import AddMembers from "./_components/add-members";
// import { getIssuesReportedByUser, getIssuesReportedToUser } from "@/actions/Issues";
import OrgIssueCard from "./_components/org-issue-card";
import axios from "axios";

const Organization = ({ params }) => {
  const [orgId, setOrgId] = useState("");
  const [project, setProjects] = useState([]);
  const [openAddMembers, setAddMembersOpen] = useState(false);
  const [issuesToggle, setIssuesToggle] = useState("to user");

  // Fetch org
  const getOrganization = async (orgId) => {

    const org = await axios.get(`/api/organization/getorg?slug=${orgId}`);

    return org.data;

  };

  // Fetch projects
  const getProjects = async (orgId) => {
    const projects = await axios.get(`/api/project/getprojects?slug=${orgId}`);
    return projects.data;
  };

  // Fetch issues
  const getIssuesReportedByUser = async (orgId) => {
    const issues = await axios.get(`/api/issues/getissuesreportedbyuser?slug=${orgId}`);
    return issues.data;
  };

  const getIssuesReportedToUser = async (orgId) => {
    const issues = await axios.get(`/api/issues/getissuesreportedtouser?slug=${orgId}`);
    return issues.data;
  };

  const { loading, error, data: organization, fn } = useFetch(getOrganization);
  const { loading: loadingProjects, error: errorProjects, data: projects, fn: fnProjects } = useFetch(getProjects);
  const { loading: issuesLoading, error: issuesError, data: issues, fn: getIssuesFn } = useFetch(getIssuesReportedByUser);
  const { loading: issuesToMeLoading, error: issuesToMeError, data: issuesToMe, fn: getIssuesToMeFn } = useFetch(getIssuesReportedToUser);

  

  // Set orgId from params
  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setOrgId(resolvedParams.orgId);
    })();
  }, [params]);

  // Fetch org and projects
  useEffect(() => {
    if (!orgId) return;
    fn(orgId);
    fnProjects(orgId);
  }, [orgId]);

  // Fetch issues based on toggle
  useEffect(() => {
    if (!orgId) return;
    if (issuesToggle === "to user") {
      getIssuesFn(orgId);
    } else {
      getIssuesToMeFn(orgId);
    }
  }, [orgId, issuesToggle]);

  // Save org in sessionStorage
  useEffect(() => {
    if (organization) {
      sessionStorage.setItem("userSelectedOrgId", JSON.stringify(organization));
    }
  }, [organization]);

  // Store project list
  useEffect(() => {
    if (projects) setProjects(projects);
    else setProjects([]);
  }, [projects]);

  const handleIssuesToggle = (toggle) => setIssuesToggle(toggle);
  const ondelete = () => fnProjects(orgId);

  if (loading || loadingProjects) {
    return <BarLoader color="#36d7b7" className="mb-4" width={"100%"} />;
  }

  if (!organization) {
    return (
      <div>
        <h1>Organization not found</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center border-b ">
        <h1 className="md:text-6xl sm:text-5xl text-2xl font-bold gradient-title ml-4">
          {organization.name}&apos;s Projects{" "}
        </h1>

        <div className="flex items-center">
          <OrgSwitcher />
          <Button onClick={() => setAddMembersOpen((prev) => !prev)} className="mr-4 cursor-pointer" variant="outline">
            Add Members
          </Button>
        </div>
      </div>

      {/* Project List */}
      <div>
        {project && project.length === 0 ? (
          <div className="min-h-[250px] flex justify-center items-center">

            <p className="text-white">No projects found</p>
          </div>
        ) : (
          <div className="ml-5">
            <Projectlist projects={project} ondelete={ondelete} />
          </div>
        )}
      </div>

      {/* Issues Section */}
      <div>
        <div className="flex justify-between items-center border-b">

        <h1 className="md:text-4xl sm:text-3xl text-1xl font-bold gradient-title ml-4">My Issues</h1>
        </div>

        <div className="mt-4">
          <div className="relative bg-gray-200 p-1 rounded-full w-fit ml-5 flex gap-1">
            <button
              onClick={() => handleIssuesToggle("to user")}
              className={`px-4 py-1 text-sm font-medium rounded-full transition-all duration-300 ${
                issuesToggle === "to user" ? "bg-blue-600 text-white shadow" : "text-gray-700"
              }`}
            >
              Issues Reported By Me
            </button>
            <button
              onClick={() => handleIssuesToggle("from user")}
              className={`px-4 py-1 text-sm font-medium rounded-full transition-all duration-300 ${
                issuesToggle === "from user" ? "bg-blue-600 text-white shadow" : "text-gray-700"
              }`}
            >
              Issues Reported To Me
            </button>
          </div>

          <div className="min-h-[300px] w-full">
            {(() => {
              const isLoading = issuesToggle === "to user" ? issuesLoading : issuesToMeLoading;
              const list = issuesToggle === "to user" ? issues : issuesToMe;

              if (isLoading) {
                return (
                  <div className="p-4">
                    <BarLoader color="#36d7b7" className="mb-4 " width={"100%"} />
                  </div>
                );
              }

              if (!list || list.length === 0) {
                return (
                  <div className="min-h-[250px] flex justify-center items-center">
                    <p className="text-white">No issues found</p>
                  </div>
                )
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {list.map((issue) => (
                    <OrgIssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Add Members Form */}
      {openAddMembers && <AddMembers setAddMembersOpen={setAddMembersOpen} />}
    </div>
  );
};

export default Organization;
