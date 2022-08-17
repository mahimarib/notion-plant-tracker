import { CronJob } from '../index.js';
import { updateFrontPage } from '../notion-client/frontPage.js';

const job: CronJob = {
    // runs every midnight
    field: '0 0 * * *',
    async run() {
        await updateFrontPage();
        console.log('front page updated');
    }
}

export default job;