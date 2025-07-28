import { getOrganization } from "@/actions/organizations";
import { NextResponse } from "next/server";



export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const organization = await getOrganization(slug);
    return NextResponse.json(organization);
}