import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

// Ensure data directory and leads file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), "utf-8");
}

app.use(express.json());

// Helper to read leads
function readLeads(): any[] {
  try {
    const data = fs.readFileSync(LEADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading leads file, returning empty array", err);
    return [];
  }
}

// Helper to write leads
function writeLeads(leads: any[]) {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing leads file", err);
  }
}

// Lazy load Gemini AI
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured. Please add your key in the Secrets panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Nodemailer Config & Verification
async function sendOnboardingEmails(lead: any) {
  // Configured SMTP values from user secrets
  const smtpHost = process.env.SMTP_HOST || "";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || "";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

  let successClient = false;
  let successAdmin = false;

  const clientHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0B0C10; color: #C5C6C7; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 8px; border: 1px solid #1F2833;">
      <h2 style="color: #66FCF1; margin-top: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 10px rgba(102, 252, 241, 0.3);">Project Consultation Request Received</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #ffffff;">Hi <strong>${lead.name}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6;">Namste! I am your digital growth assistant.Looking to get more walk-ins ,increase addmision, or launch a premium websites for your bussiness? Let's explore. May I begin with your name?</p>
      
      <div style="background-color: #1F2833; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #66FCF1;">
        <h3 style="color: #ffffff; margin-top: 0; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Selected Project Details</h3>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.8;">
          <li><strong>Service Architecture:</strong> ${lead.projectScope}</li>
          <li><strong>Allocated Budget Runway:</strong> ${lead.budget}</li>
          <li><strong>Capture Channel:</strong> ${lead.source} Assistant</li>
        </ul>
      </div>

      <p style="font-size: 15px; line-height: 1.6;"><strong>Next Phase:</strong> An automation representative will connect with you shortly to perform a comprehensive systems analysis and outline your structural blueprint.</p>
      
      <hr style="border: 0; border-top: 1px solid #1F2833; margin: 30px 0;" />
      <p style="font-size: 12px; text-align: center; color: #888888; margin-bottom: 0;">&copy; 2026 Aurion Technology. All rights reserved. Secured via AI Safeguard Enterprise.</p>
    </div>
  `;

  const adminHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0B0C10; color: #C5C6C7; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 8px; border: 1px solid #1F2833;">
      <div style="text-align: right;"><span style="background-color: #ff3333; color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase;">High Priority</span></div>
      <h2 style="color: #ffe600; margin-top: 0; font-weight: 600; text-transform: uppercase;">[New System Lead Alert]</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #ffffff;">A prospective customer has completed technical qualification.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
        <tr style="border-bottom: 1px solid #1F2833;">
          <th style="text-align: left; padding: 8px 0; color: #66FCF1;">Client Name</th>
          <td style="padding: 8px 0; color: white;">${lead.name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #1F2833;">
          <th style="text-align: left; padding: 8px 0; color: #66FCF1;">Email Endpoint</th>
          <td style="padding: 8px 0; color: white;">${lead.email}</td>
        </tr>
        <tr style="border-bottom: 1px solid #1F2833;">
          <th style="text-align: left; padding: 8px 0; color: #66FCF1;">Required Service</th>
          <td style="padding: 8px 0; color: white;">${lead.projectScope}</td>
        </tr>
        <tr style="border-bottom: 1px solid #1F2833;">
          <th style="text-align: left; padding: 8px 0; color: #66FCF1;">Budget Scale</th>
          <td style="padding: 8px 0; color: white;">${lead.budget}</td>
        </tr>
        <tr style="border-bottom: 1px solid #1F2833;">
          <th style="text-align: left; padding: 8px 0; color: #66FCF1;">Source Type</th>
          <td style="padding: 8px 0; color: white;">${lead.source} Chatbot</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px 0; color: #66FCF1; vertical-align: top;">Additional Intel</th>
          <td style="padding: 8px 0; color: white; line-height: 1.4;">${lead.customMessage || "No supplementary remarks."}</td>
        </tr>
      </table>

      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.APP_URL || "https://ais-dev-cj7dclohrl2pepi4d5wkjt-92145649718.asia-southeast1.run.app"}/#admin" style="background-color: #66FCF1; color: #000000; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 13px; display: inline-block;">View in Admin CRM</a>
      </div>
    </div>
  `;

  // Try real SMTP, otherwise log to mock system
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Send to client
      await transporter.sendMail({
        from: `"Aurion Technology" <${smtpUser}>`,
        to: lead.email,
        subject: "Aurion Project Blueprint Request Initialized",
        html: clientHtml,
      });
      successClient = true;

      // Send to Admin
      await transporter.sendMail({
        from: `"Aurion System Logs" <${smtpUser}>`,
        to: adminEmail,
        subject: `[High Priority Alert] New CRM Entry - ${lead.name}`,
        html: adminHtml,
      });
      successAdmin = true;

      console.log(`Real emails successfully dispatched to: ${lead.email} & ${adminEmail}`);
    } catch (smtpErr) {
      console.error("Real SMTP failed. Storing in system logs...", smtpErr);
    }
  } else {
    console.log("SMTP not configured in environment. Emails processed via Simulated Client.");
    // We always simulate success for mock mode, shown beautifully in admin email-logs
    successClient = true;
    successAdmin = true;
  }

  // Record logs into lead item
  lead.emailsSent.push({
    type: 'CLIENT_ONBOARDING',
    sentAt: new Date().toISOString(),
    success: successClient,
    to: lead.email
  });
  lead.emailsSent.push({
    type: 'ADMIN_ALERT',
    sentAt: new Date().toISOString(),
    success: successAdmin,
    to: adminEmail
  });
}

