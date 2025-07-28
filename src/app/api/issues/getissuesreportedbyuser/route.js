import { getOrganization } from "@/actions/organizations";
import { NextResponse } from "next/server";
import { getIssuesReportedByUser } from "@/actions/Issues";



export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const issues = await getIssuesReportedByUser()
    return NextResponse.json(issues);
}