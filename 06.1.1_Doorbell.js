const { Pins } = require('./pins');
const Gpio = require('pigpio').Gpio;
const { performance } = require('perf_hooks');

const pinBuzzer = Pins.WPi_2_BCM(0);
const pinButton = Pins.WPi_2_BCM(1);

const buzzer = new Gpio(pinBuzzer, { mode: Gpio.OUTPUT });
const button = new Gpio(pinButton, { mode: Gpio.INPUT, pullUpDown: Gpio.PUD_UP, alert: true });

// Blink 5 times to indicate the application is alive :-)
async function blink() {
    let stateBuzzer = Pins.PIGPIO.HIGH;
    for (var i = 0; i < 5; i++) {
        /* On for 0.1 second */
        stateBuzzer = Pins.FlipState_PIGPIO(stateBuzzer);
        buzzer.digitalWrite(stateBuzzer);
        console.log(`${new Date().toJSON()} - BEEP ${stateBuzzer}`);
        await Pins.delay(100);

        /* Off for half a second (500ms) */
        stateBuzzer = Pins.FlipState_PIGPIO(stateBuzzer);
        buzzer.digitalWrite(stateBuzzer);
        console.log(`${new Date().toJSON()} - BEEP ${stateBuzzer}`);
        await Pins.delay(500);
    }
    buzzer.digitalWrite(Pins.PIGPIO.LOW);
}

// Now use the button to make a "table lamp"
function tableLamp() {
    let stateBuzzer = Pins.PIGPIO.LOW;
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
                stateBuzzer = Pins.FlipState_PIGPIO(stateBuzzer);
                buzzer.digitalWrite(stateBuzzer);
                console.log(`${new Date().toJSON()} - Lamp ${stateBuzzer}`);
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