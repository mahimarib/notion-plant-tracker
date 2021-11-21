import { updateFrontPage } from './frontPage.js';
import { notion } from './notion.js';

(async () => {
    await updateFrontPage();
})();
