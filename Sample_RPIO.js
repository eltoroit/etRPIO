// If running a newer Raspbian release, you will need to add the following line to /boot/config.txt and reboot
// dtoverlay=gpio-no-irq

const rpio = require('rpio');
const { performance } = require('perf_hooks');
const { Pins } = require('./pins');

const pinLED = Pins.WPi_2_Physical(0);
const pinButton = Pins.WPi_2_Physical(1);

rpio.init({
	mapping: 'physical',    /* Use the P1-P40 numbering scheme */

});
rpio.open(pinLED, rpio.OUTPUT, rpio.LOW);
rpio.open(pinButton, rpio.INPUT, rpio.PULL_UP);
console.log(`Pin ${pinButton} is currently ${rpio.read(pinButton) ? 'high' : 'low'}`);

// Blink 5 times to indicate the application is alive :-)
async function blink() {
	let stateLED = rpio.LOW;
	for (var i = 0; i < 5; i++) {
		/* On for 1 second */
		stateLED = Pins.FlipState(stateLED);
		rpio.write(pinLED, stateLED);
		console.log(`${new Date().toJSON()} - BEEP ${stateLED}`);
		await Pins.delay(1000);

		/* Off for half a second (500ms) */
		stateLED = Pins.FlipState(stateLED);
		rpio.write(pinLED, stateLED);
		console.log(`${new Date().toJSON()} - BEEP ${stateLED}`);
		await Pins.delay(500);
	}
	rpio.write(pinLED, rpio.LOW);
}

// Now use the button to make a "table lamp"
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

async function main() {
	await blink();
	tableLamp();
}
main();
