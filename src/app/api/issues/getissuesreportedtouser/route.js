import { getOrganization } from "@/actions/organizations";
import { NextResponse } from "next/server";
import { getIssuesReportedToUser } from "@/actions/Issues";



export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const issues = await getIssuesReportedToUser(slug);
    return NextResponse.json(issues);
}