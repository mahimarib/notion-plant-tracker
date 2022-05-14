import {} from 'dotenv/config';
import express from 'express';
import cron from 'node-cron';
import { plants } from './routes/plants.js';
import { waterPlants } from './routes/waterPlants.js';
import { updateFrontPage } from './notion-client/frontPage.js';

const app = express();

app.use(express.json());
app.use('/plants', plants);
app.use('/water-plants', waterPlants);

const port = process.env.PORT;

app.listen(port, '0.0.0.0', () => {
    console.log(`plant server running on http://zero-w.local:${port}`);
});

// runs every midnight
cron.schedule('0 0 0 * * *', () => {
    console.log('updating front page');
    updateFrontPage();
});
