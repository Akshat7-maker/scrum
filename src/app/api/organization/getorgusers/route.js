import { getOrganizationUsers } from "@/actions/organizations";
import { NextResponse } from "next/server";


export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const users = await getOrganizationUsers();
    return NextResponse.json(users);
}