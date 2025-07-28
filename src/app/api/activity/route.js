// app/api/dashboard/recent-activity/route.ts

import { NextRequest, NextResponse } from "next/server";
import { clerkClient , auth} from "@clerk/nextjs/server";
import { db } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized clerkUserId" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized not found in db" }, { status: 401 });
  }

  try {
    const client = await clerkClient();
    const { data: userOrganizations } = await client.users.getOrganizationMembershipList({
      userId,
    });

    const orgIds = userOrganizations.map((org) => org.organization.id);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const completedSprints = await db.sprint.findMany({
      where: {
        status: "COMPLETED",
        updatedAt: { gte: sevenDaysAgo },
        project: {
          organizationId: { in: orgIds },
        },
      },
      include: {
        project: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    const highPriorityIssues = await db.issue.findMany({
      where: {
        priority: { in: ["HIGH", "URGENT"] },
        status: { not: "DONE" },
        project: {
          organizationId: { in: orgIds },
        },
        updatedAt: { gte: sevenDaysAgo },
      },
      include: {
        project: true,
        assignee: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    const milestoneProjects = await db.project.findMany({
      where: {
        organizationId: { in: orgIds },
        issues: {
          some: { status: "DONE" },
        },
      },
      include: {
        issues: {
          where: { status: "DONE" },
        },
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    const activities = [];

    completedSprints.forEach((sprint) => {
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

    highPriorityIssues.forEach((issue) => {
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

    milestoneProjects.forEach((project) => {
      const completionRate =
        project._count.issues > 0
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

    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return NextResponse.json(sortedActivities);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch recent activity: ${error.message}` },
      { status: 500 }
    );
  }
}
