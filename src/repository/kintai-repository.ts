import * as fs from 'node:fs/promises';

import KintaiRepositoryInterface from './kintai-repository-interface.js';
import { Kintai } from '../models/kintai.js';

const filePath = 'kintaiData';

async function fileExists(path: string): Promise<boolean> {
  try {
    return (await fs.lstat(path)).isFile();
  } catch (e) {
    return false;
  }
}

export default class KintaiRepository implements KintaiRepositoryInterface {
  public async save(kintais: Kintai[]): Promise<void> {
    try {
      await fs.writeFile(filePath, JSON.stringify(kintais));
    } catch (e) {
      console.error(e);
    }
  }

  public async findAll(): Promise<Kintai[]> {
    // シリアライズしたファイルが存在しなければ空配列を返す
    const exist = await fileExists(filePath);
    if (!exist) {
      return [];
    }

    let parsed;
    try {
      let data = await fs.readFile(filePath, 'utf8');
      parsed = JSON.parse(data);
    } catch (e) {
      console.error(e);
    }

    // Kintaiインスタンスにして配列に格納
    let kintais: Kintai[] = [];
    for (const kintai of parsed) {
      kintais.push(kintai);
    }
    return kintais;
  }

  //public async findSinceDate(date: Date): Kintai {}
}
