// This is the code for exercises 7.1, 8.1, 9.1, 10.1 and 11.1

const rpio = require('rpio'); // I2C
const Gpio = require('pigpio').Gpio; // Softwre PWM
const { Pins } = require('./pins');

let LED = null;
const ADS7830_ADDRESS = 0x4b;
const ADS7830_CHANNELS = [0x84, 0xc4, 0x94, 0xd4, 0xa4, 0xe4, 0xb4, 0xf4];

// LED Brightness
// Our eyes are logarithmic (non-linear)
// https://en.wikipedia.org/wiki/Stevens%27s_power_law
// https://electronics.stackexchange.com/a/443689
const ledBrightness = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 23, 23, 24, 24, 25, 26, 26, 27, 28, 28, 29, 30, 30, 31, 32, 32, 33, 34, 35, 35, 36, 37, 38, 38, 39, 40, 41, 42, 42, 43, 44, 45, 46, 47, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 97, 98, 99, 100, 102, 103, 104, 105, 107, 108, 109, 111, 112, 113, 115, 116, 117, 119, 120, 121, 123, 124, 126, 127, 128, 130, 131, 133, 134, 136, 137, 139, 140, 142, 143, 145, 146, 148, 149, 151, 152, 154, 155, 157, 158, 160, 162, 163, 165, 166, 168, 170, 171, 173, 175, 176, 178, 180, 181, 183, 185, 186, 188, 190, 192, 193, 195, 197, 199, 200, 202, 204, 206, 207, 209, 211, 213, 215, 217, 218, 220, 222, 224, 226, 228, 230, 232, 233, 235, 237, 239, 241, 243, 245, 247, 249, 251, 253, 255];

