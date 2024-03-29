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

import ws281x = require("rpi-ws281x-native");
import { SchedulerService } from "./SchedulerService";
import { EventEmitter } from "events";
import { ITextMessage, IPatternMessage, textToPattern } from '../common/Message'

const log = console;


export class NeoSegmentService {
    private brightness: number;
    private charsPerLine: number;
    private numLeds: number;
    private lineNr: number;
    private scroller: SchedulerService;

    constructor(numLeds: number, brightness: number) {
        this.numLeds = numLeds;
        this.charsPerLine = numLeds / 7;
        this.lineNr = 0;
        this.brightness = brightness;
        this.scroller = undefined;
    }

    public subscribe(emitter: EventEmitter, eventSymbol: symbol): void {
        emitter.addListener(eventSymbol, this.writeText.bind(this));
    }

    public unsubscribe(emitter: EventEmitter, eventSymbol: symbol): void {
        emitter.removeListener(eventSymbol, this.writeText);
    }

    private clear() {
        ws281x.init(this.numLeds);
        ws281x.reset();
    }

    private writeText(txt: ITextMessage) {
       const text = txt.text;
        if (text.length != txt.colors.length) {
            log.error(`Error: text length (${text.length}) < colors length (${txt.colors.length})`);
        } else {
            log.info(`Writing text ${text}`);
            this.writePattern(textToPattern(txt));
        }
    }

    private writePattern(pattern: IPatternMessage) {
        const self = this;

        ws281x.init(self.numLeds);
        ws281x.setBrightness(this.brightness);
        
        self.lineNr = 0;
        const scrolledWriting = function () {
            let lineStart: number = self.numLeds * self.lineNr;
            const patternLength = pattern.pattern.length;
            if (lineStart < patternLength) {
                const lineEndTemp = self.numLeds * self.lineNr + self.numLeds;
                const lineEnd = lineEndTemp > patternLength ? patternLength : lineEndTemp;

                //log.info(`Start: ${lineStart}, end: ${lineEnd}`);
                const line = pattern.pattern.slice(lineStart, lineEnd);
                const filler = self.numLeds - line.length > 0
                    ? (Array.apply(null, Array(self.numLeds - line.length))
                        .map((v, i) => 0))
                    : [];
                const rendering = line.concat(filler);
                //log.debug(`Writing text: ${line}. Rendering: ${rendering}`);
                ws281x.render(rendering);
                self.lineNr++;
            }
            else {
                self.scroller.stop();
                self.lineNr = 0;
                self.scroller = undefined;
                ws281x.finalize()
            }
        }
        this.scroller = new SchedulerService(scrolledWriting, pattern.scrollTimeout);
        this.scroller.start();
    }
}