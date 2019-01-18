'use strict';

import * as Errors from './server-errors';
import * as Return from './server-return';
import { ServerConfig } from './typescript-rest-config';

export * from './decorators';
export * from './server-types';
export * from './server/server';
export * from './passport-authenticator';

export { Return };
export { Errors };
export { DefaultServiceFactory } from './server/server-container';

ServerConfig.configure();