function etRound(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

async function readValue(channel) {
    var txbuf = Buffer.from([channel]);
    let rxbuf = Buffer.alloc(1);

    rpio.i2cWrite(txbuf);
    rpio.i2cRead(rxbuf, 1);
    return rxbuf[0];
}

let oldLed = -1;
async function changeLED(isReset) {
    let colors = {};
    if (isReset) {
        colors = {
            red: 0,
            green: 0,
            blue: 0
        }
    } else {
        // Clocksiwe increases color...
        // Substract from 255, or invert the wires on the potentiometers... Easier and quicker here ;-)
        colors = {
            red: 255 - await readValue(ADS7830_CHANNELS[0]),
            green: 255 - await readValue(ADS7830_CHANNELS[1]),
            blue: 255 - await readValue(ADS7830_CHANNELS[2])
        }
    }
    await LED.RED.pwmWrite(ledBrightness[colors.red]);
    await LED.GREEN.pwmWrite(ledBrightness[colors.green]);
    await LED.BLUE.pwmWrite(ledBrightness[colors.blue]);
    let newLed = colors.red + colors.green + colors.blue;
    if (Math.abs(oldLed - newLed) > 5) {
        console.log(`${colors.red} | ${colors.green} | ${colors.blue}`);
        oldLed = newLed;
    }
}

let oldPR = -1; // Old Photo-resistor value
async function readPR() {
    let newPR = await readValue(ADS7830_CHANNELS[3]);
    if (oldPR !== newPR) {
        console.log(newPR);
        oldPR = newPR;
    }
}

// Thermistors (thermal resistors) are temperature dependent variable resistors.
// PTC (Positive Temperature Coefficient) and NTC (Negative Temperature Coefficient).
// When the temperature increases, PTC thermistor resistance will increase and NTC thermistor resistance will decrease.
// https://en.wikipedia.org/wiki/Thermistor (B or β parameter equation)
// Rt=R*EXP[B*(1/T2 - 1/T1)]
// For the parameters of the Thermistor, we use : β=3950, Rref=10KΩ, Tref=25°C.
// https://learn.adafruit.com/thermistor?view=all
let oldTemp = -1; // Old Thermistors value
async function readTemp() {
    async function myValues(VCC, VoltageThermistor) {
        // Voltage divider
        // R1 (10KΩ) + R2 (Thermistor)
        // It = I1 = I2 // Because it's in series
        // It = V1/R1 = V2/R2
        // V1*R2 = V2*R1
        // R2 = V2*R1 / V1

        let R1 = 9900; // 10KΩ
        let V2 = VoltageThermistor;
        let V1 = VCC - V2;
        let R2 = V2 * R1 / V1; // Resistance for Thermistor

        // Temperature is Kelvin
        // 1/T = ((1/β) * ln(R2/Rref)) + (1/Tref)
        // 1/T = (ln(R2/Rref)/β) + (1/Tref)
        // T = 1 / ((ln(R2/Rref)/β) + (1/Tref))
        let ZeroC = 273.15; // 0°C = 273.15°K
        let Rref = 10000; // 10KΩ
        let Tref = ZeroC + 25; // Usually 25°C = (273.15 + 25)°K
        let Beta = 3950.0;
        let tempK = 1 / ((Math.log(R2 / Rref) / Beta) + (1 / Tref));
        let tempC = tempK - ZeroC;
        return tempC;
    }
    async function bookValues(VCC, VoltageThermistor) {
        let voltage = VoltageThermistor;
        let Rt = 10 * voltage / (VCC - voltage); // Calculate resistance value of thermistor
        let tempK = 1 / (1 / (273.15 + 25) + Math.log(Rt / 10) / 3950.0); // Calculate temperature (Kelvin)
        tempC = tempK - 273.15 // Calculate temperature (Celsius)
        return tempC;
    }

    let values = {};
    values.ADC = await readValue(ADS7830_CHANNELS[3]); // 0 - 255 values
    let VCC = 3.3; // 3.3 volts
    values.VoltageThermistorA = (values.ADC / 255.0) * VCC; // Value in volts
    values.myTempCa = await myValues(VCC, values.VoltageThermistorA);
    values.bookTempCa = await bookValues(VCC, values.VoltageThermistorA);

    VCC = 2.13; // 3.3 volts
    values.VoltageThermistorB = (values.ADC / 255.0) * VCC; // Value in volts
    values.myTempCb = await myValues(VCC, values.VoltageThermistorB);
    values.bookTempCb = await bookValues(VCC, values.VoltageThermistorB);
    values.diff = values.bookTempCa - values.myTempCa;

    if ((values.diff !== 0) || (Math.abs(oldTemp - values.myTempCa) > 0.5) || (values.myTempCa !== values.myTempCb)) {
        // console.log(JSON.stringify(values));
        let msg = "";
        msg += `Voltage: ${etRound(values.VoltageThermistorA, 2)}/${etRound(values.VoltageThermistorB, 2)} (${values.VoltageThermistorA - values.VoltageThermistorB}) | `;
        msg += `MY: ${etRound(values.myTempCa, 2)}/${etRound(values.myTempCb, 2)} (${values.myTempCa - values.myTempCb}) | `;
        msg += `BOOK: ${etRound(values.bookTempCa, 2)}/${etRound(values.bookTempCb, 2)} (${values.bookTempCa - values.bookTempCb}) | `;
        msg += `DIFF: ${values.diff}`;
        console.log(msg);
        oldTemp = values.myTempC;
    }

    return values.myTempC;
}

async function main() {
    // Intialize LEDs
    let pinRED = Pins.BCM_2_BCM(17);
    let pinGREEN = Pins.BCM_2_BCM(18);
    let pinBLUE = Pins.BCM_2_BCM(27);
    LED = {
        RED: new Gpio(pinRED, { mode: Gpio.OUTPUT }),
        GREEN: new Gpio(pinGREEN, { mode: Gpio.OUTPUT }),
        BLUE: new Gpio(pinBLUE, { mode: Gpio.OUTPUT })
    };
    await changeLED(true);

    // Initialize I2C
    rpio.i2cBegin();
    rpio.i2cSetSlaveAddress(ADS7830_ADDRESS);
    rpio.i2cSetBaudRate(100 * 1000); // 100 KHz

    const loop = async () => {
        // await readPR();
        let tempC = await readTemp();

        // Controlled by the temperature
        await LED.RED.pwmWrite(0);
        await LED.GREEN.pwmWrite(0);
        await LED.BLUE.pwmWrite(0);
        if (tempC > 20) {
            await LED.RED.pwmWrite(255);
        } else if (tempC < 10) {
            await LED.BLUE.pwmWrite(255);
        } else {
            await LED.GREEN.pwmWrite(255);
        }

        // Controlled by the potentiometers
        // await changeLED(false);
    }

    // Loop reading values
    loop();
    setInterval(async () => {
        loop();
    }, 20);
    // rpio.i2cEnd();
}
main();