import "dotenv/config";
import express from 'express';
import { readdirSync } from 'fs';
import cron from 'node-cron';
import { page } from './routes/page.js';
import { plants } from './routes/plants.js';
import { waterPlants } from './routes/waterPlants.js';
import { weather } from './routes/weather.js';


const app = express();

app.use(express.json());
app.use('/plants', plants);
app.use('/water-plants', waterPlants);
app.use('/page', page);
app.use('/weather', weather);

const port: number = parseInt(process.env.PORT);

app.listen(port, '0.0.0.0', () => {
    console.log(`plant server running on http://zero-w.local:${port}`);
});

export interface CronJob {
    field: string,
    run: () => void
}

const jobFiles =
    readdirSync('./src/cron-jobs')
        .filter(file => file.endsWith('.js'));

jobFiles.forEach(async file => {
    const { field, run }: CronJob = await import(`./cron-jobs/${file}`);
    cron.schedule(field, run);
});
