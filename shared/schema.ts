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

export const insertDiseaseDataSchema = createInsertSchema(diseaseData).omit({
  id: true,
});

export type InsertChicagoArea = z.infer<typeof insertChicagoAreaSchema>;
export type InsertDiseaseData = z.infer<typeof insertDiseaseDataSchema>;
export type ChicagoArea = typeof chicagoAreas.$inferSelect;
export type DiseaseData = typeof diseaseData.$inferSelect;
