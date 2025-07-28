// At the top of your server action file
export const runtime = 'nodejs';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';


"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

// Dashboard Overview Data
export async function getDashboardOverview(){
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized clerkUserId in db");
  }

  // Check if user exists in db
  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get user's organizations
    const client = await clerkClient();
    const { data: userOrganizations } = await client.users.getOrganizationMembershipList({
      userId,
    });

    const orgIds = userOrganizations.map(org => org.organization.id);

    // Get total projects across all user's organizations
    const totalProjects = await db.project.count({
      where: {
        organizationId: {
          in: orgIds,
        },
      },
    });

    // Get active sprints (sprints that are currently active)
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

    // Get sprints ending this week
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

    // Get total team members across all organizations
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

    // Calculate completion rate (completed issues vs total issues in active sprints)
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

    // Get projects count from last month for comparison
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

    return {
      totalProjects,
      projectsGrowth,
      activeSprints,
      sprintsEndingThisWeek,
      totalTeamMembers,
      completionRate,
      orgCount: orgIds.length,
    };
  } catch (error) {
    // console.error("Error fetching dashboard overview:", error);
    // throw new Error("Failed to fetch dashboard data");
     throw new Error(`Failed to fetch recent activity: ${error.message}`);
  }
}

// Recent Activity Feed
export async function getRecentActivity() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized clerkUserId");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("Unauthorized not found in db");
  }

  try {
    // Get user's organizations
    const client = await clerkClient();
    const { data: userOrganizations } = await client.users.getOrganizationMembershipList({
      userId,
    });

    const orgIds = userOrganizations.map(org => org.organization.id);

    // Get recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get completed sprints
    const completedSprints = await db.sprint.findMany({
      where: {
        status: "COMPLETED",
        updatedAt: {
          gte: sevenDaysAgo,
        },
        project: {
          organizationId: {
            in: orgIds,
          },
        },
      },
      include: {
        project: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    });

    // Get high priority issues
    const highPriorityIssues = await db.issue.findMany({
      where: {
        priority: {
          in: ["HIGH", "URGENT"],
        },
        status: {
          not: "DONE",
        },
        project: {
          organizationId: {
            in: orgIds,
          },
        },
        updatedAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        project: true,
        assignee: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    });

    // Get milestone achievements (projects with high completion rates)
    const milestoneProjects = await db.project.findMany({
      where: {
        organizationId: {
          in: orgIds,
        },
        issues: {
          some: {
            status: "DONE",
          },
        },
      },
      include: {
        issues: {
          where: {
            status: "DONE",
          },
        },
        _count: {
          select: {
            issues: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    });

    // Format activities
    const activities= [];

    // Add completed sprints
    completedSprints.forEach(sprint => {
      activities.push({
        id: `sprint-${sprint.id}`,
        type: "sprint_completed",
        title: `Sprint "${sprint.name}" completed`,
        description: `Project: ${sprint.project.name}`,
        timestamp: sprint.updatedAt,
        icon: "CheckCircle",
        color: "green",
        badge: "Completed",
      });
    });

    // Add high priority issues
    highPriorityIssues.forEach(issue => {
      activities.push({
        id: `issue-${issue.id}`,
        type: "high_priority_issue",
        title: `Issue requires attention`,
        description: `${issue.title} • Project: ${issue.project.name}`,
        timestamp: issue.updatedAt,
        icon: "AlertCircle",
        color: "orange",
        badge: "High Priority",
        assignee: issue.assignee?.name,
      });
    });

    // Add milestone achievements
    milestoneProjects.forEach(project => {
      const completionRate = project._count.issues > 0 
        ? Math.round((project.issues.length / project._count.issues) * 100)
        : 0;

      if (completionRate >= 75) {
        activities.push({
          id: `milestone-${project.id}`,
          type: "milestone_reached",
          title: `Project milestone reached`,
          description: `${completionRate}% of features completed • ${project.name}`,
          timestamp: project.updatedAt,
          icon: "Star",
          color: "purple",
          badge: "Milestone",
        });
      }
    });

    // Sort by timestamp and return top 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

  } catch (error) {
    // console.error("Error fetching recent activity:", error);
    // throw new Error("Failed to fetch recent activity");
    throw new Error(error.message);
  }
}

// User's Organizations Summary
export async function getUserOrganizations(){
  const { userId } = await auth();

  if (!userId) {
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

  try {
    const client = await clerkClient();
    const { data: userOrganizations } = await client.users.getOrganizationMembershipList({
      userId,
    });

    const orgIds = userOrganizations.map(org => org.organization.id);

    // Get projects for each organization
    const organizationsWithProjects = await Promise.all(
      userOrganizations.map(async (org) => {
        const projects = await db.project.findMany({
          where: {
            organizationId: org.organization.id,
          },
          include: {
            _count: {
              select: {
                issues: true,
                sprints: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 3, // Get top 3 most recent projects
        });

        return {
          id: org.organization.id,
          name: org.organization.name,
          slug: org.organization.slug,
          role: org.role,
          projects,
          projectCount: projects.length,
        };
      })
    );

    return organizationsWithProjects;
  } catch (error) {
    // console.error("Error fetching user organizations:", error);
    throw new Error("Failed to fetch organizations");
  }
}

// Quick Stats for Dashboard Cards
export async function getQuickStats(){
  const { userId } = await auth();

  if (!userId) {
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

  try {
    const client = await clerkClient();
    const { data: userOrganizations } = await client.users.getOrganizationMembershipList({
      userId,
    });

    const orgIds = userOrganizations.map(org => org.organization.id);

    // Get user's assigned issues
    const assignedIssues = await db.issue.count({
      where: {
        assigneeId: user.id,
        status: {
          not: "DONE",
        },
      },
    });

    // Get user's reported issues
    const reportedIssues = await db.issue.count({
      where: {
        reporterId: user.id,
      },
    });

    // Get user's completed issues this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const completedThisWeek = await db.issue.count({
      where: {
        assigneeId: user.id,
        status: "DONE",
        updatedAt: {
          gte: startOfWeek,
        },
      },
    });

    // Get user's active projects
    const activeProjects = await db.project.count({
      where: {
        organizationId: {
          in: orgIds,
        },
        issues: {
          some: {
            OR: [
              { assigneeId: user.id },
              { reporterId: user.id },
            ],
          },
        },
      },
    });

    return {
      assignedIssues,
      reportedIssues,
      completedThisWeek,
      activeProjects,
    };
  } catch (error) {
    // console.error("Error fetching quick stats:", error);
    throw new Error("Failed to fetch quick stats");
  }
}

// Get user's recent projects
export async function getRecentProjects(){
  const { userId } = await auth();

  if (!userId) {
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

  try {
    const client = await clerkClient();
    const { data: userOrganizations } = await client.users.getOrganizationMembershipList({
      userId,
    });

    const orgIds = userOrganizations.map(org => org.organization.id);

    const recentProjects = await db.project.findMany({
      where: {
        organizationId: {
          in: orgIds,
        },
        OR: [
          {
            issues: {
              some: {
                assigneeId: user.id,
              },
            },
          },
          {
            issues: {
              some: {
                reporterId: user.id,
              },
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            issues: true,
            sprints: true,
          },
        },
        sprints: {
          where: {
            status: "ACTIVE",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    });

    return recentProjects;
  } catch (error) {
    // console.error("Error fetching recent projects:", error);
    throw new Error("Failed to fetch recent projects");
  }
} 