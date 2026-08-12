window.superKScanner = {
    html5QrcodeScanner: null,

    iniciarEscaner: function (dotNetHelper) {
        this.detenerEscaner();

        setTimeout(() => {
            // Configuración optimizada para Códigos de Barras de Supermercado
            const config = {
                fps: 15,
                qrbox: { width: 280, height: 160 },
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                    Html5QrcodeSupportedFormats.CODE_128
                ]
            };

            this.html5QrcodeScanner = new Html5Qrcode("reader");

            // Intenta conectar la cámara
            Html5Qrcode.getCameras().then(devices => {
                if (devices && devices.length > 0) {
                    // Si estamos en laptop usa la primera cámara, si es cel usa la trasera
                    const cameraId = devices.length > 1 ? devices[devices.length - 1].id : devices[0].id;

                    this.html5QrcodeScanner.start(
                        cameraId,
                        config,
                        (decodedText) => {
                            this.reproducirBeep();
                            dotNetHelper.invokeMethodAsync('OnCodigoEscaneado', decodedText);
                        },
                        (errorMessage) => {
                            // Ignorar frames sin código
                        }
                    ).catch(err => console.error("Error al iniciar cámara:", err));
                }
            }).catch(err => console.error("Error al listar cámaras:", err));

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