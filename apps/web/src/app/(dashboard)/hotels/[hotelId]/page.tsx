import { DashboardClient } from "./_components/DashboardClient";

interface PageProps {
  params: Promise<{ hotelId: string }>;
}

export default async function HotelDashboardPage({ params }: PageProps) {
  const { hotelId } = await params;
  return <DashboardClient hotelId={hotelId} />;
}
