const { GoogleGenerativeAI } = require('@google/generative-ai');
const xlsx = require('xlsx');

const extractPolicyData = async (fileBuffer, mimeType) => {
  try {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error("AI API key is missing or invalid");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Updated to gemini-2.5-flash as 1.5 is not available on this API key tier
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Extract the following fields from the provided insurance policy data/document:
      - policyNumber (string, extract the full policy number exactly as it appears without truncating)
      - insuredName (string)
      - insurerName (string, extract the full name without truncating)
      - premiumAmount (number or string)
      - expiryDate (YYYY-MM-DD format, string)

      Return strictly a JSON object with exactly these keys and no other text or markdown formatting.
      If a field is not found, return null for that field.
    `;

    const contentParts = [prompt];

    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'application/vnd.ms-excel') {
      // It's an Excel file, parse it to CSV
      const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
      let csvData = '';
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        csvData += xlsx.utils.sheet_to_csv(sheet) + '\n';
      });
      contentParts.push(`\nHere is the data from the Excel file in CSV format:\n${csvData}`);
    } else {
      // It's a PDF or Image, pass as inlineData
      contentParts.push({
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType
        }
      });
    }

    const result = await model.generateContent(contentParts);
    const responseText = result.response.text();
    
    // Clean up markdown code block if present
    const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("OCR Extraction Error:", error);
    throw new Error("Failed to extract data. Please manually enter the details or try another file.");
  }
};

module.exports = { extractPolicyData };
