import { sheltersRepository } from "../repositories/shelters.repository";

export const sheltersService = {
  list: (params?: any) => sheltersRepository.list(params || {}),
  getById: (id: string) => sheltersRepository.getById(id),
  nearest: (lat: number, lon: number, limit?: number) => sheltersRepository.nearest(lat, lon, limit),
  safeOutsideHazard: (hazard: any) => sheltersRepository.safeOutsideHazard(hazard),
  create: (input: any) => sheltersRepository.create(input),
  updateStatus: (id: string, status: string, occupied?: number) => sheltersRepository.updateStatus(id, status, occupied),
};
