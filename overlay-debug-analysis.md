# Map Overlay Debug Analysis

## Core Problem: Overlays Never Display in Production

Based on code analysis, here are the critical issues preventing map overlays from working:

## Issue 1: Mapbox Token Validation Race Condition

**File: `client/src/lib/mapbox-fixed.ts` lines 12-25**
```typescript
// This async token test runs AFTER map initialization
fetch(`https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${mapboxToken}`)
  .then(response => {
    if (response.ok) {
      console.log('Mapbox token validation: SUCCESS');
    } else {
      console.error('Mapbox token validation failed:', response.status);
    }
  })
```

**Problem:** Token validation happens asynchronously but map creation doesn't wait for it.

## Issue 2: Layer Addition Timing Problems

**File: `client/src/lib/mapbox-fixed.ts` lines 78-89**
```typescript
const tryAddLayer = () => {
  attempts++;
  
  if (!map.loaded() || !map.isStyleLoaded()) {
    if (attempts < maxAttempts) {
      setTimeout(tryAddLayer, 100);  // Unreliable polling
      return;
    }
  }
```

**Problem:** Polling with arbitrary timeouts instead of proper event listeners.

## Issue 3: Aggressive Layer Cleanup

**File: `client/src/lib/mapbox-fixed.ts` lines 234-260**
```typescript
function cleanupLayers(map: mapboxgl.Map, layerId: string) {
  // Clean up ALL existing layers from all views
  const allViewTypes = ['census-data', 'community-data', 'wards-data'];
  allViewTypes.forEach(viewType => {
    // Removes ALL layers every time
  });
}
```

**Problem:** Removes all layers every time, causing flicker and potential race conditions.

## Issue 4: Multiple Map Reinitialization

**File: `client/src/components/MapContainer.tsx` lines 142-206**
```typescript
useEffect(() => {
  // This fires on EVERY prop change
  clearAllGeographicLayers();  // Destroys everything
  // Then tries to rebuild
}, [geoData, activeView, selectedDisease, visualizationMode, isLoading, mapStyleLoaded]);
```

**Problem:** Map gets completely rebuilt on every disease/view change.

## Issue 5: Color Scale Misconfiguration

**File: `client/src/lib/mapbox-fixed.ts` lines 158-169**
```typescript
'fill-color': [
  'interpolate',
  ['linear'],
  ['get', propertyKey],
  visualizationMode === 'count' ? min : 30, '#16a34a',    // Hardcoded fallbacks
  visualizationMode === 'count' ? q25 : 128, '#eab308',   
  visualizationMode === 'count' ? q75 : 176, '#f97316',   
  visualizationMode === 'count' ? max * 0.8 : 237, '#dc2626'
],
```

**Problem:** Hardcoded fallback values for rate mode that don't match actual data ranges.

## Solutions to Implement

### 1. Fix Token Validation
```typescript
// Make token validation synchronous before map creation
export function validateMapboxToken(): Promise<boolean> {
  const token = getMapboxToken();
  if (!token) return Promise.resolve(false);
  
  return fetch(`https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${token}`)
    .then(response => response.ok)
    .catch(() => false);
}
```

### 2. Use Proper Event Listeners
```typescript
// Replace polling with proper event handling
export function addDataLayer(map, data, layerId, selectedDisease, visualizationMode) {
  return new Promise((resolve, reject) => {
    if (map.loaded() && map.isStyleLoaded()) {
      addLayersNow();
      resolve();
    } else {
      const onReady = () => {
        map.off('load', onReady);
        map.off('style.load', onReady);
        addLayersNow();
        resolve();
      };
      map.on('load', onReady);
      map.on('style.load', onReady);
    }
  });
}
```

### 3. Implement Smart Layer Management
```typescript
// Only remove layers that need to be replaced
function updateLayers(map, layerId, data) {
  const existingSource = map.getSource(layerId);
  
  if (existingSource) {
    // Update existing source instead of recreating
    existingSource.setData(data);
  } else {
    // Only create if doesn't exist
    map.addSource(layerId, { type: 'geojson', data });
    addLayerStyles(map, layerId);
  }
}
```

### 4. Fix Color Scaling
```typescript
// Use actual data ranges for both count and rate
const values = data.features
  .map(f => f.properties?.[propertyKey])
  .filter(v => typeof v === 'number' && v > 0)
  .sort((a, b) => a - b);

const quartiles = {
  min: values[0],
  q25: values[Math.floor(values.length * 0.25)],
  median: values[Math.floor(values.length * 0.5)],
  q75: values[Math.floor(values.length * 0.75)],
  max: values[values.length - 1]
};
```

## Debug Commands to Test

### Check Current Layer State
```javascript
// Run in browser console
const map = window.__MAP_INSTANCE__;
console.log('Current layers:', map.getStyle().layers.map(l => l.id));
console.log('Current sources:', Object.keys(map.getStyle().sources));
```

### Check Data Loading
```javascript
// Check if data is reaching the map
console.log('Features in census source:', map.querySourceFeatures('census-data').length);
```

### Check Color Values
```javascript
// Check if color expressions are valid
const layer = map.getLayer('census-data-fill');
console.log('Fill color expression:', layer.paint['fill-color']);
```

## Most Critical Fix Needed

The root cause is likely the layer cleanup function that aggressively removes all layers on every change, combined with timing issues in re-adding them. The map shows as "black" because:

1. Layers get removed immediately
2. New layers fail to add due to timing/token issues
3. Only the base Mapbox style remains (dark background)

Fix priority:
1. Remove aggressive layer cleanup
2. Use proper event listeners instead of polling
3. Fix color scale calculations
4. Add proper error handling with fallbacks