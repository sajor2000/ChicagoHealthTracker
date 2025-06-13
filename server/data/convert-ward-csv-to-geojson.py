#!/usr/bin/env python3
import csv
import json
import re
from typing import List, Tuple

def parse_multipolygon_wkt(wkt_str: str) -> List[List[List[Tuple[float, float]]]]:
    """Parse WKT MULTIPOLYGON string into coordinate arrays"""
    # Remove MULTIPOLYGON and outer parentheses
    coords_str = wkt_str.replace('MULTIPOLYGON (((', '').replace(')))', '')
    
    # Split by polygon boundaries
    polygons = []
    
    # Extract coordinate pairs
    coord_pattern = r'-?\d+\.\d+ -?\d+\.\d+'
    matches = re.findall(coord_pattern, coords_str)
    
    if matches:
        polygon_coords = []
        for match in matches:
            lng, lat = map(float, match.split())
            polygon_coords.append([lng, lat])
        
        # Close the polygon if not already closed
        if polygon_coords and polygon_coords[0] != polygon_coords[-1]:
            polygon_coords.append(polygon_coords[0])
        
        polygons.append([polygon_coords])
    
    return polygons

def convert_csv_to_geojson():
    """Convert the ward CSV to GeoJSON format"""
    features = []
    
    with open('attached_assets/WARDS_2015_20250613_1749827885132.csv', 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            ward_num = row['WARD']
            geometry_wkt = row['the_geom']
            
            try:
                # Parse the multipolygon coordinates
                coordinates = parse_multipolygon_wkt(geometry_wkt)
                
                feature = {
                    "type": "Feature",
                    "properties": {
                        "ward": ward_num,
                        "ward_name": f"Ward {ward_num}",
                        "shape_area": float(row['SHAPE_Area']),
                        "shape_len": float(row['SHAPE_Leng'])
                    },
                    "geometry": {
                        "type": "MultiPolygon" if len(coordinates) > 1 else "Polygon",
                        "coordinates": coordinates if len(coordinates) > 1 else coordinates[0] if coordinates else []
                    }
                }
                
                features.append(feature)
                
            except Exception as e:
                print(f"Error processing ward {ward_num}: {e}")
                continue
    
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    # Save to file
    with open('server/data/chicago-wards-authentic.json', 'w') as f:
        json.dump(geojson, f, indent=2)
    
    print(f"Converted {len(features)} Chicago alderman wards to GeoJSON")
    return geojson

if __name__ == "__main__":
    convert_csv_to_geojson()