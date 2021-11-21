import { Router } from 'express';
import { updateFrontPage } from '../notion-client/frontPage.js';
import {
    updateLastWatered,
    getSchedule,
} from '../notion-client/plantsTable.js';

const router = Router();

router.post('/:ids', (req, res) => {
    const ids = req.params.ids.split(':');
    const plantsToUpdate = ids.map(id => updateLastWatered(id));
    Promise.all(plantsToUpdate);
    updateFrontPage();
    res.status(200).send('watered plants!');
});

router.get('/remind/:ids', async (req, res) => {
    const ids = req.params.ids.split(':');
    const data = await getSchedule(ids);
    res.status(200).json(data);
});

export { router as waterPlants };
