import type { Discipline, CareerArea, MapData } from './types';
import disciplinesData from '../../public/data/disciplines.json';
import careerAreasData from '../../public/data/career-areas.json';
import mapDataJson from '../../public/data/map-data.json';

export async function getDisciplines(): Promise<Discipline[]> {
  return disciplinesData as Discipline[];
}

export async function getCareerAreas(): Promise<CareerArea[]> {
  return careerAreasData as CareerArea[];
}

export async function getMapData(): Promise<MapData> {
  return mapDataJson as unknown as MapData;
}
