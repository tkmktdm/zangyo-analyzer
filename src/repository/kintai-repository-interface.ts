import { Kintai } from '../models/kintai.js';

export default interface KintaiRepositoryInterface {
  save(postOptionsList: Kintai[]): Promise<void>;
  findAll(): Promise<Array<Kintai>>;
  //findSinceDate(date: Date): Kintai | null;
}
