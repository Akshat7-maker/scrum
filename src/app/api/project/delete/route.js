import { deleteProject } from "@/actions/Project";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const project = await deleteProject(projectId);
    return NextResponse.json(project);
}