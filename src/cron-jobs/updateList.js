import { updateFrontPage } from '../notion-client/frontPage.js';

// runs every midnight
const field = '0 0 * * *';

async function jobToRun() {
    await updateFrontPage();
    console.log('front page updated');
}

export { field, jobToRun };
