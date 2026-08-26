window.superKScanner = {
  html5QrCode: null,

  iniciarEscaner: async function (dotNetHelper) {
    await new Promise(resolve => setTimeout(resolve, 200));

    const element = document.getElementById("reader");
    if (!element) return;

    if (this.html5QrCode && this.html5QrCode.isScanning) {
      await this.detenerEscaner();
    }

    const formatsToSupport = [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E
    ];

    try {
      this.html5QrCode = new Html5Qrcode("reader", {
        formatsToSupport: formatsToSupport,
        verbose: false
      });

      // 1. Obtener lista de cámaras físicas detectadas en el dispositivo
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        console.error("No se encontraron cámaras disponibles.");
        return;
      }

      // 2. Filtrar por nombre ("back", "rear", "trasera") o tomar la última de la lista (casi siempre trasera en iOS)
      let cameraId = devices[0].id;
      const backCamera = devices.find(device => 
        /back|rear|trasera|environment/i.test(device.label)
      );

      if (backCamera) {
        cameraId = backCamera.id;
      } else if (devices.length > 1) {
        // En iPhones, la cámara trasera suele ser la última del arreglo
        cameraId = devices[devices.length - 1].id;
      }

      const config = {
        fps: 30,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        videoConstraints: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      // 3. Iniciar pasando el ID físico exacto
      await this.html5QrCode.start(
        cameraId,
        config,
        (decodedText) => {
          if (dotNetHelper) {
            dotNetHelper.invokeMethodAsync("OnCodigoEscaneado", decodedText);
          }
        },
        (errorMessage) => {}
      );
    } catch (err) {
      console.error("Error al iniciar cámara:", err);
    }
  },

  detenerEscaner: async function () {
    if (this.html5QrCode) {
      try {
        if (this.html5QrCode.isScanning) {
          await this.html5QrCode.stop();
        }
        this.html5QrCode.clear();
      } catch (err) {
        console.error("Error deteniendo el escáner:", err);
      }
    }
  }
};