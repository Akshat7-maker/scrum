// At the top of your server action file

"use server";




import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function getOrganization(slug) {
  const { userId, orgId } = await auth();

  // console.log("userId", userId);
  // console.log("orgId", orgId);

  // console.log("slug", slug);

  if (!slug) {
    throw new Error("Slug is required");
  }

  // if no user id
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // if user exist in db
  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("Unauthorized not found in db");
  }

  const client = await clerkClient();

  const organization = await client.organizations.getOrganization({
    slug,
  });

  // console.log("organization", organization.id);

  if (!organization) {
    throw new Error("Organization not found");
  }

  // is user a member of the organization
  const { data: members } = await client.organizations.getOrganizationMembershipList({
    organizationId: organization.id,
  });

  // console.log("data", members);

  if (!members.find((m) => m.publicUserData?.userId === userId)) {
    throw new Error("Unauthorized");
  }

  let orgObj = {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
  };

  return orgObj;
}


export async function getOrganizationUsers(){

  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  let client = await clerkClient();

  const { data: members } = await client.organizations.getOrganizationMembershipList({
    organizationId: orgId,
  });

  let usersArr = members.map((m) => m.publicUserData?.userId).filter((id) => Boolean(id));

  const users = await db.user.findMany({
    where: {
      clerkUserId: {
        in: usersArr,
      },
    },
  });

  // console.log("users", users);

  return users;


  
}

export async function inviteUser(emails) {

  try {
    const { userId, orgId } = await auth();
  
    let client = await clerkClient();
  
    const params = emails.map((email) => ({
      email_address: email,
       role: 'org:member',
       redirect_url: process.env.DOMAIN,
    }));
  
    const data = await fetch(`https://api.clerk.com/v1/organizations/${orgId}/invitations/bulk`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
      body: JSON.stringify(params),
    })
  
    const res = await data.json();
  
    // console.log("res", res);
  
    return res;
  } catch (error) {
    // console.error("Error inviting members:", error);
    throw new Error("Error inviting members");
    
  }


  
}