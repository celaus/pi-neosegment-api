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

import { Configuration } from '../common/Config';
import { TomlReader } from '@sgarciac/bombadil';

class EnvironmentVariablesConfig {
    private PREFIX = "n";
    private e(path: string): string {
        return process.env[`${this.PREFIX}_${path}`.toUpperCase()];
    }

    public result = {
        http: {
            port: this.e('http_port'),
        },
        display: {
            leds:  +this.e('display_leds'),
            brightness: +this.e('display_brightness'),
        }, mqtt:this.e('mqtt')? {
            topic: this.e('mqtt_topic'),
            broker: this.e('mqtt_broker'),
            port: +this.e('mqtt_port'),
            user: this.e('mqtt_user'),
            password: this.e('mqtt_password'),
            caPath: this.e('mqtt_ca'),
            enabled: this.e('mqtt_enabled').toLowerCase() == "true"
        }: undefined,
        azureServiceBus: this.e('azureServiceBus')? {
            enabled: this.e('azureServiceBus_enabled').toLowerCase() == "true",
            connectionString: this.e('azureServiceBus_connectionString'),
            interval: +this.e('azureServiceBus_interval'),
            queues: this.e('azureServiceBus_queues'),
        }: undefined
    };
}


export class ConfigService {

    private defaultPort: number = 3000;
    private defaultTopics = ["topic"];
    private defaultBrokerAddress = 'localhost'
    private defaultBrokerPort = 1883
    private defaultLeds = 42
    private defaultBrightness = 128
    
    

    private extractConfig(config: object): Configuration {
        return {
            http: {
                port: config['http']['port'] || this.defaultPort,
            },
            display: {
                leds: config['display']['leds'] || this.defaultLeds,
                brightness: config['display']['brightness'] || this.defaultBrightness,
            },mqtt:config['mqtt']? {
                topic: config['mqtt']['topic'] || this.defaultTopics,
                broker: config['mqtt']['broker'] || this.defaultBrokerAddress,
                port: config['mqtt']['port'] || this.defaultBrokerPort,
                user: config['mqtt']['user'] || undefined,
                password: config['mqtt']['password'] || undefined,
                caPath: 'ca' in config['mqtt'] ? config['mqtt']['ca'] : undefined,
                enabled: config['mqtt']['enabled']
            }: undefined,
            azureServiceBus: config['azureServiceBus']? {
                enabled: config['azureServiceBus']['enabled'],
                connectionString: config['azureServiceBus']['connectionString'],
                interval: config['azureServiceBus']['interval'],
                queues: config['azureServiceBus']['queues'],
            }: undefined
        };
    }

    public parseEnvironmentVars(): Configuration {
        return this.extractConfig(new EnvironmentVariablesConfig().result);
    }
    /**
     * Parses a string configuration into an `Configuration` interface.
     * @param rawConfig TOML configuration to read from.
     */
    public parseToml(toml: string): Configuration {
        let reader = new TomlReader();
        reader.readToml(toml.toString());
        if (!reader.result) {
            throw new Error(`Unable to read configuration: ${reader.errors ? reader.errors : "Invalid TOML found"}`);
        }
        return this.extractConfig(reader.result);
    }
}

/* */