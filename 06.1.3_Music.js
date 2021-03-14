// Music
// https://learn.digilentinc.com/Documents/392

const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;
const { performance } = require('perf_hooks');

const outPin = 17;
const output = new Gpio(outPin, { mode: Gpio.OUTPUT });


const notes = {
    a1: 55,
    A1: 58.27,
    a2: 110,
    A2: 116.54,
    a3: 220,
    A3: 233.08,
    a4: 440,
    A4: 466.16,
    a5: 880,
    A5: 932.33,
    a6: 1760,
    A6: 1864.7,
    a7: 3520,
    A7: 3729.3,
    b1: 61.735,
    b2: 123.47,
    b3: 246.94,
    b4: 493.88,
    b5: 987.77,
    b6: 1979.5,
    b7: 3951.1,
    c1: 32.703,
    C1: 34.648,
    c2: 65.406,
    C2: 69.296,
    c3: 130.81,
    C3: 138.59,
    c4: 261.63,
    C4: 277.184,
    c5: 523.25,
    C5: 554.37,
    c6: 1046.5,
    C6: 1108.7,
    c7: 2093,
    C7: 2217.5,
    d1: 36.708,
    D1: 38.891,
    d2: 73.416,
    D2: 77.782,
    d3: 146.83,
    D3: 155.56,
    d4: 293.66,
    D4: 311.13,
    d5: 587.33,
    D5: 622.25,
    d6: 1174.7,
    D6: 1244.5,
    d7: 2349.3,
    D7: 2489,
    e1: 41.203,
    e2: 82.407,
    e3: 164.81,
    e4: 329.63,
    e5: 659.25,
    e6: 1318.5,
    e7: 2637,
    f1: 43.654,
    F1: 46.249,
    f2: 87.307,
    F2: 92.499,
    f3: 174.61,
    F3: 185,
    f4: 349.23,
    F4: 369.99,
    f5: 698.46,
    F5: 739.99,
    f6: 1396.9,
    F6: 1480,
    f7: 2793.8,
    F7: 2960,
    g1: 48.99,
    G1: 51.913,
    g2: 97.999,
    G2: 103.83,
    g3: 196,
    G3: 207.65,
    g4: 392,
    G4: 415.3,
    g5: 783.99,
    G5: 830.61,
    g6: 1568,
    G6: 1661.2,
    g7: 3136,
    G7: 3322.4
}

if (notes["a1"] === notes["A1"]) {
    throw new Error("DOES NOT DIFFERENTIATE UPPER / LOWER CASE!");
}

// SONG-START
const tempo = 100; // The tempo is 100 whole notes per minute
const typicalNoteLength = 0.25; // The typical length notes in the song are quarter notes
const newNoteLength = [0.0167, 0.3333]; // Store the modified note lengths for the song
const fullMelody = [
    "e5!0-=e5-=e5   -=c5e5-=  g5-=-=-= g4-=-=-=",
    "c5-=-=g4 -=-=e4-= -=a4-=b4 -=A4a4-=",
    "!1g4!1e5!1g5 a5-=f5g5 -=e5-=c5 d5b4-=-=",
    "c5-=-=g4 -=-=e4-= -=a4-=b4 -=A4a4-=",
    "!1g4!1e5!1g5 a5-=f5g5 -=e5-=c5 d5b4-=-=",
    "-=-=g5F5 f5D5-=e5 -=G4a4c5 -=a4c5d5",
    "-=-=g5F5 f5D5-=e5 -=c6-=c6 c6-=-=-=",
    "-=-=g5F5 f5D5-=e5 -=G4a4c5 -=a4c5d5",
    "-=-=D5-= -=d5-=-= c5-=-=-= -=-=-=-=",
    "-=-=g5F5 f5D5-=e5 -=G4a4c5 -=a4c5d5",
    "-=-=g5F5 f5D5-=e5 -=c6-=c6 c6-=-=-=",
    "-=-=g5F5 f5D5-=e5 -=G4a4c5 -=a4c5d5",
    "-=-=D5-= -=d5-=-= c5-=-=-= -=-=-=-=",
    "c5c5-=c5 -=c5d5-= e5c5-=a4 g4-=-=-=",
    "c5c5-=c5 -=c5d5e5 -=-=-=-= -=-=-=-=",
    "c5c5-=c5 -=c5d5-= e5c5-=a4 g4-=-=-=",
    "e5e5-=e5 -=c5e5-= g5-=-=-= g4-=-=-=",
    "c5-=-=g4 -=-=e4-= -=a4-=b4 -=A4a4-=",
    "!1g4!1e5!1g5 a5-=f5g5 -=e5-=c5 d5b4-=-=",
    "c5-=-=g4 -=-=e4-= -=a4-=b4 -=A4a4-=",
    "!1g4!1e5!1g5 a5-=f5g5 -=e5-=c5 d5b4-=-=",
    "e5c5-=g4 -=-=G4-= a4f5-=f5 a4-=-=-=",
    "!1b4!1a5!1a5 !1a5!1g5!1f5 e5c5-=a4 g4-=-=-=",
    "e5c5-=g4 -=-=G4-= a4f5-=f5 a4-=-=-=",
    "b4f5-=f5 !1f5!1e5!1d5 c5e4-=e4 c4-=-=-="
];
// SONG-END

