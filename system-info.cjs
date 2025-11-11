const os = require("os");
const si = require("systeminformation");
const QRCode = require("qrcode");
const path = require("path");
const { encode } = require("@msgpack/msgpack");
const brotli = require("brotli");
const { exec } = require("child_process");

function determineStorageDriveType(diskLayout) {
  if (!diskLayout || diskLayout.length === 0) {
    return "Unknown";
  }

  const types = diskLayout.map(disk => disk.type.toUpperCase());
  const hasSSD = types.some(type => type.includes("SSD") || type.includes("NVME"));
  const hasHDD = types.some(type => type.includes("HDD") || type.includes("HD") && !type.includes("SSD"));

  if (hasSSD && hasHDD) {
    return "Hybrid";
  } else if (hasSSD) {
    return "SSD";
  } else if (hasHDD) {
    return "HDD";
  } else {
    return "Unknown";
  }
}

function calculateTotalStorageGB(diskLayout) {
  if (!diskLayout || diskLayout.length === 0) {
    return 0;
  }
  const totalBytes = diskLayout.reduce((sum, disk) => sum + (disk.size || 0), 0);
  return `${Math.round(totalBytes / (1024 ** 3))}GB`; // Convert bytes to GB
}

function detectWebcam(usbDevices) {
  if (!usbDevices || usbDevices.length === 0) {
    return "No";
  }
  const hasCamera = usbDevices.some(device =>
    device.type === "Camera" ||
    (device.name && device.name.toLowerCase().includes("camera")) ||
    (device.name && device.name.toLowerCase().includes("webcam"))
  );
  return hasCamera ? "Yes" : "No";
}

function detectKeyboard(usbDevices, bluetoothDevices) {
  if (usbDevices && usbDevices.some(device => device.type === "Keyboard")) {
    return "Yes";
  }
  if (bluetoothDevices && bluetoothDevices.some(device =>
    device.type === "Keyboard" && device.connected
  )) {
    return "Yes";
  }
  return "No";
}

function detectMouse(usbDevices, bluetoothDevices) {
  if (usbDevices && usbDevices.some(device => device.type === "Mouse")) {
    return "Yes";
  }
  if (bluetoothDevices && bluetoothDevices.some(device =>
    (device.type === "Mouse" || device.type === "Trackpad") && device.connected
  )) {
    return "Yes";
  }
  return "No";
}

async function getAllInfo() {
  const [systemInfo, chassisInfo, osInfo, cpu, mem, diskLayout, usbDevices, bluetoothDevices] = await Promise.all([
    si.system(),
    si.chassis(),
    si.osInfo(),
    si.cpu(),
    si.mem(),
    si.diskLayout(),
    si.usb(),
    si.bluetoothDevices()
  ]);

  return {
    ComputerName: os.hostname(),
    SerialNo: systemInfo.serial || "Not available",
    Type: chassisInfo.type || "Unknown",
    Brand: systemInfo.manufacturer || "Unknown",
    Model: systemInfo.model || "Unknown",
    OperatingSystem: `${osInfo.distro} ${osInfo.release}`,
    CPU: cpu.brand || "Unknown",
    RAM: `${Math.round(mem.total / (1024 ** 3))}GB`, // Convert bytes to GB
    StorageDrive: determineStorageDriveType(diskLayout),
    StorageSize: calculateTotalStorageGB(diskLayout),
    Webcam: detectWebcam(usbDevices),
    Keyboard: detectKeyboard(usbDevices, bluetoothDevices),
    Mouse: detectMouse(usbDevices, bluetoothDevices)
  };
}

getAllInfo()
  .then(async info => {
    const jsonData = JSON.stringify(info);
    // Generate unique temporary filename
    const tempPath = path.join(os.tmpdir(), `system-info-qr-${Date.now()}.png`);

    try {
      // Step 1: Encode data with MessagePack (binary format, more compact than JSON)
      const msgpackData = encode(info);

      // Step 2: Compress with Brotli (better compression than gzip)
      const compressed = Buffer.from(brotli.compress(msgpackData, {
        mode: 0, // generic mode
        quality: 11, // maximum compression (0-11)
      }));

      // Step 3: Encode to base64 for QR code compatibility
      const base64Data = compressed.toString('base64');

      console.log(`Original JSON size: ${jsonData.length} bytes`);
      console.log(`MessagePack size: ${msgpackData.length} bytes (${((1 - msgpackData.length / jsonData.length) * 100).toFixed(1)}% reduction)`);
      console.log(`After Brotli compression: ${compressed.length} bytes`);
      console.log(`After base64 encoding: ${base64Data.length} bytes`);
      console.log(`Total size reduction vs original: ${((1 - base64Data.length / jsonData.length) * 100).toFixed(1)}%`);

      await QRCode.toFile(tempPath, base64Data, {
        errorCorrectionLevel: 'L',
        type: 'png',
        width: 500
      });

      console.log(`QR code generated in temp directory: ${tempPath}`);
      console.log('Opening QR code for scanning...');
      console.log('Note: Data is base64 encoded, Brotli compressed, and MessagePack encoded.');

      // Determine the command based on the operating system
      let openCommand;
      const platform = os.platform();

      switch (platform) {
        case 'darwin':  // macOS
          openCommand = `open "${tempPath}"`;
          break;
        case 'win32':   // Windows
          openCommand = `start "" "${tempPath}"`;
          break;
        case 'linux':   // Linux
          openCommand = `xdg-open "${tempPath}"`;
          break;
        default:
          console.error(`Unsupported platform: ${platform}`);
          console.log(`Please manually open: ${tempPath}`);
          return;
      }

      // Open the image file with default application
      exec(openCommand, (error) => {
        if (error) {
          console.error('Failed to open image:', error.message);
          console.log(`Please manually open: ${tempPath}`);
        }
      });
    } catch (qrError) {
      console.error("Failed to generate QR code:", qrError.message);
      console.error("Data might still be too large for QR code. Consider reducing the information collected.");
    }
  })
  .catch(err => console.error("Failed to collect system information:", err));
