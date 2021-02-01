const Gpio = require('pigpio').Gpio;
const { Pins } = require('./pins');

const pinLED = Pins.WPi_2_BCM(1);
// const pinButton = Pins.WPi_2_BCM(2);

const LED = new Gpio(pinLED, { mode: Gpio.OUTPUT });
// rpio.open(pinButton, rpio.INPUT, rpio.PULL_UP);

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

// // Now use the button to make a "table lamp"
// function tableLamp() {
// 	let stateLED = rpio.LOW;
// 	let before = performance.now();
// 	const captureTime = 500; // How long must the button be kept down? (milliseconds)

// 	rpio.poll(pinButton, (pin) => {
// 		let now = performance.now();
// 		if (now - before < captureTime) {
// 			// Detected the button down multiple times, probably because of noise in the button
// 		} else {
// 			stateLED = Pins.FlipState_RPIO(stateLED);
// 			rpio.write(pinLED, stateLED);
// 		}
// 		before = now;
// 	}, rpio.POLL_LOW)
// }

async function main() {
    await blink();
    // tableLamp();
}
main();