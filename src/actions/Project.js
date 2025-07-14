"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { canNotbeNull } from "@/lib/utils";

export async function createProject(data){
  const { userId, orgId } = await auth();

  console.log("userId", userId);
  console.log("orgId", orgId);

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!orgId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  let client = await clerkClient();

  const organization = await client.organizations.getOrganization({
    organizationId: orgId,
  });

  if (!organization) {
    throw new Error("Unauthorized");
  }
  // check if user is member of org
  const { data: org } =
    await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  let userMember = org.find(
    (member) => member.publicUserData?.userId === userId
  );

  if (!userMember || userMember.role !== "org:admin") {
    throw new Error("only admins can create projects");
  }

  try {
    const project = await db.project.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description,
        organizationId: orgId,
      },
    });

    return project;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create project");
  }
}

export async function getProject(projectId) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId || !projectId) {
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

  let client = await clerkClient();

  const organization = await client.organizations.getOrganization({
    organizationId: orgId,
  });

  // check if org exist
  if (!organization) {
    throw new Error("Unauthorized");
  }

  // check if user is member of org
  const { data: org } =
    await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  let userMember = org.find(
    (member) => member.publicUserData?.userId === userId
  );

  if (!userMember) {
    throw new Error("Unauthorized");
  }

  // find project
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      sprints: {
        orderBy: {
          createdAt: "desc",
        },
      }
    }
  });

  // check if project exist

  if (!project) {
    throw new Error("Unauthorized");
  }

  // check if project is part of org

  if (project.organizationId !== orgId) {
    throw new Error("Unauthorized");
  }

  return project;
}

export async function getProjects() {
  const { userId, orgId } = await auth();

  console.log("get projects");

  console.log("userId", userId);
  console.log("orgId", orgId);

  

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!orgId) {
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

  let client = await clerkClient();

  const organization = await client.organizations.getOrganization({
    organizationId: orgId,
  });

  // check if org exist
  if (!organization) {
    throw new Error("Unauthorized");
  }

  // check if user is member of org
  const { data: org } =
    await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  let userMember = org.find(
    (member) => member.publicUserData?.userId === userId
  );

  if (!userMember) {
    throw new Error("Unauthorized");
  }

  // find project
  const projects = await db.project.findMany({
    where: {
      organizationId: orgId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!projects) {
    throw new Error("Unauthorized");
  }

  console.log("projects", projects);

  return projects;
}

export async function deleteProject(projectId) {
  const { userId, orgId } = await auth();

  if(!userId || !orgId || !projectId) {
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

  let client = await clerkClient();

  const organization = await client.organizations.getOrganization({
    organizationId: orgId,
  });

  // check if org exist
  if (!organization) {
    throw new Error("Unauthorized");
  }

  // check if user is member of org
  const { data: org } =
    await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  let userMember = org.find(
    (member) => member.publicUserData?.userId === userId
  );

  if (!userMember || userMember.role !== "org:admin") {
    throw new Error("Unauthorized");
  }

  // find project
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("Unauthorized");
  }

  await db.project.delete({
    where: {
      id: projectId,
    },
  });

  return project;

  
}