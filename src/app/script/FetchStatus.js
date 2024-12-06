import axios from 'axios';
import fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const API_KEY = process.env.SUPABASE_API_KEY;

const fetchData = async () => {
    try {
        console.log("Fetching all sensor statuses from Supabase...");  // Log the action

        const response = await axios.get(`${SUPABASE_URL}/rest/v1/sensors`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'apikey': API_KEY,
                'Prefer': 'return=representation',
            },
        });

        console.log(`Response data: ${JSON.stringify(response.data, null, 2)}`);  // Log the response data
        const data = response.data;

        // Check if any data was fetched
        if (data.length === 0) {
            console.log('No data fetched. Check your query and database entries.'); // Log if no data is returned
            return;
        }

        // Extract only the sensorId and status from the fetched data
        const statuses = data.map(sensor => ({
            sensorId: sensor.sensorId,
            status: sensor.status, // Assuming this is the exact field name in your Supabase table
        }));

        // Load existing data from sensorData.json if it exists
        const filePath = 'sensorData.json';
        let existingData = {};

        if (fs.existsSync(filePath)) {
            const fileContents = fs.readFileSync(filePath, 'utf8');
            existingData = JSON.parse(fileContents);
        }

        // Append new statuses without duplicates
        statuses.forEach(({ sensorId, status }) => {
            if (!existingData[sensorId]) {
                existingData[sensorId] = [];
            }

            // Update the status for the sensorId
            existingData[sensorId].push(status); // Store the exact status string

            // Limit to the latest 24 statuses for each sensorId
            if (existingData[sensorId].length > 24) {
                existingData[sensorId].shift(); // Remove the oldest status
            }
        });

        // Write the updated statuses back to sensorData.json
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
        console.log('Sensor statuses fetched and saved successfully!');
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
};

fetchData();
