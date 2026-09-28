import { notFound } from "next/navigation";
import { creators } from "@/data/mockData";
import { CreatorProfile } from "@/components/creator/CreatorProfile";

export function generateStaticParams() {
  return creators.map((creator) => ({ id: creator.id }));
}

export default async function CreatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creator = creators.find((item) => item.id === id);
  if (!creator) notFound();
  return <CreatorProfile creatorId={creator.id} />;
}
