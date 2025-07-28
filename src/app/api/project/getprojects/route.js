
import { NextResponse } from "next/server";
import { getProjects } from "@/actions/Project";



export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const project = await getProjects()
    return NextResponse.json(project);
}