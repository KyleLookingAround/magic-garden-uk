// Constructors for the persisted state shapes, plus the default starter garden.
import { newId } from './util.js';
import { OBJECT_BY_ID } from '../data/objects.js';

export const newBed = (name, x, y, lengthM = 2.4, widthM = 1.2) => ({
  id: newId('bed'), name, x, y, lengthM, widthM, rotation: 0, notes: '', tasks: [],
});
export const newPlanting = (plantId, x, y) => ({ id: newId('plant'), plantId, x, y });
export const newPath = (style = 'gravel', points = []) => ({ id: newId('path'), style, widthM: 0.6, points });
export const newObjectInst = (typeId, x, y) => {
  const tpl = OBJECT_BY_ID[typeId];
  return { id: newId('obj'), typeId, x, y, lengthM: tpl.L, widthM: tpl.W, rotation: 0, label: '' };
};
export const newTask = (text) => ({ id: newId('task'), text, done: false });

export const DEFAULT_STATE = {
  gardenName: 'Our Garden',
  gardenLengthM: 8,
  gardenWidthM: 6,
  beds: [
    newBed('Veg Patch', 0.8, 1.2, 2.4, 1.2),
    newBed('Flower Border', 4.2, 0.8, 3.0, 0.8),
  ],
  objects: [],
  plantings: [],
  paths: [],
  shopping: {},
};
