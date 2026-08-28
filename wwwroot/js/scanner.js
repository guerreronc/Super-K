window.superKScanner = {
    isScanning: false,
    lecturasBuffer: [],
    ULTIMO_CODIGO_CONFIRMADO: null,

    iniciarEscaner: function (dotNetHelper) {
        this.detenerEscaner();
        this.lecturasBuffer = [];
        this.ULTIMO_CODIGO_CONFIRMADO = null;

        setTimeout(() => {
            const element = document.getElementById("reader");
            if (!element) return;

            this.isScanning = true;

            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: element,
                    constraints: {
                        facingMode: "environment",
                        width: { ideal: 1920, min: 1280 },  // Forzar Full HD
                        height: { ideal: 1080, min: 720 }
                    }
                },
                locator: {
                    patchSize: "large", // "large" ayuda a encontrar códigos finos en imágenes de alta resolución
                    halfSample: false   // Mantiene el fotograma completo sin recortar resolución
                },
                numOfWorkers: navigator.hardwareConcurrency ? Math.min(4, navigator.hardwareConcurrency) : 2,
                decoder: {
                    // Nos enfocamos en los formatos comerciales reales para reducir falsos positivos
                    readers: [
                        "ean_reader",     // EAN-13 (El estándar de súper como el 7501114507919)
                        "upc_reader",     // UPC-A (Productos americanos)
                        "ean_8_reader",   // EAN-8 (Empaques muy pequeños)
                        "upc_e_reader"    // UPC-E
                    ],
                    multiple: false
                },
                locate: true
            }, (err) => {
                if (err) {
                    console.error("Error al inicializar Quagga2:", err);
                    this.isScanning = false;
                    return;
                }
                Quagga.start();
            });

            // Callback con filtro de votos por consenso
            Quagga.onDetected((result) => {
                if (!this.isScanning) return;

                if (result && result.codeResult && result.codeResult.code) {
                    const codigoCandidato = result.codeResult.code.trim();

                    // 1. Descartar lecturas de menos de 7 dígitos (falsos positivos de ruido)
                    if (codigoCandidato.length < 7) return;

                    // 2. Acumular lectura en el buffer de validación
                    this.lecturasBuffer.push(codigoCandidato);

                    // Mantener solo las últimas 4 lecturas
                    if (this.lecturasBuffer.length > 4) {
                        this.lecturasBuffer.shift();
                    }

                    // 3. Validar si los últimos 2 fotogramas leyeron EXACTAMENTE lo mismo
                    if (this.lecturasBuffer.length >= 2) {
                        const ultimasDos = this.lecturasBuffer.slice(-2);
                        const esConsistente = ultimasDos.every(val => val === ultimasDos[0]);

                        if (esConsistente && this.ULTIMO_CODIGO_CONFIRMADO !== ultimasDos[0]) {
                            this.ULTIMO_CODIGO_CONFIRMADO = ultimasDos[0];
                            this.isScanning = false;

                            this.reproducirBeep();
                            this.detenerEscaner();

                            if (dotNetHelper) {
                                dotNetHelper.invokeMethodAsync('OnCodigoEscaneado', this.ULTIMO_CODIGO_CONFIRMADO);
                            }
                        }
                    }
                }
            });

        }, 300);
    },

    detenerEscaner: function () {
        this.isScanning = false;
        this.lecturasBuffer = [];
        try {
            Quagga.offDetected();
            Quagga.stop();
        } catch (e) {}
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