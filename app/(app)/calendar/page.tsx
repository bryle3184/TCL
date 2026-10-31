import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { CalendarBoard } from "@/components/calendar/calendar-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "Calendars" };

export default function CalendarPage() {
  return (
    <div>
      <PageHeader
        title="Calendars"
        description="Coordinate livestream schedules and employee leave across the department."
      />

      <Tabs defaultValue="live">
        <TabsList>
          <TabsTrigger value="live">Livestream schedule</TabsTrigger>
          <TabsTrigger value="leave">Employee leave</TabsTrigger>
        </TabsList>
        <TabsContent value="live">
          <CalendarBoard type="live" />
        </TabsContent>
        <TabsContent value="leave">
          <CalendarBoard type="leave" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
