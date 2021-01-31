
const rpio = require('rpio');
const { Pins } = require('./pins');

const pinLED = Pins.WPi_2_Physical(0);
const pinButton = Pins.WPi_2_Physical(1);

console.log("Program is starting...\n");

rpio.open(pinLED, rpio.OUTPUT, rpio.LOW);
rpio.open(pinButton, rpio.INPUT, rpio.PULL_UP);
rpio.poll(pinButton, (pin) => {
	rpio.write(pinLED, Pins.FlipState(rpio.read(pinButton)));
}, rpio.POLL_BOTH)
