'use strict';

import * as Errors from './server/model/errors';
import * as Return from './server/model/return-types';
import { ServerConfig } from './typescript-rest-config';

export * from './decorators/parameters';
export * from './decorators/methods';
export * from './decorators/services';
export * from './server/model/server-types';
export * from './server/server';
export * from './authenticator/passport';

export { Return };
export { Errors };
export { DefaultServiceFactory } from './server/server-container';

ServerConfig.configure();
