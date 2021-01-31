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

console.log("Program is starting");
LEDs.forEach(LED => {
    rpio.open(LED, rpio.OUTPUT, rpio.HIGH);
});

async function main() {
    for (let i = 0; i < LEDs.length; i++) {   // move led(on) from left to right
        rpio.write(LEDs[i], rpio.LOW);
        await Pins.delay(100);
        rpio.write(LEDs[i], rpio.HIGH);
    }
    for (let i = LEDs.length - 1; i > -1; i--) {   // move led(on) from right to left
        rpio.write(LEDs[i], rpio.LOW);
        await Pins.delay(100);
        rpio.write(LEDs[i], rpio.HIGH);
    }

    Promise.resolve().then(() => {
        main();
    });
}
main();