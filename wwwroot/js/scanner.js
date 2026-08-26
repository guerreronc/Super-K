window.superKScanner = {
    html5QrcodeScanner: null,

    iniciarEscaner: function (dotNetHelper) {
        this.detenerEscaner();

        setTimeout(() => {
            const element = document.getElementById("reader");
            if (!element) return;

            // 1. Formatos 1D de supermercado activados
            const formatsToSupport = [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128
            ];

            // 2. Configuración optimizada de fotogramas, motor nativo y resolución HD
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

            // 3. Selección de cámara física trasera
            Html5Qrcode.getCameras().then(devices => {
                if (devices && devices.length > 0) {
                    // Buscar cámara trasera por nombre ('back', 'rear', 'trasera')
                    let backCamera = devices.find(device => 
                        /back|rear|trasera|environment/i.test(device.label)
                    );

                    // Si no la halla por etiqueta, selecciona la última del arreglo (cámara trasera en móviles)
                    let cameraId = backCamera ? backCamera.id : (devices.length > 1 ? devices[devices.length - 1].id : devices[0].id);

                    this.html5QrcodeScanner.start(
                        cameraId,
                        config,
                        (decodedText) => {
                            this.reproducirBeep();
                            if (dotNetHelper) {
                                dotNetHelper.invokeMethodAsync('OnCodigoEscaneado', decodedText);
                            }
                        },
                        (errorMessage) => {
                            // Ignorar fotogramas sin código
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