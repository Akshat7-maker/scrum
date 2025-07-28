import { inviteUser } from "@/actions/organizations";
import { NextResponse } from "next/server";


export async function POST(request) {
    const emails = await request.json();
    const res = await inviteUser(emails);
    return NextResponse.json(res);
}