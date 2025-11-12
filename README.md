# System Info Extractor

A cross-platform Node.js tool that collects comprehensive system information and generates a QR code for easy data transfer. The tool detects hardware specifications, peripherals, and system configuration, then encodes the data as a base64-encoded JSON in a scannable QR code.

## Features

The tool automatically detects and reports:

- **Computer Name** - Hostname of the machine
- **Serial Number** - Device serial number (if available)
- **Type** - Device type (Desktop, Laptop, Server, etc.)
- **Brand & Model** - Manufacturer and model information
- **Operating System** - Full OS name and version
- **CPU** - Processor brand and model
- **RAM** - Total memory in GB
- **Storage Drive Type** - SSD, HDD, or Hybrid
- **Storage Size** - Total storage capacity in GB
- **Webcam** - Detection of built-in or USB cameras
- **Keyboard** - Detection of USB or Bluetooth keyboards
- **Mouse** - Detection of USB or Bluetooth mice/trackpads
- **Monitors** - List of connected displays (Built-in, HDMI, DisplayPort, etc.)

## Requirements

**For Development:**
- Node.js 16 or higher
- npm or yarn

**For Running Pre-built Binaries:**
- No requirements - binaries are standalone executables

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd script-system-info-extractor
npm install
```

## Usage

### Running with Node.js

```bash
node system-info.cjs
```

The tool will:
1. Collect system information
2. Generate a QR code image in your system's temp directory
3. Automatically open the QR code image
4. Display the file path and data size in the console

### Running Pre-built Binaries

Download the appropriate binary for your platform from the `dist/` directory and run:

**macOS:**
```bash
./system-info-macos-arm64  # Apple Silicon (M1/M2/M3/M4)
./system-info-macos-x64    # Intel Macs
```

**Linux:**
```bash
./system-info-linux-x64    # 64-bit Intel/AMD
./system-info-linux-arm64  # ARM64 (Raspberry Pi 4+, servers)
```

**Windows:**
```cmd
system-info-win-x64.exe    # 64-bit Intel/AMD
system-info-win-arm64.exe  # ARM64 (Surface Pro X, etc.)
```

## Building Binaries

To build standalone executables for all supported platforms:

### Build All Platforms

```bash
npx pkg system-info.cjs --targets node16-macos-arm64,node16-macos-x64,node16-linux-x64,node16-linux-arm64,node16-win-x64,node16-win-arm64 --out-path ./dist
```

### Build Individual Platforms

```bash
# macOS Apple Silicon
npx pkg system-info.cjs -t node16-macos-arm64 -o dist/system-info-macos-arm64

# macOS Intel
npx pkg system-info.cjs -t node16-macos-x64 -o dist/system-info-macos-x64

# Linux 64-bit
npx pkg system-info.cjs -t node16-linux-x64 -o dist/system-info-linux-x64

# Linux ARM64
npx pkg system-info.cjs -t node16-linux-arm64 -o dist/system-info-linux-arm64

# Windows 64-bit
npx pkg system-info.cjs -t node16-win-x64 -o dist/system-info-win-x64.exe

# Windows ARM64
npx pkg system-info.cjs -t node16-win-arm64 -o dist/system-info-win-arm64.exe
```

### Build Configuration

The build targets are configured in [package.json](package.json):

```json
"pkg": {
  "targets": [
    "node16-macos-arm64",
    "node16-macos-x64",
    "node16-linux-x64",
    "node16-linux-arm64",
    "node16-win-x64",
    "node16-win-arm64"
  ],
  "outputPath": "dist"
}
```

### Why Node 16?

The `pkg` tool (v5.8.1) supports up to Node.js 16. Node 18+ versions are not yet supported by this version of `pkg`.

### Note on Bytecode Warnings

You may see warnings about failed bytecode compilation for native modules:
```
Warning Failed to make bytecode node16-arm64 for file .../brotli/build/encode.js
```

These warnings are normal and do not affect the functionality of the executables.

## Output

The tool generates:
- A PNG image containing a QR code
- Saved to system temp directory with filename: `system-info-qr-{timestamp}.png`
- Data format: Base64-encoded JSON
- The QR code is automatically opened with your default image viewer

Console output example:
```
Original JSON size: 523 bytes
After base64 encoding: 698 bytes
QR code generated in temp directory: /tmp/system-info-qr-1699234567890.png
Opening QR code for scanning...
Note: Data is base64 encoded JSON.
```

## Supported Platforms

| Platform | Architecture | Binary Name |
|----------|-------------|-------------|
| macOS | Apple Silicon (ARM64) | `system-info-macos-arm64` |
| macOS | Intel (x64) | `system-info-macos-x64` |
| Linux | 64-bit (x64) | `system-info-linux-x64` |
| Linux | ARM64 | `system-info-linux-arm64` |
| Windows | 64-bit (x64) | `system-info-win-x64.exe` |
| Windows | ARM64 | `system-info-win-arm64.exe` |

## Dependencies

### Runtime Dependencies
- **[systeminformation](https://www.npmjs.com/package/systeminformation)** - Cross-platform system information library
- **[qrcode](https://www.npmjs.com/package/qrcode)** - QR code generator
- **[pako](https://www.npmjs.com/package/pako)** - Compression library

### Development Dependencies
- **[pkg](https://www.npmjs.com/package/pkg)** - Package Node.js projects into executables

## Technical Details

- **Language:** JavaScript (CommonJS)
- **Entry Point:** `system-info.cjs`
- **Node Version:** 16.x (for pkg compatibility)
- **QR Code Settings:**
  - Error correction level: L (Low)
  - Width: 500px
  - Format: PNG

## Limitations

- Serial number detection may not work on all systems (requires appropriate permissions)
- Peripheral detection (webcam, keyboard, mouse) accuracy varies by platform
- Monitor detection relies on system APIs which may have limited information
- QR codes have size limits - very large system configurations may not encode properly

## License

ISC

## Contributing

Feel free to submit issues or pull requests to improve the tool.
