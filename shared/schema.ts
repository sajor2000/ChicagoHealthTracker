import { pgTable, text, serial, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const chicagoAreas = pgTable("chicago_areas", {
  id: serial("id").primaryKey(),
  geoid: text("geoid").notNull().unique(),
  name: text("name").notNull(),
  areaType: text("area_type").notNull(), // 'census' or 'community'
  population: integer("population").notNull(),
  density: real("density").notNull(),
  geometry: jsonb("geometry").notNull(),
});

export const censusTractData = pgTable("census_tract_data", {
  id: serial("id").primaryKey(),
  geoid: text("geoid").notNull().unique(),
  tractNumber: text("tract_number").notNull(),
  name: text("name").notNull(),
  
  // Population metrics
  totalPopulation: integer("total_population").notNull(),
  adults18Plus: integer("adults_18_plus").notNull(),
  
  // Race demographics (absolute counts)
  raceWhite: integer("race_white").notNull(),
  raceBlack: integer("race_black").notNull(),
  raceAmericanIndian: integer("race_american_indian").notNull(),
  raceAsian: integer("race_asian").notNull(),
  racePacificIslander: integer("race_pacific_islander").notNull(),
  raceOther: integer("race_other").notNull(),
  raceTwoOrMore: integer("race_two_or_more").notNull(),
  
  // Ethnicity demographics
  ethnicityTotal: integer("ethnicity_total").notNull(),
  ethnicityHispanic: integer("ethnicity_hispanic").notNull(),
  ethnicityNonHispanic: integer("ethnicity_non_hispanic").notNull(),
  
  // Housing characteristics
  housingTotalUnits: integer("housing_total_units").notNull(),
  housingOccupied: integer("housing_occupied").notNull(),
  housingVacant: integer("housing_vacant").notNull(),
  
  // Age demographics (basic categories)
  ageUnder18: integer("age_under_18").notNull(),
  age18To64: integer("age_18_to_64").notNull(),
  age65Plus: integer("age_65_plus").notNull(),
  
  // Geographic and calculated fields
  geometry: jsonb("geometry").notNull(),
  areaSqMiles: real("area_sq_miles").notNull(),
  densityPerSqMile: real("density_per_sq_mile").notNull(),
  
  // Data quality and source tracking
  dataSource: text("data_source").notNull().default("2020_census_api"),
  lastUpdated: text("last_updated").notNull(),
});

export const diseaseData = pgTable("disease_data", {
  id: serial("id").primaryKey(),
  areaId: integer("area_id").references(() => chicagoAreas.id).notNull(),
  diseaseType: text("disease_type").notNull(), // 'diabetes', 'hypertension', etc.
  patientCount: integer("patient_count").notNull(),
  rate: real("rate").notNull(), // per 1,000 residents
  isSuppressed: integer("is_suppressed").notNull().default(0), // 0 or 1
  dataQuality: real("data_quality").notNull().default(100), // percentage
});

export const insertChicagoAreaSchema = createInsertSchema(chicagoAreas).omit({
  id: true,
});

export const insertCensusTractDataSchema = createInsertSchema(censusTractData).omit({
  id: true,
});

export const insertDiseaseDataSchema = createInsertSchema(diseaseData).omit({
  id: true,
});

export type InsertChicagoArea = z.infer<typeof insertChicagoAreaSchema>;
export type InsertCensusTractData = z.infer<typeof insertCensusTractDataSchema>;
export type InsertDiseaseData = z.infer<typeof insertDiseaseDataSchema>;
export type ChicagoArea = typeof chicagoAreas.$inferSelect;
export type CensusTractData = typeof censusTractData.$inferSelect;
export type DiseaseData = typeof diseaseData.$inferSelect;