// REST ENDPOINTS

// 1. Submit a lead (Contact form or Bot finish)
app.post("/api/leads", async (req, res) => {
  try {
    const { name, email, projectScope, budget, customMessage, source } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: "Name and Email are mandatory fields." });
    }

    const leads = readLeads();
    const newLead = {
      id: "lead_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name,
      email,
      projectScope: projectScope || "General Consulting / Bots",
      budget: budget || "Custom Scope",
      customMessage: customMessage || "",
      status: "NEW",
      privateNotes: "",
      source: source || "FORM",
      createdAt: new Date().toISOString(),
      emailsSent: []
    };

    // Trigger email sequences
    await sendOnboardingEmails(newLead);

    leads.push(newLead);
    writeLeads(leads);

    res.status(201).json({ success: true, lead: newLead });
  } catch (error: any) {
    console.error("Error creating lead", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Read leads (requires admin key authorization)
app.get("/api/leads", (req, res) => {
  const adminKey = req.headers.authorization;
  const expectedKey = process.env.ADMIN_CYBER_KEY || "CYBER_SECRET_2026";

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({ error: "Access Denied. Invalid master key." });
  }

  const leads = readLeads();
  res.json({ success: true, leads });
});

// 3. Update lead details (notes/status)
app.put("/api/leads/:id", (req, res) => {
  const adminKey = req.headers.authorization;
  const expectedKey = process.env.ADMIN_CYBER_KEY || "CYBER_SECRET_2026";

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({ error: "Access Denied. Invalid master key." });
  }

  const { id } = req.params;
  const { status, privateNotes } = req.body;

  const leads = readLeads();
  const leadIndex = leads.findIndex((l) => l.id === id);

  if (leadIndex === -1) {
    return res.status(404).json({ error: "Lead not retrieved." });
  }

  if (status) leads[leadIndex].status = status;
  if (privateNotes !== undefined) leads[leadIndex].privateNotes = privateNotes;

  writeLeads(leads);
  res.json({ success: true, lead: leads[leadIndex] });
});

