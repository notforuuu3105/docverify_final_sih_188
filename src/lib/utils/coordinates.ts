import { NormalizedCoordinates } from '../types';

export interface PixelBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function normalizedToPixels(
  coords: NormalizedCoordinates,
  containerWidth: number,
  containerHeight: number
): PixelBounds {
  return {
    left: coords.x * containerWidth,
    top: coords.y * containerHeight,
    width: coords.width * containerWidth,
    height: coords.height * containerHeight,
  };
}

export function pixelsToNormalized(
  bounds: PixelBounds,
  containerWidth: number,
  containerHeight: number
): NormalizedCoordinates {
  return {
    x: bounds.left / containerWidth,
    y: bounds.top / containerHeight,
    width: bounds.width / containerWidth,
    height: bounds.height / containerHeight,
  };
}
