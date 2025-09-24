import { GlobalConstraints, TrainsetSnapshot } from "./types";

export const mockFleet: TrainsetSnapshot[] = [
  {
    id: "TS-101",
    km: 120_000,
    fitnessValidUntil: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    openWorkOrders: 0,
    brandingCommittedHoursNext7d: 18,
    cleaningRequired: false,
  },
  {
    id: "TS-205",
    km: 80_500,
    fitnessValidUntil: new Date(Date.now() - 1 * 24 * 3600 * 1000), // expired
    openWorkOrders: 2,
    brandingCommittedHoursNext7d: 4,
    cleaningRequired: true,
  },
  {
    id: "TS-317",
    km: 45_200,
    fitnessValidUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    openWorkOrders: 1,
    brandingCommittedHoursNext7d: 10,
    cleaningRequired: false,
  },
  {
    id: "TS-442",
    km: 160_000, // high mileage
    fitnessValidUntil: new Date(Date.now() + 3 * 24 * 3600 * 1000),
    openWorkOrders: 0,
    brandingCommittedHoursNext7d: 0,
    cleaningRequired: true,
  },
];

export const defaultConstraints: GlobalConstraints = {
  minStandby: 1,
  maxService: 2,
  cleaningBayCapacity: 1,
};
