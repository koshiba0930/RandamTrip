import { Spot } from "../entities/spot";

export interface SpotRepository {
  getAll(): Spot[];
  getById(id: string): Spot | undefined;
}