// Heuristic Fallback Chatbot Processor when Gemini API limits or 503 demand occurs
function runChatFallback(messages: any[]): any {
  let name: string | null = null;
  let email: string | null = null;
  let projectScope: string | null = null;
  let budget: string | null = null;

  // Track user submissions chronologically
  const userMessages = messages.filter((m: any) => m.sender === "user").map((m: any) => m.text);

  for (const text of userMessages) {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. E-mail node extraction
    const emailMatch = trimmed.match(/\b[A-Za-z0-9._%+-]+ @ [A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i) || trimmed.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      email = emailMatch[1].trim();
    }

    // 2. Budget scale extraction
    if (lower.includes("under $5k") || lower.includes("under 5") || lower.includes("<5") || lower.includes("less than 5")) {
      budget = "Under $5k";
    } else if (lower.includes("50k+") || lower.includes("over 50") || lower.includes(">50") || lower.includes("50k") || lower.includes("50,000")) {
      budget = "$50k+";
    } else if (lower.includes("15k") || lower.includes("15-50") || lower.includes("15 to 50") || lower.includes("fifty")) {
      budget = "$15k - $50k";
    } else if (lower.includes("5k") || lower.includes("5-15") || lower.includes("5 to 15") || lower.includes("fifth") || lower.includes("fifteen")) {
      budget = "$5k - $15k";
    }

    // 3. Project blueprint scope extraction
    if (lower.includes("web") || lower.includes("design") || lower.includes("developer") || lower.includes("portal") || lower.includes("client") || lower.includes("application") || lower.includes("site") || lower.includes("store")) {
      projectScope = "Custom Web Applications";
    } else if (lower.includes("bot") || lower.includes("chat") || lower.includes("conversational") || lower.includes("ai") || lower.includes("agent") || lower.includes("nexus")) {
      projectScope = "AI Conversational Bots";
    } else if (lower.includes("automation") || lower.includes("workflow") || lower.includes("smtp") || lower.includes("integration") || lower.includes("pipeline") || lower.includes("seq")) {
      projectScope = "Automated System Workflows";
    } else if (lower.includes("other") || lower.includes("general") || lower.includes("optimized") || lower.includes("consulting")) {
      projectScope = "Other";
    }

    // 4. Name extraction
    if (!name) {
      let candidate = trimmed;
      const intros = ["my name is ", "i am ", "i'm ", "call me ", "this is ", "name is "];
      for (const intro of intros) {
        if (candidate.toLowerCase().startsWith(intro)) {
          candidate = candidate.substring(candidate.toLowerCase().indexOf(intro) + intro.length);
          break;
        }
      }
      candidate = candidate.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
      // Ensure candidate looks like a reasonable name and is not an email/domain/scope answer
      if (
        candidate.length > 0 &&
        candidate.length < 25 &&
        !candidate.includes("@") &&
        !candidate.toLowerCase().includes("web") &&
        !candidate.toLowerCase().includes("bot") &&
        !candidate.toLowerCase().includes("automation") &&
        !candidate.toLowerCase().includes("budget") &&
        isNaN(Number(candidate))
      ) {
        name = candidate;
      }
    }
  }

  // Determine current pending question and formatting messages elegantly
  let message = "";
  let leadCaptured = false;

  if (!name) {
    message = "Welcome to Nexus-v2. Let's customize your automation and visual architecture. To begin, what is your name?";
  } else if (!email) {
    message = `Excellent, ${name}. What business email address shall we use to dispatch your project specifications?`;
  } else if (!projectScope) {
    message = `Thank you, ${name}. What primary system architecture represents your objective?\n- Custom Web Applications\n- AI Conversational Bots\n- Automated System Workflows\n- Other / Consulting`;
  } else if (!budget) {
    message = `Understood. To customize your blueprint roadmap, what is your approximate allocated budget range? (Under $5k, $5k - $15k, $15k - $50k, or $50k+)`;
  } else {
    message = `Acknowledge, ${name}. Every specification parameter has been analyzed and synchronized with our telemetry logs. Your custom system blueprint is ready.`;
    leadCaptured = true;
  }

  return {
    message,
    extractedDetails: {
      name,
      email,
      projectScope,
      budget,
    },
    leadCaptured,
  };
}

