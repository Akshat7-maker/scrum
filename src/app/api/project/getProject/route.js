import { getProject } from "@/actions/Project";
import { NextResponse } from "next/server";


export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const project = await getProject(projectId);
    return NextResponse.json(project);
}