window.superKScanner = {
    html5QrcodeScanner: null,

    iniciarEscaner: function (dotNetHelper) {
        this.detenerEscaner();

        setTimeout(() => {
            // Formatos de códigos de barras de supermercado
            const formats = [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39
            ];

            const config = {
                fps: 15,
                qrbox: { width: 280, height: 160 },
                formatsToSupport: formats,
                experimentalFeatures: {
                    // Activa el lector nativo por Hardware de iOS Safari (Lectura instantánea)
                    useBarCodeDetectorIfSupported: true 
                }
            };

            this.html5QrcodeScanner = new Html5Qrcode("reader");

            // En lugar de pasar un ID rígido, forzamos la cámara trasera principal con autoenfoque
            const cameraConfig = { facingMode: "environment" };

            this.html5QrcodeScanner.start(
                cameraConfig,
                config,
                (decodedText) => {
                    this.reproducirBeep();
                    dotNetHelper.invokeMethodAsync('OnCodigoEscaneado', decodedText);
                },
                (errorMessage) => {
                    // Ignorar cuadros sin código
                }
            ).catch(err => {
                console.error("Error al iniciar cámara trasera:", err);
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
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            
            // Reanudar contexto de audio por restricciones de iOS
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(1800, ctx.currentTime); // Tono agudo de caja registradora
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.12);
        } catch (e) {
            console.warn("Audio bloqueado:", e);
        }
    }
};