const rpio = require('rpio');
const { Pins } = require('./pins');
const { performance } = require('perf_hooks');

const pinLED = Pins.WPi_2_Physical(0);
const pinButton = Pins.WPi_2_Physical(1);

console.log("Program is starting...\n");

rpio.init();
rpio.open(pinLED, rpio.OUTPUT, rpio.LOW);
rpio.open(pinButton, rpio.INPUT, rpio.PULL_UP);

function tableLamp() {
	let stateLED = rpio.LOW;
	let before = performance.now();
	const captureTime = 500; // How long must the button be kept down? (milliseconds)

	rpio.poll(pinButton, (pin) => {
		let now = performance.now();
		if (now - before < captureTime) {
			// Detected the button down multiple times, probably because of noise in the button
		} else {
			stateLED = Pins.FlipState(stateLED);
			rpio.write(pinLED, stateLED);
		}
		before = now;
	}, rpio.POLL_LOW)
}
tableLamp();
