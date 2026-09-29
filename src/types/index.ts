export type CampaignStatus = "active" | "completed" | "planned";

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  followers: number;
  engagementRate: number;
  category: string;
}

export interface Campaign {
  id: string;
  name: string;
  brand: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  creatorIds: string[];
}

export interface Database {
  creators: Creator[];
  campaigns: Campaign[];
}

export type NewCreator = Omit<Creator, "id">;
export type NewCampaign = Omit<Campaign, "id">;