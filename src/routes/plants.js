import { Router } from 'express';
import { getPlantsMap, getSchedule } from '../notion-client/plantsTable.js';
const router = Router();

router.get('/', async (req, res) => {
    const plantsMap = await getPlantsMap();
    res.status(200).json(plantsMap);
});

router.get('/schedule/:ids', async (req, res) => {
    const ids = req.params.ids.split(':');
    const data = await getSchedule(ids);
    res.status(200).json(data);
});

export { router as plants };
