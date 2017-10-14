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
import { NeoSegmentService } from '../services/NeoSegmentService';

export class NeoSegmentRouter {
    router: Router

    constructor() {
        this.router = Router();
        this.init();
    }


    public displayText(req: Request, res: Response, next: NextFunction) {
        const text = req.query.text || "";
        const timeout = parseInt(req.query.timeout);
        const colors = JSON.parse(req.query.colors);
        new NeoSegmentService(42, timeout).write(text, colors);
    }


    init() {
        this.router.get('/write', this.displayText);
    }
}

const segmentRoutes = new NeoSegmentRouter();
segmentRoutes.init();

export default segmentRoutes.router;