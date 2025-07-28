import { createSprint} from "@/actions/Sprints";
import { NextResponse } from "next/server";

export async function POST(req) {
    const dataa = await req.json();
    const {projectId, data} = dataa;
    const sprint = await createSprint(projectId, data);
    return NextResponse.json(sprint);
}