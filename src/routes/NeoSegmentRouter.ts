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

import { Router, Request, Response, NextFunction } from 'express';
import writeEmitter from '../common/Symbol';

export class NeoSegmentRouter {
    router: Router

    constructor() {
        this.router = Router();
        this.init();
    }
    
    public displayText(req: Request, res: Response, next: NextFunction) {
        const text: string = req.query.text as string || "";
        const timeout: number = parseInt(req.query.timeout as string);
        const colors = (function () {
            if (req.query.colors) { return JSON.parse(req.query.colors as string); }
            else { return new Uint32Array(text.length).map((v, i) => 0xffffff) }
        }());
        writeEmitter.emitter.emitWriteEvent({text: text, colors: colors, scrollTimeout: timeout});
        res.status(200).end();
    }
    init() {
        this.router.get('/write', this.displayText);
    }
}

