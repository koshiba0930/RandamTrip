import { Spot } from "@/domain/entities/spot";
import { SpotRepository } from "@/domain/repositories/spot-repository";

export class SelectRandomSpotUseCase {
  constructor(private repository: SpotRepository) {}

  execute(): Spot {
    const spots = this.repository.getAll();
    const index = Math.floor(Math.random() * spots.length);
    return spots[index];
  }
}
