window.superKScanner = {
    html5QrcodeScanner: null,

    iniciarEscaner: function (dotNetHelper) {
        this.detenerEscaner();

        setTimeout(() => {
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
                // Recuadro horizontal en el centro para concentrar el procesamiento en las barras
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                    return {
                        width: Math.floor(viewfinderWidth * 0.85),
                        height: Math.floor(viewfinderHeight * 0.35)
                    };
                },
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true
                }
            };

            this.html5QrcodeScanner = new Html5Qrcode("reader", {
                formatsToSupport: formatsToSupport,
                verbose: false
            });

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