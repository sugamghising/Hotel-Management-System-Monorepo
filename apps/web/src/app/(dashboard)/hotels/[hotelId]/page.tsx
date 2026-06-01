import { DashboardClient } from "./_components/DashboardClient";

interface PageProps {
  params: { hotelId: string };
}

export default function HotelDashboardPage({ params }: PageProps) {
  return <DashboardClient hotelId={params.hotelId} />;
}
