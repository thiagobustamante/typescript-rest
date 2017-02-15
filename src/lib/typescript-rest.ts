"use strict";

import * as path from "path";
import * as fs from "fs-extra";

import * as Errors from "./server-errors";
import * as Return from "./server-return";
import {Server} from "./server";

export * from "./decorators";
export * from "./server-types";
export * from "./server";

export {Return};
export {Errors};

const CONFIG_FILE = path.join(process.cwd(), 'rest.config');
if (fs.existsSync(CONFIG_FILE)) {
    let config = fs.readJSONSync(CONFIG_FILE);
    if (config.useIoC) {
        Server.useIoC();
    } else if (config.serviceFactory) {
        if (config.serviceFactory.indexOf('.') === 0) {
            config.serviceFactory = path.join(process.cwd(), config.serviceFactory);
        }
        const serviceFactory = require(config.serviceFactory);
        Server.registerServiceFactory(serviceFactory);
    }
}