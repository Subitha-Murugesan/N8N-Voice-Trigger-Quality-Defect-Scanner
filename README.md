# Voice n8n - Voice Trigger Quality Defect Scanner

## Overview

This project demonstrates how to use **n8n automation workflows with a voice-enabled frontend** to detect and analyze **quality defects triggered by voice commands**.

The system allows a user to speak a command in the browser. The frontend captures the voice input, converts it to text, and sends the data to an **n8n webhook**. The n8n workflow then processes the payload, performs quality checks, and returns a response.

The response can include:

* A quality defect report
* Alerts or notifications
* Automated workflow actions
* Text or voice responses returned to the frontend

<img width="1" height="1" alt="image" src="https://github.com/user-attachments/assets/182a5038-c84f-4b46-8eb5-5d8c25127959" />
<img width="664" height="891" alt="image" src="https://github.com/user-attachments/assets/0bf5229b-1420-4f50-91ab-2b5cb4e30062" />

<img width="744" height="564" alt="image" src="https://github.com/user-attachments/assets/7cd27d4e-38d3-4302-a383-47c44307d768" />
<img width="703" height="234" alt="image" src="https://github.com/user-attachments/assets/1db7c930-2027-4011-9a48-c952526f26ea" />

---

# n8n Workflow Role

**n8n acts as the automation engine** for this system.

When the frontend sends a voice payload to the webhook, n8n can:

* Validate the voice payload
* Detect quality issues in the trigger
* Analyze transcription quality
* Classify defects
* Create alerts or tickets
* Send a response back to the frontend

Typical workflow structure in n8n:

```
Voice UI
   ↓
Webhook Trigger
   ↓
Payload Validation
   ↓
Quality Defect Detection
   ↓
Classification / Analysis
   ↓
Response to Frontend
```

The workflow can return a **JSON response** or a **text-to-speech response**.

---


# Project Structure

```
project/
│
├── index.html
├── voice-scanner.js
├── voice.json
├── voice_updated.json
└── README.md
```

### Files

**index.html**

Minimal frontend UI for voice interaction.
Provides the microphone button and sends requests to n8n.

---

**voice-scanner.js**

Handles:

* Speech recognition
* Voice capture
* Transcript generation
* Sending payloads to the n8n webhook

---

**voice.json**

Example raw payload captured from the voice scanner.

Example fields may include:

* timestamp
* transcript
* device metadata
* audio indicators

---

**voice_updated.json**

Example payload after preprocessing or enrichment.

This may include:

* cleaned transcript
* intent classification
* confidence score
* detected quality defects

---

# How the System Works

The frontend captures voice input and sends it to n8n.

```
User speaks command
      ↓
Browser captures voice
      ↓
Speech recognition converts to text
      ↓
JSON payload created
      ↓
POST request sent to n8n webhook
      ↓
n8n processes payload
      ↓
Quality analysis performed
      ↓
Response returned to frontend
```

Example voice command:

```
"Scan for quality defects in the last 24 hours"
```

---

# Running the Frontend Locally

Serve the project directory using a local server.

Example:

```bash
python3 -m http.server 8000
```

Then open:

```
http://localhost:8000
```

Use **Google Chrome** for best compatibility with speech recognition.

Allow microphone access when prompted.

---

# Integrating with n8n

## Step 1 — Create Webhook

In n8n:

1. Add a **Webhook node**
2. Set method:

```
POST
```

Example webhook URL:

```
http://localhost:5678/webhook/voice-quality-scan
```

---

## Step 2 — Update Frontend Endpoint

Update the fetch request in `voice-scanner.js`.

Example:

```javascript
fetch('http://localhost:5678/webhook/voice-quality-scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});
```

---

## Step 3 — Process the Payload

In the n8n workflow, you can:

* Validate the payload
* Check transcript quality
* Detect defects
* Generate a response

Example response returned to the frontend:

```json
{
  "status": "HIGH_SEVERITY_DEFECT",
  "product": "Widget-X",
  "message": "High severity quality defect detected."
}
```

The frontend can display or speak this response.

---

# Example Voice Payload

Example raw payload:

```json
{
  "timestamp": "2026-03-05T12:00:00Z",
  "voice_text": "check quality issues",
  "confidence": 0.82
}
```

Example processed payload:

```json
{
  "timestamp": "2026-03-05T12:00:00Z",
  "intent": "quality_scan",
  "confidence": 0.82,
  "defectDetected": true
}
```

---
