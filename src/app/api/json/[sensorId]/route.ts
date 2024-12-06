import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

type SensorStatus = {
  [sensorId: string]: string[];
};

type GraphData = {
  timestamp: string;
  snowDepth: number;
  temperature: number;
};

export async function GET(req: Request, { params }: { params: { sensorId: string } }) {
  const { sensorId } = params;
  const filePath = path.join(process.cwd(), 'sensorData.json');

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const allData: SensorStatus = JSON.parse(fileContents);

    const sensorStatuses = allData[sensorId];

    if (!sensorStatuses || sensorStatuses.length === 0) {
      return NextResponse.json({ error: 'No data found for Sensor ID: ' + sensorId }, { status: 404 });
    }

    const graphData: GraphData[] = sensorStatuses.map((status) => {
      const [timestamp, ...data] = status.split(';');
      const snowDepth = parseFloat(data[0]) || 0;
      const temperature = parseFloat(data[5]) || 0;
      return { timestamp, snowDepth, temperature };
    });

    return NextResponse.json(graphData);
  } catch (error) {
    return NextResponse.json({ error: 'Error loading sensor data' }, { status: 500 });
  }
}
