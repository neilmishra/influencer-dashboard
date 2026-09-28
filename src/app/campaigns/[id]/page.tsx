import { notFound } from "next/navigation";
import { campaigns } from "@/data/mockData";
import { CampaignProfile } from "@/components/campaign/CampaignProfile";

export function generateStaticParams() {
  return campaigns.map((campaign) => ({ id: campaign.id }));
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = campaigns.find((item) => item.id === id);
  if (!campaign) notFound();
  return <CampaignProfile campaignId={campaign.id} />;
}
