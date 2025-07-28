import { NextResponse } from "next/server";
import { createProject } from "@/actions/Project";

export async function POST(req) {
    const data = await req.json();
    const project = await createProject(data);
    return NextResponse.json(project);
}