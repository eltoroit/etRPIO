const rpio = require('rpio');
const { Pins } = require('./pins');

const pinLED = Pins.WPi_2_Physical(0);

console.log("Program is starting...");
rpio.open(pinLED, rpio.OUTPUT, rpio.LOW);

let stateLED = rpio.LOW;
async function blink() {
	/* ON for 1 second */
	stateLED = Pins.FlipState(stateLED);
	rpio.write(pinLED, stateLED);
	await Pins.delay(1000);

	/* OFF for half a second (500ms) */
	stateLED = Pins.FlipState(stateLED);
	rpio.write(pinLED, stateLED);
	await Pins.delay(500);

	Promise.resolve().then(() => {
		blink();
	});
}
blink();