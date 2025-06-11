import { chicagoAreas, diseaseData, type ChicagoArea, type DiseaseData, type InsertChicagoArea, type InsertDiseaseData } from "@shared/schema";

export interface IStorage {
  getChicagoArea(id: number): Promise<ChicagoArea | undefined>;
  getChicagoAreaByGeoid(geoid: string): Promise<ChicagoArea | undefined>;
  createChicagoArea(area: InsertChicagoArea): Promise<ChicagoArea>;
  getDiseaseData(areaId: number, diseaseType: string): Promise<DiseaseData | undefined>;
  createDiseaseData(data: InsertDiseaseData): Promise<DiseaseData>;
}

export class MemStorage implements IStorage {
  private areas: Map<number, ChicagoArea>;
  private diseaseDataMap: Map<string, DiseaseData>;
  currentId: number;

  constructor() {
    this.areas = new Map();
    this.diseaseDataMap = new Map();
    this.currentId = 1;
  }

  async getChicagoArea(id: number): Promise<ChicagoArea | undefined> {
    return this.areas.get(id);
  }

  async getChicagoAreaByGeoid(geoid: string): Promise<ChicagoArea | undefined> {
    return Array.from(this.areas.values()).find(
      (area) => area.geoid === geoid,
    );
  }

  async createChicagoArea(insertArea: InsertChicagoArea): Promise<ChicagoArea> {
    const id = this.currentId++;
    const area: ChicagoArea = { ...insertArea, id };
    this.areas.set(id, area);
    return area;
  }

  async getDiseaseData(areaId: number, diseaseType: string): Promise<DiseaseData | undefined> {
    const key = `${areaId}-${diseaseType}`;
    return this.diseaseDataMap.get(key);
  }

  async createDiseaseData(insertData: InsertDiseaseData): Promise<DiseaseData> {
    const id = this.currentId++;
    const data: DiseaseData = { ...insertData, id };
    const key = `${data.areaId}-${data.diseaseType}`;
    this.diseaseDataMap.set(key, data);
    return data;
  }
}

export const storage = new MemStorage();
