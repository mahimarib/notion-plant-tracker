import { CronJob } from '../index.js';
import { updateFrontPage } from '../notion-client/frontPage.js';

export const job: CronJob = {
    // runs every midnight
    field: '0 0 * * *',
    run: async () => {
        await updateFrontPage();
        console.log('front page updated');
    }
}
