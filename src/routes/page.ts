import { Router } from 'express';
import { updateFrontPage } from '../notion-client/frontPage.js';

const router = Router();

router.patch('/update', async (_req, res) => {
    await updateFrontPage();
    res.status(200).send('page updated');
});

export { router as page };
