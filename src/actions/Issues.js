"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getIssues(sprintId){
  const { userId, orgId } = await auth();

  if (!userId || !orgId || !sprintId) {
    throw new Error("Unauthorized");
  }

  // check if user is stored in db
  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  let issues = await db.issue.findMany({
    where: {
      sprintId: sprintId,
    },
    orderBy: [{ status: "asc" }, { order: "asc" }],
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issues;
}

export async function createIssue(projectId, data){
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  let user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    throw new Error("Unauthorized");
  }

  const lastIssue = await db.issue.findFirst({
    where: { projectId, status: data.status },
    orderBy: { order: "desc" },
  });

  const newOrder = lastIssue ? lastIssue.order + 1 : 0;

  const issue = await db.issue.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId: projectId,
      sprintId: data.sprintId,
      reporterId: user.id,
      assigneeId: data.assigneeId || null, // Add this line
      order: newOrder,
    },
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issue;
}

export async function deleteIssue(issueId)  {
  try {
    const deletedIssue = await db.issue.delete({ where: { id: issueId } });
    console.log("deletedIssue", deletedIssue);
    return deletedIssue;
  } catch (error) {
    console.error("Error deleting issue:", error);
    throw error;
  }
}

export async function updateIssue(issueId, data) {
  try {
    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data,
    });
    console.log("updatedIssue", updatedIssue);
    return updatedIssue;
  } catch (error) {
    console.error("Error updating issue:", error);
    throw error;
  }
}

// New function to update issue status and order when dragging
export async function updateIssueStatus(issueId, newStatus, projectId) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Check if user is stored in db
  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the last issue in the new status column to calculate the new order
    const lastIssue = await db.issue.findFirst({
      where: { 
        projectId, 
        status: newStatus 
      },
      orderBy: { order: "desc" },
    });

    const newOrder = lastIssue ? lastIssue.order + 1 : 0;

    // Update the issue with new status and order
    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data: {
        status: newStatus,
        order: newOrder,
      },
      include: {
        assignee: true,
        reporter: true,
      },
    });

    console.log("Issue status updated:", updatedIssue);
    return updatedIssue;
  } catch (error) {
    console.error("Error updating issue status:", error);
    throw new Error("Failed to update issue status");
  }
}

export async function getIssuesReportedByUser(){
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      throw new Error("Unauthorized");
    }

    // check if user is stored in db
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("Unauthorized");
    }

    let issues = await db.issue.findMany({
      where: {
        reporterId: user.id,
        
      },
      orderBy: [{ status: "asc" }, { order: "asc" }],
      include: {
        assignee: true,
        reporter: true,
      },
    });

    console.log("issues", issues);

    return issues;
  } catch (error) {
    console.error("Error getting issues:", error);
    throw error;
  }
}

export async function getIssuesReportedToUser(){
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      throw new Error("Unauthorized");
    }

    // check if user is stored in db
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("Unauthorized");
    }

    let issues = await db.issue.findMany({
      where: {
        assigneeId: user.id,
      },
      orderBy: [{ status: "asc" }, { order: "asc" }],
      include: {
        assignee: true,
        reporter: true,
      },
    });

    return issues;
  } catch (error) {
    console.error("Error getting issues:", error);
    throw error;
  }
}
