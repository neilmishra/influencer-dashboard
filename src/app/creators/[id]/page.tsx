import { notFound } from "next/navigation";
import { creators } from "@/data/mockData";
import { CreatorProfile } from "@/components/creator/CreatorProfile";

// Ensure parameters are strict matching strings for Next.js 15/16 static mapping
export async function generateStaticParams() {
  return creators.map((creator) => ({
    id: String(creator.id),
  }));
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CreatorDetailPage({ params }: PageProps) {
  // Properly resolve the Async Promise per Next.js framework spec
  const { id } = await params;
  
  const creator = creators.find((item) => String(item.id) === id);
  
  if (!creator) {
    notFound();
  }

  return <CreatorProfile creatorId={creator.id} />;
}
