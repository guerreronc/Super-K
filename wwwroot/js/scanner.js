window.superKScanner = {
    html5QrcodeScanner: null,

    iniciarEscaner: function (dotNetHelper) {
        this.detenerEscaner();

        setTimeout(async () => {
            const element = document.getElementById("reader");
            if (!element) return;

            const formatsToSupport = [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128
            ];

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

            this.html5QrcodeScanner = new Html5Qrcode("reader", {
                formatsToSupport: formatsToSupport,
                verbose: false
            });

            const ejecutarCamara = (camConfig) => {
                return this.html5QrcodeScanner.start(
                    camConfig,
                    config,
                    (decodedText) => {
                        this.reproducirBeep();
                        if (dotNetHelper) {
                            dotNetHelper.invokeMethodAsync('OnCodigoEscaneado', decodedText);
                        }
                    },
                    (errorMessage) => {}
                );
            };

            // Intento 1: Obligar a iOS Safari a usar la cámara trasera exacta
            try {
                await ejecutarCamara({ facingMode: { exact: "environment" } });
            } catch (err1) {
                // Intento 2: Si falla exact (ej. en laptops sin cámara trasera), intenta trasera preferente
                try {
                    await ejecutarCamara({ facingMode: "environment" });
                } catch (err2) {
                    // Intento 3: Seleccionar el último dispositivo detectado
                    try {
                        const devices = await Html5Qrcode.getCameras();
                        if (devices && devices.length > 0) {
                            const cameraId = devices.length > 1 ? devices[devices.length - 1].id : devices[0].id;
                            await ejecutarCamara(cameraId);
                        }
                    } catch (err3) {
                        console.error("No se pudo acceder a ninguna cámara:", err3);
                    }
                }
            }

        }, 300);
    },

    detenerEscaner: function () {
        if (this.html5QrcodeScanner) {
            this.html5QrcodeScanner.stop().then(() => {
                this.html5QrcodeScanner.clear();
                this.html5QrcodeScanner = null;
            }).catch(err => {
                this.html5QrcodeScanner = null;
            });
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