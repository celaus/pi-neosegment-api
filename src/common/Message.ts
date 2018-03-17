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

export interface ITextMessage {
    text: String,
    colors: Array<number>,
    scrollTimeout: number
}

export interface IPatternMessage {
    pattern: Array<number>,
    scrollTimeout: number
}




function setIndex(color: number, indices: Iterable<number>): Array<number> {
    let a = Array.apply(null, Array(7)).map(v => 0);
    for (let i of indices) {
        a[i] = color;
    };
    return a;
}

export function textToPattern(txt: ITextMessage): IPatternMessage {
    let zipped = new Array(txt.text.length);
    for (var i = 0; i < zipped.length; i++) {
        zipped[i] = [txt.text[i], txt.colors[i]];
    }
    return {
        scrollTimeout: txt.scrollTimeout,
        pattern: zipped.map((c) => {
            segmentForChar(c[0], c[1]);
        }).reduce((p, c, _) => {
            return p.concat(c);
        }, [])
    };
}

function segmentForChar(c: string, color: number): Array<number> {
    switch (c[0].toUpperCase()) {
        case "A": return setIndex(color, [0, 2, 3, 4, 5, 6]);
        case "8":
        case "B": return setIndex(color, [0, 1, 2, 3, 4, 5, 6]);
        case "C": return setIndex(color, [0, 1, 4, 5]);
        case "D": return setIndex(color, [0, 1, 2, 3, 6]);
        case "E": return setIndex(color, [0, 1, 3, 4, 5]);
        case "F": return setIndex(color, [0, 3, 4, 5]);
        case "6":
        case "G": return setIndex(color, [0, 1, 2, 3, 4, 5]);
        case "H": return setIndex(color, [0, 2, 3, 4]);
        case "1":
        case "I": return setIndex(color, [0, 4]);
        case "J": return setIndex(color, [0, 1, 2, 5, 6]);
        case "K": return setIndex(color, [0, 3, 4]);
        case "L": return setIndex(color, [0, 1, 4]);
        case "M": return setIndex(color, [0, 2, 3, 5]);
        case "N": return setIndex(color, [0, 2, 3]);
        case "O": return setIndex(color, [0, 1, 2, 4, 5, 6]);
        case "P": return setIndex(color, [0, 3, 4, 5, 6]);
        case "Q": return setIndex(color, [2, 3, 4, 5, 6]);
        case "R": return setIndex(color, [0, 3]);
        case "5":
        case "S": return setIndex(color, [1, 2, 3, 4, 5]);
        case "T": return setIndex(color, [0, 4, 5]);
        case "U": return setIndex(color, [0, 1, 2]);
        case "V": return setIndex(color, [0, 1, 2, 4, 6]);
        case "W": return setIndex(color, [0, 1, 2, 5]);
        case "X": return setIndex(color, [0, 2, 3, 4, 6]);
        case "Y": return setIndex(color, [1, 2, 3, 4, 6]);
        case "Z": return setIndex(color, [0, 1, 3, 5, 6]);
        case "0": return setIndex(color, [0, 1, 2, 4, 5, 6]);
        case "2": return setIndex(color, [0, 1, 3, 5, 6]);
        case "3": return setIndex(color, [1, 2, 3, 5, 6]);
        case "4": return setIndex(color, [2, 3, 4, 6]);
        case "7": return setIndex(color, [2, 4, 5, 6]);
        case "9": return setIndex(color, [1, 2, 3, 4, 5, 6]);
        case "-": return setIndex(color, [3]);
        case "_": return setIndex(color, [1]);
        case "|": return setIndex(color, [2, 6]);
        default: return setIndex(color, []);
    }
}
