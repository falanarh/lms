import { promises as fs } from 'fs';
import path from 'path';

export async function readDB() {
  const filePath = path.join(process.cwd(), 'data', 'db.json');
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}
export async function writeDB(data: any) {
  const filePath = path.join(process.cwd(), 'data', 'db.json');
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}