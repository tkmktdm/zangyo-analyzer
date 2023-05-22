import KintaiRepository from '../repository/kintai-repository.js';

export class KintaiRepositoryFactory {
  private static _instance: KintaiRepository;
  public static getInstance(): KintaiRepository {
    if (!this._instance) {
      this._instance = new KintaiRepository();
    }
    return this._instance;
  }
}
