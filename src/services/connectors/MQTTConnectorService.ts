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


import { connect, MqttClient,IPublishPacket } from "mqtt";
import {StringDecoder } from 'string_decoder';
import { EventEmitter } from "events";

const log = console;

/**
 * A service to publish data to an MQTT queue.
 */
export class MQTTConnectorService {
    private topics: string[];
    client: MqttClient;

    constructor(broker_address: string, port: number, username: string, password: string, ca: string) {
        this.client = connect(undefined, { host: broker_address, port: port, username: username, password: password, ca: ca, protocol: "mqtt" });
        this.topics = [];
    }

    public subscribe(topics: string[], receiver: EventEmitter, eventSymbol: symbol) {
        if (this.client.connected) {
            this.client.subscribe(topics, { qos: 1 }, (e, g) => {
                g.map(v => v.topic)
                .filter(t => topics.indexOf(t) < 0)
                .forEach(t => log.warn(`Could not subscribe to ${t}`))
                if (e) {
                    console.error(`Error subscribing to ${JSON.stringify(topics)}: ${e.message}`)
                }
                else {
                    this.client.on('message', (t,p, pkg) => {
                        if(pkg.cmd == 'publish'){
                            const dec = new StringDecoder(); 
                            const msg = dec.write(p);
                            if(msg) { 
                                const contents = JSON.parse(msg);
                                receiver.emit(eventSymbol, contents);
                            }
                            else {
                                log.warn(`Received a weird message that couldn't be UTF8 decoded.`)
                            }                            
                        }
                    })
                }
            });
        }
    }

    public unsubscribe(topics: string[]) {
        if (this.client.connected) {
            this.client.unsubscribe(topics);
        }
    }
    /**
     * shutdown
     */
    public shutdown() {
        this.client.end();
    }
}
