const Gpio = require('pigpio').Gpio;
const { Pins } = require('./pins');

let pinRED = Pins.BCM_2_BCM(17);
let pinGREEN = Pins.BCM_2_BCM(18);
let pinBLUE = Pins.BCM_2_BCM(27);
const ledRED = new Gpio(pinRED, { mode: Gpio.OUTPUT }); ledRED.digitalWrite(Pins.PIGPIO.LOW);
const ledGREEN = new Gpio(pinGREEN, { mode: Gpio.OUTPUT }); ledGREEN.digitalWrite(Pins.PIGPIO.LOW);
const ledBLUE = new Gpio(pinBLUE, { mode: Gpio.OUTPUT }); ledBLUE.digitalWrite(Pins.PIGPIO.LOW);

// let dutyCycle = 0;
// setInterval(() => {
//     ledRED.pwmWrite(Math.floor(Math.random() * 128));
//     ledGREEN.pwmWrite(Math.floor(Math.random() * 128));
//     ledBLUE.pwmWrite(Math.floor(Math.random() * 128));
// }, 100);