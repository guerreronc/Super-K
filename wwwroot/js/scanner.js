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

      // Forzar la cámara trasera especificando 'environment' directamente
      await this.html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (dotNetHelper) {
            dotNetHelper.invokeMethodAsync("OnCodigoEscaneado", decodedText);
          }
        },
        (errorMessage) => {}
      );
    } catch (err) {
      console.error("Error al iniciar cámara trasera:", err);
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