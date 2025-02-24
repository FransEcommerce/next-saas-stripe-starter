import { getAvailableServices } from "@/app/services/registry";
import { NextResponse } from "next/server";

export async function GET() {
  const services = await getAvailableServices();
  return NextResponse.json({ services });
}
