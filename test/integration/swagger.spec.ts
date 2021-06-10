import * as express from 'express';
import * as _ from 'lodash';
import * as request from 'request';
import * as YAML from 'yamljs';
import { Server } from '../../src/typescript-rest';

let server: any;
let swaggerFile: any;

describe('Swagger Tests', () => {

    beforeAll(() => {
        return startApi();
    });

    afterAll(() => {
        stopApi();
    });

    describe('Api Docs', () => {
        it('should be able to send the YAML API swagger file', (done) => {
            request.get('http://localhost:5674/api-docs/yaml', (error, response, body) => {
                const swaggerDocument: any = YAML.parse(body);
                const expectedSwagger = _.cloneDeep(swaggerFile);
                expectedSwagger.host = 'localhost:5674';
                expectedSwagger.schemes = ["http"];
                expect(expectedSwagger).toEqual(swaggerDocument);
                done();
            });
        });
        it('should be able to send the JSON API swagger file', (done) => {
            request.get('http://localhost:5674/api-docs/json', (error, response, body) => {
                const swaggerDocument: any = JSON.parse(body);
                expect(swaggerDocument.basePath).toEqual('/v1');
                done();
            });
        });
    });
});

export function startApi(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const app: express.Application = express();
        app.set('env', 'test');
        swaggerFile = YAML.load('./test/data/swagger.yaml');
        Server.swagger(app, {
            endpoint: 'api-docs',
            filePath: './test/data/swagger.yaml',
            host: 'localhost:5674',
            schemes: ['http']
        });
        server = app.listen(5674, (err?: any) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

export function stopApi() {
    if (server) {
        server.close();
    }
}