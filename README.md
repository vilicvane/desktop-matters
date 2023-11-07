[![NPM version](https://img.shields.io/npm/v/desktop-matters?color=%23cb3837&style=flat-square)](https://www.npmjs.com/package/desktop-matters)
[![Repository package.json version](https://img.shields.io/github/package-json/v/vilic/desktop-matters?color=%230969da&label=repo&style=flat-square)](./package.json)
[![MIT License](https://img.shields.io/badge/license-MIT-999999?style=flat-square)](./LICENSE)
[![Discord](https://img.shields.io/badge/chat-discord-5662f6?style=flat-square)](https://discord.gg/vanVrDwSkS)

# desktop-matters

Add your desktop computer as Matter devices.

https://github.com/vilic/desktop-matters/assets/970430/ddc091ea-9b16-49d8-b7e3-498de8ace73c

## Platforms

Currently Windows-only.

## Features

- Add desktop screen as an `ON_OFF_LIGHT` device to lock (turn off).

## Installation

```bash
npm install --global desktop-matters
```

## Usage

Start the device and pair:

```bash
desktop-matters
```

Reset the device (currently required before re-pairing):

```bash
desktop-matters --reset
```

Enable/disable startup:

```bash
desktop-matters --startup
desktop-matters --disable-startup
```

## License

MIT License.
