// At the top of your server action file
"use server";




import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function createSprint(projectId, data){
  const { userId, orgId } = await auth();
  

  if (!userId || !orgId || !projectId) {
    throw new Error("Unauthorized");
  }

  // console.log("create sprint");

  // console.log(projectId);
  // console.log(data);

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

  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("Unauthorized");
  }

  const sprint = await db.sprint.create({
    data: {
      name: data.name,
      startDate: data.dateRange.from,
      endDate: data.dateRange.to,
      status: "PLANNED",
      projectId: projectId,
    },
  });

  return sprint;
}

export async function changeSprintStatus(sprintId, projectId, status){

  try {
  // console.log("change sprint status");

  // console.log("sprintId", sprintId);
  // console.log("projectId", projectId);
  // console.log("status", status);

  const { userId, orgId } = await auth();

  

    if (!userId || !orgId || !projectId || !sprintId) {
      //  console.error("Unauthorized: Missing IDs", { userId, orgId, projectId, sprintId });
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
  
    const project = await db.project.findUnique({
      where: {
        id: projectId,
      },
    });
  
    if (!project) {
      throw new Error("Unauthorized");
    }
  
    // check if sprint in part of project 
    // const sprintExists = project.sprints.find((sprint) => sprint.id === sprintId);
  
    // if (!sprintExists) {
    //   throw new Error("Unauthorized");
    // }
  
    const sprint = await db.sprint.update({
      where: {
        id: sprintId,
      },
      data: {
        status: status,
      },
    });
  
    return sprint;
  } catch (error) {

    throw new Error(error.message);
    
  }

}
