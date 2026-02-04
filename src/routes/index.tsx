import { DashboardPage } from "@/dashboard/page";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/")({
  validateSearch: z.object({
    debug: z.boolean().optional().catch(false),
  }),
  component: DashboardPage,
});
