import { Router } from 'express';
import { updateFrontPage } from '../notion-client/frontPage.js';

const router = Router();

router.patch('/update', async (req, res) => {
    await updateFrontPage();
    res.status(200).send('page updated');
});

export { router as page };
