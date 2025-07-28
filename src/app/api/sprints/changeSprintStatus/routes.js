import { changeSprintStatus } from "@/actions/Sprints";
import { NextResponse } from "next/server";

export async function POST(req) {
    const data = await req.json();
    const {sprintId, projectId, status} = data;
    const sprint = await changeSprintStatus(sprintId, projectId, status);
    return NextResponse.json(sprint);
}