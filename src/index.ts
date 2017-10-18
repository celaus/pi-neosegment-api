//    Copyright 2017 Claus Matzinger
// 
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
// 
//        http://www.apache.org/licenses/LICENSE-2.0
// 
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

import * as http from 'http';
import * as debug from 'debug';

import { SchedulerService } from './services/SchedulerService';
import { MQTTService } from './services/MQTTService';
import { NeoSegmentService } from './services/NeoSegmentService';
import { ConfigService } from './services/ConfigService';
import { Configuration } from './common/Config';
import { readFileSync, appendFileSync } from 'fs';
import { App } from './App';
import we from './common/Symbol'
import { NeoSegmentRouter } from './routes/NeoSegmentRouter';
import { AzureServiceBusService } from './services/AzureServiceBusService';

const log = console;

log.info('ts-express:server');
let configFilePath = "config.toml";
if (process.argv.length == 3) {
    const args = process.argv.slice(2);
    configFilePath = args[0];
}
log.info("Reading config ", configFilePath);
let configRaw = readFileSync(configFilePath);

const configService = new ConfigService();
let configuration: Configuration = undefined;
try {
    configuration = configService.parse(configRaw.toString());
} catch (error) {
    log.error(`Could not read config: ${error}`);
    process.exit(1);
}

const neoSegmentService = new NeoSegmentService(42);
const segmentWriterRoute = new NeoSegmentRouter();
neoSegmentService.subscribe(we.emitter, we.symbol);

const app = new App();
let azure: AzureServiceBusService = undefined;

if (configuration.azureServiceBus && configuration.azureServiceBus.enabled) {
    azure = new AzureServiceBusService(configuration.azureServiceBus.connectionString)
    azure.startPolling(configuration.azureServiceBus.queues[0],
        configuration.azureServiceBus.interval);
    log.info("Starting Azure Service Bus polling.")
}
app.addRoute('/api/v1/display', segmentWriterRoute.router);
app.express.set('port', configuration.http.port);
const server = http.createServer(app.express);
server.on('error', onError);
server.on('listening', onListening);
server.listen(configuration.http.port);


function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;
    let bind = 'Port ' + configuration.http.port;
    switch (error.code) {
        case 'EACCES':
            log.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            log.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening(): void {
    let addr = server.address();
    let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
    log.info(`Listening on ${bind}`);
}