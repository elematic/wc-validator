import {App, mount, Router, serve} from 'zipadee';
import type {PackageService} from '../npm/package-service.js';
import {homeHandler} from './home.js';
import {validateHandler} from './validate.js';

export const makeApp = async (files: PackageService) => {
  const {PORT} = process.env;
  const port = PORT === undefined ? 8080 : parseInt(PORT, 10);

  const app = new App();
  const router = new Router();

  router.get('/', homeHandler);
  router.get('/validate', validateHandler(files));

  app.use(mount('/static/', serve('static')));
  app.use(router.routes());

  await app.listen(port);
  console.log(`Validator server listening on port ${port}`);
};
