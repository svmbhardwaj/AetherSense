import { Suspense } from "react";
import CitizenAlertCard from "@/components/citizen/CitizenAlertCard";

function AlertCardFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <p className="text-[13px] text-muted">Loading alert…</p>
    </div>
  );
}

async function AlertCard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CitizenAlertCard alertId={id} />;
}

export default function CitizenAlertById({
  params,
}: PageProps<"/citizen/alert/[id]">) {
  return (
    <Suspense fallback={<AlertCardFallback />}>
      <AlertCard params={params} />
    </Suspense>
  );
}
