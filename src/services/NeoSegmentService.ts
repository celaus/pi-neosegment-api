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

import {
    ws281x
} from "rpi-ws281x-native";
import {
    SchedulerService
} from "./SchedulerService";

function concat(x: any, y: any, idx: number): any {
    return x.concat(y);
}

function flatMap<TIn, TOut>(fn: (e, i) => TOut, c: Array<TIn>): Iterable<TOut> {
    return c.map(fn).reduce(concat, []);
}

function setIndex(color: number, indices: Iterable<number>): Uint32Array {
    let a = new Uint32Array(7).map((v, i) => 0x0);
    for (let i in indices) {
        a[i] = color;
    };
    return a;
}

function segmentForChar(c: string, color: number) {
    let a: Uint32Array;
    switch (c[0].toUpperCase()) {
        case "A": return setIndex(color, [0, 2, 3, 4, 5, 6]);
        case "8":
        case "B": return setIndex(color, [0, 1, 2, 3, 4, 5, 6]);
        case "C": return setIndex(color, [0, 1, 4, 5]);
        case "D": return setIndex(color, [0,1,2,4,5,6]);
        case "E": return setIndex(color, [0,1,3,4,5]);
        case "F": return setIndex(color, [0,3,4,5]);
        case "6":
        case "G": return setIndex(color, [0,1,2,3,4,5]);
        case "H": return setIndex(color, [0,2,3,4,6]);
        case "1":
        case "I": return setIndex(color, [0,4]);
        case "J": return setIndex(color, [0,1,2,5,6]);
        case "K": return setIndex(color, [0,3,4]);
        case "L": return setIndex(color, [0,1,4]);
        case "M": return setIndex(color, [0,2,4,5,6]);
        case "N": return setIndex(color, [0,2,4,5,6]);
        case "O": return setIndex(color, [0,1,2,4,5,6]);
        case "P": return setIndex(color, [0,3,4,5,6]);
        case "Q": return setIndex(color, [2,3,4,5,6]);
        case "R": return setIndex(color, [0,3]);
        case "5":
        case "S": return setIndex(color, [1,2,3,4,5]);
        case "T": return setIndex(color, [0,4,5]);
        case "U": return setIndex(color, [0,1,2,4,6]);
        case "V": return setIndex(color, [0,1,2,4,6]);
        case "W": return setIndex(color, []);
        case "X": return setIndex(color, []);
        case "Y": return setIndex(color, [1,2,3,4,6]);
        case "Z": return setIndex(color, []);
        case "0": return setIndex(color, [0,1,2,4,5,6]);
        case "2": return setIndex(color, [0,1,3,5,6]);
        case "3": return setIndex(color, [1,2,3,5,6]);
        case "4": return setIndex(color, [2,3,4,6]);
        case "7": return setIndex(color, [2,4,5,6]);
        case "9": return setIndex(color, [1,2,3,4,5,6]);
        default: return setIndex(color, []);
    }
}

export class NeoSegmentService {
    private neoSegments: Uint32Array;
    private scrollTimeout: number;
    private charsPerLine: number;
    private numLeds: number;

    constructor(numLeds: number, scrollTimeout: number) {
        this.numLeds = numLeds;
        this.charsPerLine = numLeds / 7;
        this.scrollTimeout = scrollTimeout;
    }

    write(text: string, chars: Uint32Array): Promise<void> {
        let scroller: SchedulerService;
        return new Promise((resolve, reject) => {
            ws281x.init(this.numLeds);
            let lineNr = 0;
            const scrolledWriting = function () {
                if(lineNr < text.length) {
                    const lineStart = this.charsPerLine * lineNr;
                    const lineEnd = this.charsPerLine * lineNr + this.charsPerLine;
                    let line = text.slice(lineStart, lineEnd);
                    let colors = chars.slice(lineStart, lineEnd);
                    ws281x.render(flatMap((v,i) => segmentForChar(v,colors[i]), line.split('')))
                    lineNr += this.charsPerLine;
                }
                else {
                    scroller.stop();
                    ws281x.reset();
                    resolve();                    
                }
            }
            scroller = new SchedulerService(scrolledWriting, this.scrollTimeout);
            scroller.startOnce();
        });
    }
}