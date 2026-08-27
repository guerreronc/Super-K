window.superKScanner = {
    html5QrcodeScanner: null,
    isTransitioning: false,

    iniciarEscaner: async function (dotNetHelper) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        await this.detenerEscanerInterno();

        setTimeout(async () => {
            const element = document.getElementById("reader");
            if (!element) {
                this.isTransitioning = false;
                return;
            }

            const formatsToSupport = [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128
            ];

            const config = {
                fps: 20,
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true
                }
            };

            const onScanSuccess = (decodedText) => {
                this.reproducirBeep();
                if (dotNetHelper) {
                    dotNetHelper.invokeMethodAsync('OnCodigoEscaneado', decodedText);
                }
            };

            try {
                // Intento 1: Modo celular con cámara trasera y resolución ideal
                this.html5QrcodeScanner = new Html5Qrcode("reader", { formatsToSupport: formatsToSupport, verbose: false });
                
                await this.html5QrcodeScanner.start(
                    { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
                    config,
                    onScanSuccess,
                    () => {}
                );
                await this.aplicarZoomOpcional();
            } catch (err) {
                // Si falla (como en la PC), destruimos la instancia atascada antes de reintentar
                await this.detenerEscanerInterno();

                try {
                    const devices = await Html5Qrcode.getCameras();
                    if (devices && devices.length > 0) {
                        // Seleccionar la última cámara si hay varias (trasera), o la primera (webcam PC)
                        const cameraId = devices.length > 1 ? devices[devices.length - 1].id : devices[0].id;
                        
                        // Creamos una instancia nueva y limpia
                        this.html5QrcodeScanner = new Html5Qrcode("reader", { formatsToSupport: formatsToSupport, verbose: false });
                        await this.html5QrcodeScanner.start(cameraId, config, onScanSuccess, () => {});
                        await this.aplicarZoomOpcional();
                    }
                } catch (fallbackErr) {
                    console.error("Error al iniciar cámara de respaldo:", fallbackErr);
                }
            } finally {
                this.isTransitioning = false;
            }
        }, 300);
    },

    aplicarZoomOpcional: async function () {
        try {
            if (!this.html5QrcodeScanner) return;
            const track = this.html5QrcodeScanner.getRunningTrack();
            if (track && track.getCapabilities) {
                const capabilities = track.getCapabilities();
                if (capabilities.zoom) {
                    const zoomTarget = Math.min(capabilities.zoom.max, 1.8);
                    await track.applyConstraints({ advanced: [{ zoom: zoomTarget }] });
                }
            }
        } catch (zErr) {}
    },

    detenerEscaner: async function () {
        this.isTransitioning = true;
        await this.detenerEscanerInterno();
        this.isTransitioning = false;
    },

    detenerEscanerInterno: async function () {
        if (this.html5QrcodeScanner) {
            try {
                const state = this.html5QrcodeScanner.getState();
                if (state === 2 || state === 3) {
                    await this.html5QrcodeScanner.stop();
                }
            } catch (err) {
                console.warn("Aviso al detener escáner:", err);
            } finally {
                try {
                    this.html5QrcodeScanner.clear();
                } catch (e) {}
                this.html5QrcodeScanner = null;
            }
        }
    },

    reproducirBeep: function () {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) {}
    }
};