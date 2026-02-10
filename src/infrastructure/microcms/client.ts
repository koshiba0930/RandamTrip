import { Spot } from "@/domain/entities/spot";

type MicroCMSSpot = {
  id: string;
  name: string;
  prefecture: string;
  description: string;
};

type MicroCMSResponse = {
  contents: MicroCMSSpot[];
  totalCount: number;
  offset: number;
  limit: number;
};

export async function fetchSpots(): Promise<Spot[]> {
  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = process.env.MICROCMS_API_KEY;

  if (!serviceDomain || !apiKey) {
    throw new Error("microCMS environment variables are not set");
  }

  const response = await fetch(
    `https://${serviceDomain}.microcms.io/api/v1/spots?limit=100`,
    {
      headers: {
        "X-MICROCMS-API-KEY": apiKey,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error(`microCMS API error: ${response.status}`);
  }

  const data: MicroCMSResponse = await response.json();

  return data.contents.map((item) => ({
    id: item.id,
    name: item.name,
    prefecture: item.prefecture,
    description: item.description,
  }));
}