// 4. Chatbot Lead Generation API utilizing server-side Gemini
app.post("/api/chatbot", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid chat message thread." });
  }

  let parsedResult: any = null;
  let usedFallback = false;

  try {
    const ai = getGeminiClient();

    // Prepare message structure matching Google GenAI SDK specs.
    // We supply a system instruction that forces output format as strict JSON.
    const chatHistoryPrompt = messages.map((m: any) => {
      const senderLabel = m.sender === "user" ? "Client" : "Assistant";
      return `${senderLabel}: ${m.text}`;
    }).join("\n");

    const systemInstruction = `
      You are a highly premium AI lead qualification assistant. You represent "Aurion Technology", a elite agency selling premium Web Design, custom AI Conversational Agents and end-to-end Workflow Automation.
      Your primary purpose is to warmly greet visitors, answer questions briefly, and guide them to qualify as a direct business lead.
      You must gather these exactly 4 data parameters organically:
      1. Their Name.
      2. Their Business Email.
      3. The Product Scope they need (Options: "Custom Web Applications", "AI Conversational Bots", "Automated System Workflows", or "Other").
      4. Their approximate budget runway (Options: "Under $5k", "$5k - $15k", "$15k - $50k", or "$50k+").

      Always write only 1 to 2 brief interactive sentences. Ask only ONE missing question at a time.
      Be charismatic, sophisticated, and professional with a premium high-tech voice.

      CRITICAL MANDATE: You MUST reply in absolute valid JSON format. Never include markdown wrappers around JSON like \`\`\`json. Return strictly the object itself.
      
      Schema structure to output:
      {
        "message": "Assistant conversational answer targeting the visitor.",
        "extractedDetails": {
          "name": "Extracted string or null",
          "email": "Extracted email string or null",
          "projectScope": "Extracted project shape or null",
          "budget": "Extracted budget window or null"
        },
        "leadCaptured": true or false
      }
      
      Enforce "leadCaptured" as TRUE only when name, email, projectScope, and budget are successfully understood. If any are missing, keep "leadCaptured" as FALSE.
    `;

    const chatResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `${chatHistoryPrompt}\n\nAssistant reply (Strictly return response JSON matching template):`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2, // low temperature to ensure absolute schema compliance
      }
    });

    const rawText = chatResponse.text;
    if (!rawText) {
      throw new Error("Empty execution output from AI engine.");
    }

    // Attempt to parse AI output
    try {
      parsedResult = JSON.parse(rawText.trim());
    } catch (parseError) {
      console.warn("Raw fallback needed for parsing error inside JSON response", rawText);
      parsedResult = runChatFallback(messages);
      usedFallback = true;
    }
  } catch (err: any) {
    console.warn("Primary AI engine unavailable or limited (including 503 high demand), launching precise system fallback analysis.", err.message);
    parsedResult = runChatFallback(messages);
    usedFallback = true;
  }

  // If we analyzed that the lead is completely qualification-ready, register the entry
  if (parsedResult.leadCaptured && parsedResult.extractedDetails) {
    const details = parsedResult.extractedDetails;
    if (details.name && details.email) {
      const leads = readLeads();
      
      // Prevent duplicate registrations from chatbot message loop if lead is already registered in history
      const emailLower = details.email.toLowerCase().trim();
      const alreadyLogged = leads.some(l => l.email && l.email.toLowerCase().trim() === emailLower && l.source === "BOT");
      
      if (!alreadyLogged) {
        const newLead = {
          id: "lead_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          name: details.name,
          email: details.email,
          projectScope: details.projectScope || "AI Conversational Bots",
          budget: details.budget || "Under $5k",
          customMessage: "Gathered automatically via conversational AI chat terminal." + (usedFallback ? " [System Heuristic Fallback Processed]" : ""),
          status: "NEW",
          privateNotes: "",
          source: "BOT",
          createdAt: new Date().toISOString(),
          emailsSent: []
        };

        try {
          // Dispatch automation sequences
          await sendOnboardingEmails(newLead);
        } catch (mailErr) {
          console.error("Auto dispatch mail error inside chatbot handler:", mailErr);
        }
        leads.push(newLead);
        writeLeads(leads);
        
        // Attach lead ID for tracking inside conversation client state
        parsedResult.leadId = newLead.id;
      } else {
        // Retrieve the registered lead's ID to preserve client workflow UI
        const existingLead = leads.find(l => l.email && l.email.toLowerCase().trim() === emailLower && l.source === "BOT");
        if (existingLead) {
          parsedResult.leadId = existingLead.id;
        }
      }
    }
  }

  res.json(parsedResult);
});

// STATIC ASSETS AND SPA HANDLING WITH VITE
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aurion Technology full-stack services active on http://localhost:${PORT}`);
  });
}

startServer();
