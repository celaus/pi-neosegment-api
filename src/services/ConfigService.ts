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


export class ConfigService {

    private defaultImageWidth: number = 1920;
    private defaultImageHeight: number = 1080;
    private defaultTimeout: number = 10; // milliseconds
    private defaultInterval: number = 60000; // milliseconds
    private defaultPort: number = 3000;
    private defaultTopics = ["topic"];
    private defaultBrokerAddress = 'localhost'
    private defaultBrokerPort = 1883
    private defaultRole = 'role'
    private defaultName = 'agent'

    private get_resolution(config: any): Array<number> {
        let resolution = [this.defaultImageWidth, this.defaultImageHeight];
        if (config['timelapse']['resolution'] instanceof Array && config['timelapse']['resolution'].length === 2) {
            resolution = config['timelapse']['resolution'];
        }
        return resolution;
    }

    /**
     * Parses a string configuration into an `Configuration` interface.
     * @param rawConfig TOML configuration to read from.
     */
    public parse(toml: string): Configuration {
        let reader = new TomlReader();
        reader.readToml(toml.toString());
        if (!reader.result) {
            throw new Error(`Unable to read configuration: ${reader.errors ? reader.errors : "Invalid TOML found"}`);
        }
        const config = reader.result;
        const resolution = this.get_resolution(config);
        const imageWidth = resolution[0];
        const imageHeight = resolution[1];
        return {
            http: {
                port: config['http']['port'] || this.defaultPort,
            },
            mqtt: {
                topic: config['mqtt']['topic'] || this.defaultTopics,
                broker: config['mqtt']['broker'] || this.defaultBrokerAddress,
                port: config['mqtt']['port'] || this.defaultBrokerPort,
                user: config['mqtt']['user'] || undefined,
                password: config['mqtt']['password'] || undefined,
                caPath: 'ca' in config['mqtt'] ? config['mqtt']['ca'] : undefined,
            }
        };
    }
}