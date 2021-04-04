const rpio = require('rpio');

const ADS7830_ADDRESS = 0x4b;
const ADS7830_CHANNELS = [0x84, 0xc4, 0x94, 0xd4, 0xa4, 0xe4, 0xb4, 0xf4];

async function readValue(channel) {
    var txbuf = Buffer.from([channel]);
    let rxbuf = Buffer.alloc(1);

    rpio.i2cWrite(txbuf);
    rpio.i2cRead(rxbuf, 1);
    console.log(rxbuf[0]);
}

async function main() {
    rpio.i2cBegin();
    rpio.i2cSetSlaveAddress(ADS7830_ADDRESS);
    rpio.i2cSetBaudRate(100 * 1000); // 100 KHz
    setInterval(async () => {
        await readValue(ADS7830_CHANNELS[0]);
    }, 20);
    // rpio.i2cEnd();
}
main();
