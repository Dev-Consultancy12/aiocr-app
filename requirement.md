
---

### Copy-Paste the Text Below into AntiGravity:

**1. Project Overview**
Build a lightweight Insurance Policy Management MVP dashboard. The application allows users to upload insurance policy documents (PDF/Images), uses an AI API to extract the text via OCR, lets the user preview and edit the extracted data, and saves it. For this demo MVP, we are skipping a real database—all data must be saved to a local JSON file in a backend folder. The tech stack should be React (Vite) for the frontend, Node.js (Express) for the backend API, and Tailwind CSS for styling. The setup must be "Netlify-ready" (configured so the frontend can easily be built and deployed, though the backend will run locally for the demo).

**2. Pages and Features**

* **Navigation:** A simple top navbar or sidebar to switch between "Upload Policy" and "Policy Register".
* **Upload Page (Home):**
* A drag-and-drop zone or file picker for uploading PDF or image files.
* Upon file selection, a "Process Document" button appears.
* Clicking it shows a loading spinner while calling the backend OCR API.
* Once returned, render an "Extracted Data Preview" form. This form should be pre-filled with the AI-extracted data (Policy Number, Insured Name, Insurer Name, Premium, Expiry Date).
* The fields must be editable so the user can correct any AI mistakes.
* A "Save Policy" button at the bottom of the form submits the verified data to the backend.


* **Policy Register Page:**
* A dashboard table displaying a list of all saved policies fetched from the backend.
* Columns: Policy Number, Insured Name, Insurer Name, Premium, Expiry Date, and Date Added.
* A prominent "Download CSV" button at the top of the table to export the current policy list.



**3. API Endpoints**
The Node.js Express backend needs the following routes. Note: use `multer` for handling `multipart/form-data`.

* `POST /api/ocr/upload`
* **Body:** `multipart/form-data` (the file).
* **Action:** Takes the file, calls an LLM (like Gemini or OpenAI via their Node SDK) using an API key from `.env`. Prompts the LLM to extract specific policy fields and return strict JSON.
* **Response:** `{ success: true, data: { policyNumber, insuredName, insurerName, premiumAmount, expiryDate } }`


* `POST /api/policies`
* **Body:** JSON object with the finalized policy details.
* **Action:** Reads the local `data/policies.json` file, appends the new record with a unique UUID and timestamp, and rewrites the file.
* **Response:** `{ success: true, message: "Policy saved" }`


* `GET /api/policies`
* **Action:** Reads and returns the contents of `data/policies.json`.
* **Response:** `{ success: true, data: [...] }`


* `GET /api/policies/export`
* **Action:** Reads `data/policies.json`, converts the JSON array to CSV format format using a library like `json2csv`, and sends it back as a downloadable file with `Content-Type: text/csv`.



**4. Authentication and Authorization**

* No authentication is required for this MVP. All routes are public.

**5. Database Schema (Local JSON Structure)**
Since we are using local file storage for the demo, create a `data/policies.json` file in the backend. It should store an array of objects matching this schema:

* `id`: string (UUID, generated on backend)
* `policyNumber`: string
* `insuredName`: string
* `insurerName`: string
* `premiumAmount`: number or string
* `expiryDate`: string (YYYY-MM-DD format)
* `createdAt`: string (ISO datetime string)

**6. Security Requirements**

* The AI API key must be strictly loaded from a `.env` file (`process.env.AI_API_KEY`) and never hardcoded or exposed to the frontend.
* Configure `cors` on the backend to allow requests from the React frontend port (usually `localhost:5173`).
* Basic input validation: Ensure the final saved object contains no raw executable scripts (prevent XSS when rendering the table).

**7. Vulnerability Checks**

* Path Traversal: When writing to the local JSON file, hardcode the path to `data/policies.json` in the backend code. Do not accept file paths from the frontend to prevent overriding other system files.
* Validate the uploaded file type on the backend (ensure it is strictly a PDF, PNG, or JPEG) before sending it to the AI API.

**8. Error Handling**

* Every API response must be consistent: `{ success: boolean, error?: string, data?: any }`.
* If the AI fails to parse the document (e.g., blurry image or timeout), return a graceful 500 error: `"Failed to extract data. Please manually enter the details or try another file."`
* If `policies.json` does not exist when the app starts, the backend should automatically create it with an empty array `[]`.

**9. Environment and Config**

* Create a `.env.example` file containing `PORT=3000` and `AI_API_KEY=your_api_key_here`.
* Include standard `package.json` scripts: `npm run dev` to start both the frontend Vite server and backend Node server concurrently (using `concurrently` or similar).

**10. Non-functional Requirements**

* The UI must look modern, clean, and professional (SaaS-like) using Tailwind CSS.
* The layout should be responsive, but optimized for desktop/tablet dashboard views.
* The codebase must be clean and modular. Keep the frontend API calls centralized in a `services/api.js` file so they are easy to point to a production URL later.