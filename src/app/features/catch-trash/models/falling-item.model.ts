export type ItemKind =
  | 'bottle'
  | 'can'
  | 'box'
  | 'banana'
  | 'cup'
  | 'paper'
  | 'glass'
  | 'tin'
  | 'wrapper'
  | 'bag'
  | 'carton'
  | 'newspaper'
  | 'magazine'
  | 'carrierBag'
  | 'brokenGlass'
  | 'yogurt'
  | 'appleCore'
  | 'pizzaBox'
  | 'foodBox'
  | 'foilTray'
  | 'detergent'
  | 'candyWrapper'
  | 'battery'
  | 'batterySmall';
export interface FallingItem {
  id: number;
  kind: ItemKind;
  x: number;
  y: number;
  speed: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  dangerous: boolean;
  bounced: boolean;
}
