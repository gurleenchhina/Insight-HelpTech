
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

export async function getPDFContent(filename: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'attached_assets', filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`PDF file not found: ${filename}`);
    return '';
  }
  
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error parsing PDF ${filename}:`, error);
    return '';
  }
}

export async function getAllLabelsContent(): Promise<Record<string, string>> {
  const labelContents: Record<string, string> = {};
  try {
    const assetsDir = path.join(process.cwd(), 'attached_assets');
    if (!fs.existsSync(assetsDir)) {
      console.warn('Assets directory not found');
      return labelContents;
    }

    const files = fs.readdirSync(assetsDir);
    const labelFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

    for (const file of labelFiles) {
      labelContents[file] = await getPDFContent(file);
    }
  } catch (error) {
    console.error('Error getting labels content:', error);
  }
  return labelContents;
}
