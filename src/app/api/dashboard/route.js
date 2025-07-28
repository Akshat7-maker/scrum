// app/api/dashboard/overview/route.ts

import { NextResponse } from "next/server";
import { clerkClient, auth } from "@clerk/nextjs/server";
import { db } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth();

  console.log("userId", userId);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized clerkUserId in db" }, { status: 401 });
  }

  // Check if user exists in DB
  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's organizations
    const client = await clerkClient();
    const { data: userOrganizations } = await client.users.getOrganizationMembershipList({
      userId,
    });

    const orgIds = userOrganizations.map(org => org.organization.id);

    const totalProjects = await db.project.count({
      where: {
        organizationId: {
          in: orgIds,
        },
      },
    });

    const activeSprints = await db.sprint.count({
      where: {
        status: "ACTIVE",
        project: {
          organizationId: {
            in: orgIds,
          },
        },
      },
    });

    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);

    const sprintsEndingThisWeek = await db.sprint.count({
      where: {
        status: "ACTIVE",
        endDate: {
          lte: endOfWeek,
          gte: now,
        },
        project: {
          organizationId: {
            in: orgIds,
          },
        },
      },
    });

    const totalTeamMembers = await db.user.count({
      where: {
        OR: [
          {
            createdIssues: {
              some: {
                project: {
                  organizationId: {
                    in: orgIds,
                  },
                },
              },
            },
          },
          {
            assignedIssues: {
              some: {
                project: {
                  organizationId: {
                    in: orgIds,
                  },
                },
              },
            },
          },
        ],
      },
    });

    const completedIssues = await db.issue.count({
      where: {
        status: "DONE",
        sprint: {
          status: "ACTIVE",
          project: {
            organizationId: {
              in: orgIds,
            },
          },
        },
      },
    });

    const totalIssuesInActiveSprints = await db.issue.count({
      where: {
        sprint: {
          status: "ACTIVE",
          project: {
            organizationId: {
              in: orgIds,
            },
          },
        },
      },
    });

    const completionRate = totalIssuesInActiveSprints > 0
      ? Math.round((completedIssues / totalIssuesInActiveSprints) * 100)
      : 0;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const projectsLastMonth = await db.project.count({
      where: {
        organizationId: {
          in: orgIds,
        },
        createdAt: {
          lt: lastMonth,
        },
      },
    });

    const projectsGrowth = totalProjects - projectsLastMonth;

    console.log("totalProjects", totalProjects);
    console.log("projectsGrowth", projectsGrowth);
    console.log("activeSprints", activeSprints);
    console.log("sprintsEndingThisWeek", sprintsEndingThisWeek);
    console.log("totalTeamMembers", totalTeamMembers);
    console.log("completionRate", completionRate);
    console.log("orgCount", orgIds.length);

    return NextResponse.json({
      totalProjects,
      projectsGrowth,
      activeSprints,
      sprintsEndingThisWeek,
      totalTeamMembers,
      completionRate,
      orgCount: orgIds.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch dashboard data: ${error.message}` },
      { status: 500 }
    );
  }
}
