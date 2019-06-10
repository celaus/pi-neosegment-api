//    Copyright 2017 cm
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


import * as azure from "azure-sb";

import { SchedulerService } from "../../services/SchedulerService"
import we from "../../common/Symbol"
import { EventEmitter } from "events";


export class AzureServiceBusConnectorService {
    pollReference: SchedulerService;
    endpoint: azure.ServiceBusService;

    constructor(endpoint: string) {
        this.endpoint = azure.createServiceBusService(endpoint);
        this.pollReference = undefined;
    }

    public stop() {
        if (this.pollReference) {
            this.pollReference.stop();
            this.pollReference = undefined;
        } else {

        }
    }


    public startPolling(q: string, interval: number) {
        if (!this.pollReference) {
            this.pollReference = new SchedulerService(() => this.endpoint.receiveQueueMessage(q, (e, msg) => {
                if (!e) {
                    let m = msg["body"];
                    we.emitter.emitWriteEvent({
                        text: m, 
                        colors: m.split('').map(v => 65535), 
                        scrollTimeout: 2000
                    });

                }
            }), interval);
            this.pollReference.start();
        }
    }
}
