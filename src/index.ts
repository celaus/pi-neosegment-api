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

import { NeoSegmentService } from './services/NeoSegmentService';
import { ConfigService } from './services/ConfigService';
import { Configuration } from './common/Config';
import { readFileSync, appendFileSync } from 'fs';
import { App } from './App';
import we from './common/Symbol'
import { NeoSegmentRouter } from './routes/NeoSegmentRouter';
import { AzureServiceBusConnectorService } from './services/connectors/AzureServiceBusConnectorService';
import { MQTTConnectorService } from './services/connectors/MQTTConnectorService';
import { EventEmitter } from "events";

const log = console;

let configFilePath = undefined;
if (process.argv.length == 3) {
    const args = process.argv.slice(2);
    configFilePath = args[0];
}

const configService = new ConfigService();
let configuration: Configuration = undefined;


if(configFilePath) {
    log.info("Reading config ", configFilePath);
    let configRaw = readFileSync(configFilePath);
    try {
        configuration = configService.parseToml(configRaw.toString());
    } catch (error) {
        log.error(`Could not read config: ${error}`);
        process.exit(1);
    }
}
else {
    try {   
        log.info("Reading config from environment variables ");
        configuration = configService.parseEnvironmentVars();
    } catch (error) {
        log.error(`Could not read config from environment: ${error}`);
        process.exit(1);
    }
    
}

const app = new App();


const neoSegmentService = new NeoSegmentService(configuration.display.leds, configuration.display.brightness);
const segmentWriterRoute = new NeoSegmentRouter();
neoSegmentService.subscribe(we.emitter, we.symbol);

let azure: AzureServiceBusConnectorService = undefined;

if (configuration.azureServiceBus && configuration.azureServiceBus.enabled) {
    azure = new AzureServiceBusConnectorService(configuration.azureServiceBus.connectionString)
    azure.startPolling(configuration.azureServiceBus.queues[0],
        configuration.azureServiceBus.interval);
    log.info("Starting Azure Service Bus polling.")
}

let mqtt: MQTTConnectorService = undefined;

if (configuration.mqtt && configuration.mqtt.enabled) {
    mqtt = new MQTTConnectorService(configuration.mqtt.broker,
        configuration.mqtt.port,
        configuration.mqtt.user,
        configuration.mqtt.password,
        configuration.mqtt.caPath);
    mqtt.subscribe(configuration.mqtt.topic, we.emitter, we.symbol);
    log.info("Starting MQTT polling.")
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
    log.info(`Started HTTP Server, listening on ${addr}`);
}