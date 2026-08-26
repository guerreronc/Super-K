window.superKScanner = {
  html5QrCode: null,

  iniciarEscaner: async function (dotNetHelper) {
    // Pequeña pausa para asegurar que Blazor haya renderizado el <div id="reader"> en el modal
    await new Promise(resolve => setTimeout(resolve, 200));

    const element = document.getElementById("reader");
    if (!element) {
      console.error("El contenedor <div id='reader'> no existe en el DOM.");
      return;
    }

    // Detener instancia previa si existe
    if (this.html5QrCode && this.html5QrCode.isScanning) {
      await this.detenerEscaner();
    }

    // Activar soporte explícito para códigos de barras 1D de productos
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
        fps: 30, // Subimos a 30 fotogramas por segundo para capturar más muestras al mover la botella
        experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
        },
        videoConstraints: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            advanced: [{ focusMode: "continuous" }] // Fuerza el enfoque automático continuo en dispositivos compatibles
        }
        };

      await this.html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          console.log("Código detectado:", decodedText);
          if (dotNetHelper) {
            dotNetHelper.invokeMethodAsync("OnCodigoEscaneado", decodedText);
          }
        },
        (errorMessage) => {
          // Captura continua de fotogramas sin lectura
        }
      );
    } catch (err) {
      console.error("Error iniciando la cámara:", err);
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