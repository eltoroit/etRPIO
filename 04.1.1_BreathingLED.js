const rpio = require('rpio');
const { Pins } = require('./pins');
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function ask(question) {
    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            resolve(answer);
        })
    })
}

let range = 1000;
let clockDivider = 8;
// PWM Frequency
// CLOCK: PWM Clock in Raspberry Pi 4B = 54Mhz
// Frequency = CLOCK / (range * clockDivider)
// ClockDivider: Must be 2^# up to 4096 (2^12)
// With range=1000 and clockDivider=8, the frequency is 6.75KHz
// This is the frequency at which the value gets updated... Not the frequency at which the data changes. If the value changes slower, then the same value is put out on the line.

let pin = Pins.WPi_2_Physical(1);
// This helps me troubleshoot the code in VS Code in Mac since I was not able to figure out how to debug with sudo which is required.
// rpio.init({ gpiomem: false, mock: 'raspi-3' });
rpio.open(pin, rpio.PWM);
rpio.pwmSetClockDivider(clockDivider);
rpio.pwmSetRange(pin, range);

let msg = "";
let data = 0;
let delay = 20;
let timer = null;
let factor = Math.floor(range / 100);
let direction = 1 * factor;
async function changeLED() {
    if (data <= 0) {
        data = 0 + factor;
        direction = 1 * factor;
        // console.log(`${new Date().toJSON()} >> Breath`);
        await Pins.delay(100);
        // console.log(`${new Date().toJSON()} >> Go UP`);
    } else if (data >= range) {
        data = range - factor;
        direction = -1 * factor;
        // console.log(`${new Date().toJSON()} >> Breath`);
        await Pins.delay(100);
        // console.log(`${new Date().toJSON()} >> Go DOWN`);
    } else {
        // let newMsg = `${parseFloat(100 * data / range).toFixed(2)}%`;
        // if (msg !== newMsg) console.log(newMsg);
        // msg = newMsg;
        if (data >= 0 && data <= range) rpio.pwmSetData(pin, data);
        data += direction;
    }
    timer = setTimeout(() => {
        changeLED();
    }, delay);
}

function askToContinue() {
    console.log(`range: ${range}`);
    console.log(`clockDivider: ${clockDivider}`);
    ask('Are you ready to continue? [Yn]')
        .then((answer) => {
            if (answer.toUpperCase()[0] === "Y") {
                ask('Hit ENTER to stop...')
                    .then(() => {
                        clearTimeout(timer);
                        console.log("STOPPED");
                        askToContinue();
                    })
                    .catch(error => new Error(error));
                console.log("\nStarting");
                changeLED();
            } else if (answer.toUpperCase()[0] === "N") {
                rpio.open(pin, rpio.INPUT);
                process.exit(0);
            } else {
                askToContinue();
            }
        })
        .catch(error => new Error(error));
}
askToContinue();