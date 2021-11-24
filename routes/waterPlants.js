import { Router } from 'express';
import { updateFrontPage } from '../notion-client/frontPage.js';
import { updateLastWatered } from '../notion-client/plantsTable.js';

const router = Router();

router.post('/:ids', (req, res) => {
    const ids = req.params.ids.split(':');
    const plantsToUpdate = ids.map(id => updateLastWatered(id));
    Promise.all(plantsToUpdate);
    updateFrontPage();
    res.status(200).send('watered plants!');
});

export { router as waterPlants };
