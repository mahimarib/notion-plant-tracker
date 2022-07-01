import {} from 'dotenv/config';
import express from 'express';
import cron from 'node-cron';
import fs from 'node:fs';
import { plants } from './routes/plants.js';
import { waterPlants } from './routes/waterPlants.js';

const app = express();

app.use(express.json());
app.use('/plants', plants);
app.use('/water-plants', waterPlants);

const port = process.env.PORT;

app.listen(port, '0.0.0.0', () => {
    console.log(`plant server running on http://zero-w.local:${port}`);
});

const jobFiles = fs
    .readdirSync('./src/cron-jobs')
    .filter(file => file.endsWith('.js'));

jobFiles.forEach(async file => {
    const { field, jobToRun } = await import(`./cron-jobs/${file}`);
    cron.schedule(field, jobToRun);
});
