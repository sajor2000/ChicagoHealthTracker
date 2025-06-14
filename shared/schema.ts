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

// Main census tract table
export const chicagoCensusTracts2020 = pgTable("chicago_census_tracts_2020", {
  id: serial("id").primaryKey(),
  geoid: text("geoid").notNull().unique(),
  stateFips: text("state_fips").notNull().default("17"),
  countyFips: text("county_fips").notNull().default("031"),
  tractCode: text("tract_code").notNull(),
  tractName: text("tract_name"),
  totalPopulation: integer("total_population"),
  populationDensity: real("population_density"),
  landAreaSqMi: real("land_area_sq_mi"),
  waterAreaSqMi: real("water_area_sq_mi"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  geometry: jsonb("geometry"),
  apiLastUpdated: text("api_last_updated").notNull().default('now()'),
});

// Race distribution - matches Census API variables
export const tractRace2020 = pgTable("tract_race_2020", {
  id: serial("id").primaryKey(),
  geoid: text("geoid").notNull().references(() => chicagoCensusTracts2020.geoid, { onDelete: "cascade" }),
  p1001n: integer("p1_001n"), // Total population
  p1003n: integer("p1_003n"), // White alone
  p1004n: integer("p1_004n"), // Black or African American alone
  p1005n: integer("p1_005n"), // American Indian and Alaska Native alone
  p1006n: integer("p1_006n"), // Asian alone
  p1007n: integer("p1_007n"), // Native Hawaiian and Other Pacific Islander alone
  p1008n: integer("p1_008n"), // Some Other Race alone
  p1009n: integer("p1_009n"), // Two or More Races
});

// Hispanic/Latino ethnicity - Census separates this from race
export const tractEthnicity2020 = pgTable("tract_ethnicity_2020", {
  id: serial("id").primaryKey(),
  geoid: text("geoid").notNull().references(() => chicagoCensusTracts2020.geoid, { onDelete: "cascade" }),
  p2001n: integer("p2_001n"), // Total population
  p2002n: integer("p2_002n"), // Hispanic or Latino
  p2003n: integer("p2_003n"), // Not Hispanic or Latino
});

// Housing characteristics
export const tractHousing2020 = pgTable("tract_housing_2020", {
  id: serial("id").primaryKey(),
  geoid: text("geoid").notNull().references(() => chicagoCensusTracts2020.geoid, { onDelete: "cascade" }),
  h1001n: integer("h1_001n"), // Total housing units
  h1002n: integer("h1_002n"), // Occupied housing units
  h1003n: integer("h1_003n"), // Vacant housing units
});

// Age demographics - key age groups
export const tractAge2020 = pgTable("tract_age_2020", {
  id: serial("id").primaryKey(),
  geoid: text("geoid").notNull().references(() => chicagoCensusTracts2020.geoid, { onDelete: "cascade" }),
  p13001n: integer("p13_001n"), // Total population
  ageUnder5: integer("age_under_5"),
  age5To9: integer("age_5_to_9"),
  age10To14: integer("age_10_to_14"),
  age15To19: integer("age_15_to_19"),
  age20To24: integer("age_20_to_24"),
  age25To34: integer("age_25_to_34"),
  age35To44: integer("age_35_to_44"),
  age45To54: integer("age_45_to_54"),
  age55To64: integer("age_55_to_64"),
  age65To74: integer("age_65_to_74"),
  age75To84: integer("age_75_to_84"),
  age85Plus: integer("age_85_plus"),
  ageUnder18: integer("age_under_18"),
  age18Plus: integer("age_18_plus"),
  age65Plus: integer("age_65_plus"),
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

export const insertChicagoCensusTractsSchema = createInsertSchema(chicagoCensusTracts2020).omit({
  id: true,
});

export const insertTractRaceSchema = createInsertSchema(tractRace2020).omit({
  id: true,
});

export const insertTractEthnicitySchema = createInsertSchema(tractEthnicity2020).omit({
  id: true,
});

export const insertTractHousingSchema = createInsertSchema(tractHousing2020).omit({
  id: true,
});

export const insertTractAgeSchema = createInsertSchema(tractAge2020).omit({
  id: true,
});

export const insertDiseaseDataSchema = createInsertSchema(diseaseData).omit({
  id: true,
});

export type InsertChicagoArea = z.infer<typeof insertChicagoAreaSchema>;
export type InsertChicagoCensusTract = z.infer<typeof insertChicagoCensusTractsSchema>;
export type InsertTractRace = z.infer<typeof insertTractRaceSchema>;
export type InsertTractEthnicity = z.infer<typeof insertTractEthnicitySchema>;
export type InsertTractHousing = z.infer<typeof insertTractHousingSchema>;
export type InsertTractAge = z.infer<typeof insertTractAgeSchema>;
export type InsertDiseaseData = z.infer<typeof insertDiseaseDataSchema>;
export type ChicagoArea = typeof chicagoAreas.$inferSelect;
export type ChicagoCensusTract = typeof chicagoCensusTracts2020.$inferSelect;
export type TractRace = typeof tractRace2020.$inferSelect;
export type TractEthnicity = typeof tractEthnicity2020.$inferSelect;
export type TractHousing = typeof tractHousing2020.$inferSelect;
export type TractAge = typeof tractAge2020.$inferSelect;
export type DiseaseData = typeof diseaseData.$inferSelect;
