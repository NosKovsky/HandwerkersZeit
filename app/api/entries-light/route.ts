import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json([]);
    }

    const { data: entries, error } = await supabase
      .from("entries")
      .select("id, activity, entry_date")
      .eq("project_id", projectId)
      .order("entry_date", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching entries:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(entries || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