function playMelody(song, typicalNoteLength, tempo, newNoteLength) {
    // console.log("Play Melody");
    return new Promise((resolve, reject) => {
        song.forEach(async songLine => {
            await playLine(songLine, typicalNoteLength, tempo, newNoteLength);
        })
        resolve();
    });
}

function playLine(songLine, typicalNoteLength, tempo, newNoteLength) {
    // console.log("Play Line");
    return new Promise(async (resolve, reject) => {
        // Remove whitespaces
        let lineNotes = songLine.replace(/ +/g, '');

        for (let i = 0; i < lineNotes.length; i += 2) {
            let noteLengthMs;

            //get the current note to be played
            let noteLetter = lineNotes[i];
            let noteNum = lineNotes[i + 1];

            //Check to see if the typical note length or a modified note length should be used to play the next note
            if (noteLetter === '!') {
                //use modified note length
                noteLengthMs = noteLengthToMs(newNoteLength[noteNum], tempo);

                i += 2;//increment index to grab the note following the "!0" length modifier
                noteLetter = lineNotes[i];

                //get octave number of note to be played after "!0" length modifier
                noteNum = lineNotes[i + 1];
            } else {
                //use typical note length 
                noteLengthMs = noteLengthToMs(typicalNoteLength, tempo);
            }
            await playNote(noteLetter, noteNum, noteLengthMs);
        }
        resolve();
    });
}

/* Converts tempo based note length (full note, 1/2 note, 1/4 note ect..) to the notes play length in milliseconds */
function noteLengthToMs(noteLen, tempo) {
    //Convert tempo from notes per minute to notes per second
    let notesPerSecond = tempo / 60.0;

    //Calculate the length of one whole note in milliseconds
    let wholeNoteMs = 1000 / notesPerSecond;

    // Calculate the length of note (whole, 1/2, 1/4 ect) in milliseconds
    return wholeNoteMs * noteLen;
}

async function playNote(noteLetter, noteNum, noteLengthMs) {
    // console.log("Play Note");
    return new Promise(async (resolve, reject) => {
        if (noteLetter == '-') {
            //Play nothing
            await delay(noteLengthMs);
        } else {
            await playFreq(notes[`${noteLetter}${noteNum}`], noteLengthMs);
        }
        resolve();
    });
}

function delay(ms) {
    new Promise((resolve, reject) => {
        let stop = performance.now() + ms;
        while (performance.now() < stop) { }
        resolve();
    })
}

let i = 0;
async function playFreq(freqHz, durationMs) {
    // console.log("Make Noise");
    return new Promise(async (resolve, reject) => {
        const micros = 1000 * 1000 / freqHz;
        const dc = Math.floor(Math.round(micros / 2));

        output.digitalWrite(0);
        pigpio.waveClear();

        let waveform = [];
        waveform.push({ gpioOn: outPin, gpioOff: 0, usDelay: dc });
        waveform.push({ gpioOn: 0, gpioOff: outPin, usDelay: dc });
        pigpio.waveAddGeneric(waveform);
        let waveId = pigpio.waveCreate();
        if (waveId >= 0) {
            pigpio.waveTxSend(waveId, pigpio.WAVE_MODE_REPEAT_SYNC);
            await delay(durationMs);
            pigpio.waveTxStop();
            // pigpio.waveDelete(waveId);
            output.digitalWrite(0);
            resolve();
        } else {
            // reject();
            throw new Error("Error creating wave")
        }
    })
}

setTimeout(async () => {
    await playMelody(fullMelody, typicalNoteLength, tempo, newNoteLength);
    console.log("DONE");
}, 100);
