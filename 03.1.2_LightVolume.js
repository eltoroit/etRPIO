const rpio = require('rpio');
const { Pins } = require('./pins');
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let LEDs = [
    Pins.WPi_2_Physical(0),
    Pins.WPi_2_Physical(1),
    Pins.WPi_2_Physical(2),
    Pins.WPi_2_Physical(3),
    Pins.WPi_2_Physical(4),
    Pins.WPi_2_Physical(5),
    Pins.WPi_2_Physical(6), // Skip Ping WPi.7
    Pins.WPi_2_Physical(8),
    Pins.WPi_2_Physical(9),
    Pins.WPi_2_Physical(10)
];

let i = 0;
console.log("Program is starting");
LEDs.forEach(LED => {
    rpio.open(LED, rpio.OUTPUT, rpio.HIGH);
});

async function showValue(value) {
    for (let i = 0; i < LEDs.length; i++) {
        let stateLED = i < value ? rpio.LOW : rpio.HIGH;
        rpio.write(LEDs[i], stateLED);
    }
}

async function main() {
    for (let i = 0; i <= LEDs.length; i++) {   // move led(on) from left to right
        await showValue(i);
        await Pins.delay(500);
    }
    for (let i = LEDs.length; i >= 0; i--) {   // move led(on) from right to left
        await showValue(i);
        await Pins.delay(500);
    }

    Promise.resolve().then(() => {
        main();
    });
}
main();