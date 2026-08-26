window.superKScanner = {
    html5QrcodeScanner: null,

    iniciarEscaner: function (dotNetHelper) {
        this.detenerEscaner();

        setTimeout(() => {
            const element = document.getElementById("reader");
            if (!element) return;

            // Formatos de supermercado (1D)
            const formatsToSupport = [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128
            ];

            // Configuración limpia sin videoConstraints que rompan la selección de cámara en Safari
            const config = {
                fps: 30,
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true
                }
            };

            this.html5QrcodeScanner = new Html5Qrcode("reader", {
                formatsToSupport: formatsToSupport,
                verbose: false
            });

            // Método 1: Intentar solicitar la cámara trasera directa en iOS/Android
            this.html5QrcodeScanner.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    this.reproducirBeep();
                    if (dotNetHelper) {
                        dotNetHelper.invokeMethodAsync('OnCodigoEscaneado', decodedText);
                    }
                },
                (errorMessage) => {}
            ).catch(err => {
                console.warn("Fallo facingMode directo, intentando por lista de hardware:", err);
                // Método 2: Fallback por ID de hardware (el que nos funcionaba antes)
                Html5Qrcode.getCameras().then(devices => {
                    if (devices && devices.length > 0) {
                        const cameraId = devices.length > 1 ? devices[devices.length - 1].id : devices[0].id;
                        this.html5QrcodeScanner.start(
                            cameraId,
                            config,
                            (decodedText) => {
                                this.reproducirBeep();
                                if (dotNetHelper) {
                                    dotNetHelper.invokeMethodAsync('OnCodigoEscaneado', decodedText);
                                }
                            },
                            (errorMessage) => {}
                        );
                    }
                });
            });

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