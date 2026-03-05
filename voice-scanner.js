// Voice Scanner JavaScript
class VoiceScanner {
    constructor() {
        this.recognition = null;
        this.retryCount = 0;
        this.maxRetries = 2;
        this.retryDelay = 700; // ms
        this.isListening = false;
        this.initElements();
        this.initSpeechRecognition();
        this.attachEventListeners();
    }

    initElements() {
        this.voiceButton = document.getElementById('voiceButton');
        this.status = document.getElementById('status');
        this.transcript = document.getElementById('transcript');
        this.response = document.getElementById('response');
        this.error = document.getElementById('error');
        this.webhookUrl = document.getElementById('webhookUrl');
    }

    initSpeechRecognition() {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            this.showError(
                'Speech recognition is not supported. Use Chrome or Edge.'
            );
            this.voiceButton.disabled = true;
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.voiceButton.classList.add('listening');
            this.status.textContent = 'Listening... Speak now';
            this.hideMessages();
        };

        this.recognition.onresult = (event) => {
            const voiceText = event.results[0][0].transcript;
            this.retryCount = 0;
            this.transcript.textContent = voiceText;
            this.status.textContent = 'Processing...';
            this.sendToWorkflow(voiceText);
        };

        this.recognition.onerror = (event) => {
            const err = event.error;

            if (err === 'no-speech') {
                this.retryCount += 1;
                if (this.retryCount <= this.maxRetries) {
                    this.status.textContent = `No speech detected — retrying (${this.retryCount}/${this.maxRetries})`;
                    setTimeout(() => {
                        try {
                            this.recognition.start();
                        } catch (e) {
                            // ignore start errors here
                        }
                    }, this.retryDelay);
                    return;
                }

                this.showError('No speech detected. Please ensure your microphone is on and try again.');
                this.resetButton();
                return;
            }

            if (err === 'not-allowed' || err === 'service-not-allowed') {
                this.showError('Microphone access was denied. Please enable microphone permissions for this page.');
                this.resetButton();
                return;
            }

            this.showError(`Voice recognition error: ${err}`);
            this.resetButton();
        };

        this.recognition.onend = () => {
            this.resetButton();
        };
    }

    attachEventListeners() {
        this.voiceButton.addEventListener('click', () => {
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
        });
    }

    startListening() {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then((stream) => {
                        // immediately stop the stream; we only needed the permission
                        stream.getTracks().forEach((t) => t.stop());
                        try {
                            this.recognition.start();
                        } catch (e) {
                            this.showError('Could not start voice recognition. Please try again.');
                        }
                    })
                    .catch((err) => {
                        const name = err && err.name;
                        if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
                            this.showError('Microphone permission denied. Please allow microphone access for this page.');
                        } else {
                            this.showError(`Microphone error: ${err && err.message ? err.message : err}`);
                        }
                    });
            } else {
                this.recognition.start();
            }
        } catch (e) {
            this.showError('Could not start voice recognition. Please try again.');
        }
    }

    stopListening() {
        this.recognition?.stop();
    }

    resetButton() {
        this.isListening = false;
        this.voiceButton.classList.remove('listening');
        this.status.textContent = 'Click the microphone to start';
    }

    async sendToWorkflow(voiceText) {
        const url = this.webhookUrl.value.trim();

        if (!url) {
            this.showError('Please enter your n8n webhook URL.');
            return;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    voice_text: voiceText,
                    timestamp: new Date().toISOString()
                })
            });

            const data = await response.json();
            this.showResponse(data);

        } catch (error) {
            this.showError(`Workflow connection failed: ${error.message}`);
        }
    }

    showResponse(data) {
        this.error.classList.remove('show');

        const message =
            data.voice_response ||
            data.message ||
            'Workflow executed successfully';

        this.response.textContent = message;
        this.response.classList.add('show');
        this.status.textContent = 'Complete';

        // 🔊 ALWAYS speak response
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    }

    showError(message) {
        this.response.classList.remove('show');
        this.error.textContent = message;
        this.error.classList.add('show');
        this.status.textContent = 'Error';
    }

    hideMessages() {
        this.response.classList.remove('show');
        this.error.classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VoiceScanner();
});
