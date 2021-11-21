import { Router } from 'express';
import { getPlantsMap } from '../notion-client/plantsTable.js';
const router = Router();

router.get('/', async (req, res) => {
    const plantsMap = await getPlantsMap();
    res.status(200).json(plantsMap);
});

export { router as plants };
