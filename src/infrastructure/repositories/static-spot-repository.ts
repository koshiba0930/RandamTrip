import { Spot } from "@/domain/entities/spot";
import { SpotRepository } from "@/domain/repositories/spot-repository";
import { SPOTS } from "@/data/spots";

export class StaticSpotRepository implements SpotRepository {
  getAll(): Spot[] {
    return [...SPOTS];
  }

  getById(id: string): Spot | undefined {
    return SPOTS.find((spot) => spot.id === id);
  }
}
