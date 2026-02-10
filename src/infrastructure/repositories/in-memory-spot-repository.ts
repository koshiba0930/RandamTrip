import { Spot } from "@/domain/entities/spot";
import { SpotRepository } from "@/domain/repositories/spot-repository";

export class InMemorySpotRepository implements SpotRepository {
  private readonly spots: Spot[];

  constructor(spots: Spot[]) {
    this.spots = spots;
  }

  getAll(): Spot[] {
    return [...this.spots];
  }

  getById(id: string): Spot | undefined {
    return this.spots.find((spot) => spot.id === id);
  }
}
