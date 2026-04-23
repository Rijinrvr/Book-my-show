import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

export function readJSON<T>(filename: string): T[] {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf-8');
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T[];
}

export function writeJSON<T>(filename: string, data: T[]): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function findById<T extends { id: string }>(filename: string, id: string): T | undefined {
  const data = readJSON<T>(filename);
  return data.find((item) => item.id === id);
}

export function insertOne<T extends { id: string }>(filename: string, item: T): T {
  const data = readJSON<T>(filename);
  data.push(item);
  writeJSON(filename, data);
  return item;
}

export function updateOne<T extends { id: string }>(filename: string, id: string, updates: Partial<T>): T | null {
  const data = readJSON<T>(filename);
  const index = data.findIndex((item) => item.id === id);
  if (index === -1) return null;
  data[index] = { ...data[index], ...updates };
  writeJSON(filename, data);
  return data[index];
}

export function deleteOne<T extends { id: string }>(filename: string, id: string): boolean {
  const data = readJSON<T>(filename);
  const filtered = data.filter((item) => item.id !== id);
  if (filtered.length === data.length) return false;
  writeJSON(filename, filtered);
  return true;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
