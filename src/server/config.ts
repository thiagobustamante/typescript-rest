import * as debug from 'debug';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Server } from './server';

const serverDebugger = debug('typescript-rest:server:config:build');

export class ServerConfig {
    public static configure() {
        try {
            const CONFIG_FILE = this.searchConfigFile();
            if (CONFIG_FILE && fs.existsSync(CONFIG_FILE)) {
                const config = fs.readJSONSync(CONFIG_FILE);
                serverDebugger('rest.config file found: %j', config);
                if (config.serviceFactory) {
                    if (config.serviceFactory.indexOf('.') === 0) {
                        config.serviceFactory = path.join(process.cwd(), config.serviceFactory);
                    }
                    Server.registerServiceFactory(config.serviceFactory);
                }
            }
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.error(e);
        }
    }

    public static searchConfigFile() {
        serverDebugger('Searching for rest.config file');
        let configFile = path.join(__dirname, 'rest.config');
        while (!fs.existsSync(configFile)) {
            const fileOnParent = path.normalize(path.join(path.dirname(configFile), '..', 'rest.config'));
            if (configFile === fileOnParent) {
                return null;
            }
            configFile = fileOnParent;
        }
        return configFile;
    }
}
