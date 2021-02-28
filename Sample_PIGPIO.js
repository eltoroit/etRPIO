const { Pins } = require('./pins');
const Gpio = require('pigpio').Gpio;
const { performance } = require('perf_hooks');

const pinLED = Pins.WPi_2_BCM(1);
const pinButton = Pins.WPi_2_BCM(2);

const LED = new Gpio(pinLED, { mode: Gpio.OUTPUT });
const button = new Gpio(pinButton, { mode: Gpio.INPUT, pullUpDown: Gpio.PUD_UP, alert: true });

// Blink 5 times to indicate the application is alive :-)
async function blink() {
    let stateLED = Pins.PIGPIO.HIGH;
    for (var i = 0; i < 5; i++) {
        /* On for 1 second */
        stateLED = Pins.FlipState_PIGPIO(stateLED);
        LED.digitalWrite(stateLED);
        console.log(`${new Date().toJSON()} - BEEP ${stateLED}`);
        await Pins.delay(1000);

        /* Off for half a second (500ms) */
        stateLED = Pins.FlipState_PIGPIO(stateLED);
        LED.digitalWrite(stateLED);
        console.log(`${new Date().toJSON()} - BEEP ${stateLED}`);
        await Pins.delay(500);
    }
    LED.digitalWrite(Pins.PIGPIO.LOW);
}

// Now use the button to make a "table lamp"
function tableLamp() {
    let stateLED = Pins.PIGPIO.LOW;
    let before = performance.now();
    const captureTime = 500; // How long must the button be kept down? (milliseconds)
    button.glitchFilter(10000);

    button.on('alert', (level, tick) => {
        if (level === 1) {
            // Ignore button ups
        } else {
            let now = performance.now();
            if (now - before < captureTime) {
                // Detected the button down multiple times, probably because of noise in the button
            } else {
                stateLED = Pins.FlipState_PIGPIO(stateLED);
                LED.digitalWrite(stateLED);
                console.log(`${new Date().toJSON()} - Lamp ${stateLED}`);
            }
            before = now;
        }
    });
}

async function main() {
    await blink();
    tableLamp();
}
debugger;
main();