// Cinematic Procedural Web Audio Soundscape for "THE LAST FLAME"
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isMuted = true;
        this.isInitialized = false;

        // Audio Subsystems
        this.windGain = null;
        this.windFilter = null;
        this.droneGain = null;
        this.droneOsc1 = null;
        this.droneOsc2 = null;
        this.fireGain = null;
        this.dawnGain = null;
        this.dawnOscs = [];
        this.heartbeatInterval = null;
    }

    init() {
        if (this.isInitialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.createBlizzardWind();
            this.createCavernSubDrone();
            this.createEmberCrackle();
            this.createDawnHarmonics();

            this.isInitialized = true;
        } catch (e) {
            console.warn("Web Audio not supported or blocked", e);
        }
    }

    createBlizzardWind() {
        // Multi-pole filtered noise for howling cold mountain wind
        const bufferSize = this.ctx.sampleRate * 4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99 * b0 + white * 0.05;
            b1 = 0.95 * b1 + white * 0.03;
            b2 = 0.90 * b2 + white * 0.01;
            data[i] = (b0 + b1 + b2) * 1.8;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        this.windFilter = this.ctx.createBiquadFilter();
        this.windFilter.type = "lowpass";
        this.windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
        this.windFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

        this.windGain = this.ctx.createGain();
        this.windGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

        source.connect(this.windFilter);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.masterGain);

        source.start();
    }

    createCavernSubDrone() {
        // Deep cinematic sub-bass cosmic resonance (43.65 Hz / F1)
        this.droneOsc1 = this.ctx.createOscillator();
        this.droneOsc1.type = "sawtooth";
        this.droneOsc1.frequency.setValueAtTime(43.65, this.ctx.currentTime);

        this.droneOsc2 = this.ctx.createOscillator();
        this.droneOsc2.type = "sine";
        this.droneOsc2.frequency.setValueAtTime(87.30, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(110, this.ctx.currentTime);
        filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

        this.droneOsc1.connect(filter);
        this.droneOsc2.connect(filter);
        filter.connect(this.droneGain);
        this.droneGain.connect(this.masterGain);

        this.droneOsc1.start();
        this.droneOsc2.start();
    }

    createEmberCrackle() {
        // Subtle organic crackle of living embers
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() > 0.985 ? (Math.random() * 2 - 1) * 0.8 : 0;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

        this.fireGain = this.ctx.createGain();
        this.fireGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        source.connect(filter);
        filter.connect(this.fireGain);
        this.fireGain.connect(this.masterGain);

        source.start();
    }

    createDawnHarmonics() {
        // Grand ethereal golden dawn chord (D Maj9: D3, A3, C#4, E4, F#4, A4)
        this.dawnGain = this.ctx.createGain();
        this.dawnGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
        this.dawnGain.connect(this.masterGain);

        const freqs = [146.83, 220.00, 277.18, 329.63, 369.99, 440.00];
        freqs.forEach((f) => {
            const osc = this.ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(f, this.ctx.currentTime);

            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0.06, this.ctx.currentTime);

            osc.connect(g);
            g.connect(this.dawnGain);
            osc.start();
            this.dawnOscs.push(osc);
        });
    }

    toggleMute() {
        if (!this.isInitialized) {
            this.init();
        }

        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }

        this.isMuted = !this.isMuted;

        if (this.masterGain && this.ctx) {
            const now = this.ctx.currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            if (this.isMuted) {
                this.masterGain.gain.setTargetAtTime(0, now, 0.4);
            } else {
                this.masterGain.gain.setTargetAtTime(0.7, now, 0.8);
            }
        }

        return !this.isMuted;
    }

    updateSceneAudio(progress) {
        if (!this.isInitialized || !this.ctx) return;
        const now = this.ctx.currentTime;

        // 1. Wind intensity: high in prologue & valley, quieter in cavern, explosive at flight
        if (this.windGain && this.windFilter) {
            let windVol = 0.25;
            let windCutoff = 320;

            if (progress < 0.35) {
                windVol = 0.28;
                windCutoff = 380;
            } else if (progress < 0.75) {
                windVol = 0.08; // sheltered inside cavern
                windCutoff = 180;
            } else {
                // Rushing wind during flight & sunrise
                windVol = 0.15 + (progress - 0.75) * 0.6;
                windCutoff = 400 + (progress - 0.75) * 1200;
            }

            this.windGain.gain.setTargetAtTime(windVol, now, 0.2);
            this.windFilter.frequency.setTargetAtTime(windCutoff, now, 0.2);
        }

        // 2. Cavern drone: peaks in chapters 3 - 6
        if (this.droneGain) {
            let droneVol = 0.08;
            if (progress >= 0.35 && progress < 0.82) {
                const t = Math.sin(((progress - 0.35) / 0.47) * Math.PI);
                droneVol = 0.12 + t * 0.35;
            }
            this.droneGain.gain.setTargetAtTime(droneVol, now, 0.2);
        }

        // 3. Fire crackle: begins in cavern and swells during awakening
        if (this.fireGain) {
            let fireVol = 0.0;
            if (progress >= 0.45 && progress < 0.90) {
                fireVol = 0.04 + (progress - 0.45) * 0.25;
            }
            this.fireGain.gain.setTargetAtTime(fireVol, now, 0.2);
        }

        // 4. Golden Dawn Choir: swells majestically during flight and sunrise
        if (this.dawnGain) {
            let dawnVol = 0.0;
            if (progress >= 0.85) {
                const t = (progress - 0.85) / 0.15;
                dawnVol = Math.pow(t, 0.8) * 0.55;
            }
            this.dawnGain.gain.setTargetAtTime(dawnVol, now, 0.2);
        }
    }
}

export const soundEngine = new SoundEngine();
