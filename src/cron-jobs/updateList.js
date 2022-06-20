import { updateFrontPage } from '../notion-client/frontPage.js';

// runs every midnight
const field = '0 0 0 * * *';

function jobToRun() {
    console.log('updating front page');
    updateFrontPage();
}

export { field, jobToRun };
