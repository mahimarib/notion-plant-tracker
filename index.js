import express from 'express';
import dotenv from 'dotenv';
import { plants } from './routes/plants.js';
import { waterPlants } from './routes/waterPlants.js';
import cron from 'node-cron';
import { updateFrontPage } from './notion-client/frontPage.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/plants', plants);
app.use('/water-plants', waterPlants);

const port = process.env.PORT;

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

cron.schedule('0 0 0 * * *', () => {
    console.log('updating front page');
    updateFrontPage();
});
