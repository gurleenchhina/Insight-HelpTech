
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

export async function getPDFContent(filename: string): Promise<string> {
  const dataBuffer = fs.readFileSync(path.join(process.cwd(), 'attached_assets', filename));
  try {
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error parsing PDF ${filename}:`, error);
    return '';
  }
}

export async function getAllLabelsContent(): Promise<Record<string, string>> {
  const labelContents: Record<string, string> = {};
  const labelFiles = [
    'Drione Label.pdf',
    'konk.pdf',
    'Suspend Polyzone Label.pdf',
    'Temprid SC Label.pdf',
    'Seclira WSG Label.pdf',
    'Maxforce-Quantum-Label-EN.pdf'
  ];

  for (const file of labelFiles) {
    labelContents[file] = await getPDFContent(file);
  }
  return labelContents;
}
