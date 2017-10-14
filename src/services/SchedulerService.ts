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

import { EventEmitter } from 'events';

export class SchedulerService extends EventEmitter {

    action: () => void;
    handle: NodeJS.Timer;
    interval: number;

    constructor(action: () => void, ms: number) {
        super();
        this.action = action;
        this.handle = undefined;
        this.interval = ms;
        this.addListener('timeout', this.action);
    }

    public start() {
        if (!this.handle) {
            this.handle = setInterval(() => this.emit('timeout'), this.interval);
        }
    }

    public startOnce() {
        if (!this.handle) {
            this.handle = setTimeout(() => this.emit('timeout'), this.interval);
        }
    }

    public stop() {
        if (this.handle) {
            clearInterval(this.handle);
            this.handle = undefined;
        }
    }
}
