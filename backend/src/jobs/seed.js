const User = require('../models/User');
const Question = require('../models/Question');
const connectDB = require('../config/db');

// ── SEED DATA ──────────────────────────────────────────────────────

const ADMIN = {
  name: 'Audix Admin',
  email: 'admin@audix.com',
  password: 'Admin@2026',
  role: 'admin',
  isEmailVerified: true,
  isActive: true,
  department: 'Security',
};

// Each question entry: { question, options[], correctIndex, explanation, difficulty, type }
// correctIndex → options[correctIndex].isCorrect = true
const QUESTIONS_DATA = [
  // ── ROUND 1: Phishing Inbox Review ───────────────────────────────
  {
    round: 1, type: 'multiple-choice', difficulty: 'easy',
    question: 'You receive an email: "Your Amazon account has been suspended. Click here immediately to restore access: amaz0n-support.xyz/verify". What should you do?',
    options: [
      'Click the link immediately to restore your account',
      'Forward it to colleagues to warn them',
      'Ignore and report it as phishing — the domain "amaz0n-support.xyz" is fake',
      'Reply asking for more information',
    ],
    correctIndex: 2,
    explanation: 'Legitimate companies use their official domain. "amaz0n-support.xyz" is not amazon.com.',
  },
  {
    round: 1, type: 'multiple-choice', difficulty: 'medium',
    question: "An email from \"paypal-security@secure-paypal.net\" says your account will be locked in 24 hours unless you verify your details. The grammar looks professional. Is this phishing?",
    options: [
      'No — the email looks professional so it must be real',
      "Yes — \"secure-paypal.net\" is not PayPal's official domain (paypal.com)",
      'Not sure — call PayPal to ask',
      'No — PayPal always sends urgent warnings',
    ],
    correctIndex: 1,
    explanation: 'Professional grammar does not make an email legitimate. Always check the actual sending domain.',
  },
  {
    round: 1, type: 'multiple-choice', difficulty: 'medium',
    question: 'GitHub sends an email: "Unusual sign-in detected. Review activity at: github.com.login-verify.ru/account". Should you click the link?',
    options: [
      'Yes — GitHub said to review the activity',
      'No — the real domain is "login-verify.ru", not github.com',
      "Yes — the URL starts with \"github.com\" so it's safe",
      'Only if you think you were hacked',
    ],
    correctIndex: 1,
    explanation: 'Attackers hide fake domains after a trusted name. "github.com.login-verify.ru" resolves to login-verify.ru, not GitHub.',
  },
  {
    round: 1, type: 'multiple-choice', difficulty: 'easy',
    question: 'An email from noreply@irs-taxrefund.com says: "You have a $3,200 tax refund. Provide your bank account to receive it within 48 hours." What is this?',
    options: [
      'A legitimate IRS notification — the IRS emails refund notices',
      'A phishing attack — the IRS never emails unsolicited refund offers and this is not irs.gov',
      'A spam email but not dangerous',
      'Possibly real — reply to confirm',
    ],
    correctIndex: 1,
    explanation: 'The IRS communicates by postal mail, not email. "irs-taxrefund.com" is not a government domain.',
  },
  {
    round: 1, type: 'multiple-choice', difficulty: 'medium',
    question: "HR sends an internal email: \"All staff must update payroll details by Friday. Click here: hr-portal-internal.com/payroll\". You don't recognize this domain. What do you do?",
    options: [
      "Click the link — it says it's from HR",
      'Update it after work hours for safety',
      'Contact HR directly through official channels to verify before clicking anything',
      'Ignore it — HR will resend if it\'s important',
    ],
    correctIndex: 2,
    explanation: 'Internal systems use company domains. Always verify through a known contact method before submitting payroll data.',
  },

  // ── ROUND 2: Social Engineering Chat ─────────────────────────────
  {
    round: 2, type: 'multiple-choice', difficulty: 'easy',
    question: "Someone messages you on Teams: \"Hi, I'm from IT. We're doing an urgent security audit. I need your employee ID and password to verify your account.\" What should you do?",
    options: [
      'Provide the information — IT staff need it for the audit',
      'Refuse — legitimate IT never asks for your password via chat',
      'Give only your employee ID, not the password',
      'Ask them to send the request via email first',
    ],
    correctIndex: 1,
    explanation: 'IT departments never need your password. This is a classic social engineering pretexting attack.',
  },
  {
    round: 2, type: 'multiple-choice', difficulty: 'medium',
    question: 'A caller claims to be your bank and says: "We detected fraud on your account. To protect you, I need to verify your card number and CVV." What is the safest response?',
    options: [
      'Provide the details — they called you so it must be real',
      'Hang up and call your bank back using the number on your card',
      'Give only the last 4 digits',
      'Ask them to send a text message instead',
    ],
    correctIndex: 1,
    explanation: 'Vishing (voice phishing) calls spoof legitimate numbers. Always hang up and call back using official contact info.',
  },
  {
    round: 2, type: 'multiple-choice', difficulty: 'hard',
    question: 'A vendor emails: "We\'ve updated our banking details. Please redirect the upcoming $50,000 payment to account 9876-5432." The email looks exactly like your usual contact. What do you do?',
    options: [
      'Update the payment details — the email matches the usual contact',
      'Call the vendor on their known phone number to verify the change before updating anything',
      'Reply to the email asking for confirmation',
      'Forward to your manager to decide',
    ],
    correctIndex: 1,
    explanation: 'This is Business Email Compromise (BEC). Always verify payment changes via a separate, trusted channel like a phone call.',
  },
  {
    round: 2, type: 'multiple-choice', difficulty: 'easy',
    question: 'Someone follows you closely through a secure door, saying "Thanks! My hands are full." What security principle does this violate?',
    options: [
      'Password policy',
      'Tailgating / piggybacking — each person must badge in separately',
      'Clean desk policy',
      'Data classification',
    ],
    correctIndex: 1,
    explanation: 'Tailgating bypasses physical access controls. Politely ask everyone to use their own credentials to enter.',
  },
  {
    round: 2, type: 'multiple-choice', difficulty: 'medium',
    question: 'You receive a LinkedIn message: "I\'m a journalist writing about your company. Can you confirm the names of your security team and what tools you use?" What is the risk?',
    options: [
      'No risk — public information is already available online',
      'Low risk — only share non-sensitive details',
      'High risk — this is reconnaissance; refer them to your PR/communications team',
      'Help them — good press is valuable',
    ],
    correctIndex: 2,
    explanation: 'Attackers use social media to gather intelligence (OSINT). Staff names and tool stacks help them craft targeted attacks.',
  },

  // ── ROUND 3: PII Identification ──────────────────────────────────
  {
    round: 3, type: 'multiple-choice', difficulty: 'medium',
    question: 'A document contains: "Patient: John Smith, DOB: 04/12/1985, SSN: 123-45-6789, Diagnosis: Hypertension". How many PII fields are present?',
    options: [
      '1 — only the name is PII',
      '2 — name and SSN',
      '4 — name, DOB, SSN, and medical diagnosis are all PII',
      '3 — name, DOB, SSN (diagnosis is not PII)',
    ],
    correctIndex: 2,
    explanation: 'Name, DOB, SSN, and health information are all classified as PII/PHI. Medical records require highest protection.',
  },
  {
    round: 3, type: 'multiple-choice', difficulty: 'easy',
    question: 'Which of the following is NOT considered Personally Identifiable Information (PII)?',
    options: [
      'IP address',
      'Employee badge number',
      'The color of a public building',
      'Device fingerprint',
    ],
    correctIndex: 2,
    explanation: 'The color of a public building cannot identify a person. IP addresses, badge numbers, and device fingerprints can all be linked to individuals.',
  },
  {
    round: 3, type: 'multiple-choice', difficulty: 'medium',
    question: 'An HR spreadsheet is being shared with an external recruiter. It contains: Name, Email, Phone, Salary, Performance Rating. What must happen before sharing?',
    options: [
      'Share it as-is — recruiters need full information',
      'Remove salary and performance data, or obtain explicit consent from each employee',
      'Password-protect the file and share',
      'Only share with employees earning above $50k',
    ],
    correctIndex: 1,
    explanation: 'Salary and performance data is sensitive PII. It should be minimized or have explicit consent before sharing externally.',
  },
  {
    round: 3, type: 'multiple-choice', difficulty: 'hard',
    question: 'A customer support log contains: "User complained about slow service. Their account ID is ACC-9921." Is this PII?',
    options: [
      'No — account IDs are not personal information',
      'Yes — if the account ID can be linked back to a specific person, it is PII',
      'Only if combined with a name',
      'No — only government IDs are PII',
    ],
    correctIndex: 1,
    explanation: 'Any identifier that can be traced to an individual qualifies as PII. Account IDs in linked systems identify real people.',
  },
  {
    round: 3, type: 'multiple-choice', difficulty: 'medium',
    question: 'You find a printed document on the printer containing customer names, emails, and credit card last-4 digits. What should you do?',
    options: [
      'Leave it — someone will come back for it',
      'Take it to your desk for safekeeping',
      'Secure it and report it as a potential data incident per company policy',
      'Shred it immediately without telling anyone',
    ],
    correctIndex: 2,
    explanation: 'Unattended PII documents are a security incident. Follow your data breach reporting procedure — do not destroy evidence.',
  },

  // ── ROUND 4: Password Fortress ────────────────────────────────────
  {
    round: 4, type: 'multiple-choice', difficulty: 'easy',
    question: 'Which password is the strongest?',
    options: [
      'Password123!',
      'p@ssw0rd',
      'Tr0ub4dor&3',
      'Xk#9mP2$qL7vN',
    ],
    correctIndex: 3,
    explanation: '"Xk#9mP2$qL7vN" is random, 13 characters, and uses all character classes. Dictionary words with substitutions (p@ssw0rd) are easily cracked.',
  },
  {
    round: 4, type: 'multiple-choice', difficulty: 'medium',
    question: 'You use the same password for your work email and personal banking. A data breach exposes your email password. What is the immediate risk?',
    options: [
      'Low risk — breach databases take time to be exploited',
      'High risk — attackers will try the same password on banking sites (credential stuffing)',
      'No risk — your bank has 2FA',
      'Medium risk — only if the breach is publicized',
    ],
    correctIndex: 1,
    explanation: 'Credential stuffing automates login attempts across many sites instantly after breaches. Never reuse passwords.',
  },
  {
    round: 4, type: 'multiple-choice', difficulty: 'easy',
    question: 'What is the most secure way to store and manage passwords for 50+ work accounts?',
    options: [
      'Write them in a notebook kept at your desk',
      'Use a company-approved password manager with a strong master password and MFA',
      'Store them in a spreadsheet on your desktop',
      'Use variations of one master password (e.g., Work1!, Work2!)',
    ],
    correctIndex: 1,
    explanation: 'Password managers generate and store unique passwords securely. They are the only scalable way to have unique strong passwords.',
  },
  {
    round: 4, type: 'multiple-choice', difficulty: 'hard',
    question: 'Your company requires passwords to be changed every 90 days. Research now shows this policy often leads to weaker passwords. What does NIST recommend instead?',
    options: [
      'Change every 30 days for better security',
      'Use longer passphrases, change only when compromise is suspected, and use MFA',
      'Never change passwords once set',
      'Reuse old passwords but add a number at the end',
    ],
    correctIndex: 1,
    explanation: 'NIST SP 800-63B discourages forced periodic resets as users choose weaker, predictable passwords. Use long passphrases + MFA instead.',
  },
  {
    round: 4, type: 'multiple-choice', difficulty: 'easy',
    question: 'Multi-factor authentication (MFA) is enabled on your account. An attacker has your correct username and password. Can they log in?',
    options: [
      'Yes — password is the main security layer',
      'Usually not — they also need the second factor (phone/hardware key)',
      'Yes — MFA only works on mobile devices',
      'Only if they know your security questions',
    ],
    correctIndex: 1,
    explanation: 'MFA requires possession of a second factor. Even with correct credentials, attackers are blocked without the physical device or authenticator app.',
  },

  // ── ROUND 5: Secure Browsing ──────────────────────────────────────
  {
    round: 5, type: 'multiple-choice', difficulty: 'medium',
    question: 'A website URL shows: https://secure-login.bank0famerica.com. Is it safe to enter your banking credentials?',
    options: [
      "Yes — it has HTTPS so it's secure",
      '"Bank of America" is in the URL so it must be legitimate',
      'No — the real domain is "bank0famerica.com" (zero not letter O), not bankofamerica.com',
      'Only if the padlock icon shows green',
    ],
    correctIndex: 2,
    explanation: 'HTTPS only encrypts data in transit — it does NOT verify the site is legitimate. Typosquatting uses visually similar domains.',
  },
  {
    round: 5, type: 'multiple-choice', difficulty: 'easy',
    question: 'You are working on sensitive files in a coffee shop on public WiFi. What is the safest approach?',
    options: [
      "It's fine — HTTPS encrypts everything",
      'Use your company VPN before accessing any work systems',
      'Use incognito mode for protection',
      'Only access files not marked "confidential"',
    ],
    correctIndex: 1,
    explanation: 'Public WiFi is vulnerable to man-in-the-middle attacks. A VPN encrypts your entire connection and tunnels it securely.',
  },
  {
    round: 5, type: 'multiple-choice', difficulty: 'easy',
    question: 'A browser pop-up says: "Your computer has a virus! Call Microsoft Support at 1-800-XXX-XXXX immediately." What should you do?',
    options: [
      'Call the number — Microsoft detected a real problem',
      'This is a tech support scam — close the tab and run your real antivirus',
      'Click "X" to dismiss, then call your IT team to check',
      'Restart your computer',
    ],
    correctIndex: 1,
    explanation: 'Browser pop-ups cannot scan your computer. This is a tech support scam designed to trick you into calling fraudsters.',
  },
  {
    round: 5, type: 'multiple-choice', difficulty: 'medium',
    question: 'You want to download free software for a work task. The official site charges a fee, but a third-party site offers it free. What is the risk?',
    options: [
      'No risk — free software is widely available',
      'High risk — third-party downloads often contain malware, adware, or trojans',
      'Low risk — run a virus scan after installing',
      'Only risky on Windows, not Mac',
    ],
    correctIndex: 1,
    explanation: "Unofficial download sites are a primary malware distribution vector. Always download from official sources or use your company's approved software library.",
  },
  {
    round: 5, type: 'multiple-choice', difficulty: 'medium',
    question: "Which browser behavior should raise a security concern when visiting your company's internal portal?",
    options: [
      'The site requests your AD credentials via a login form',
      'The browser shows a certificate error: "Your connection is not private"',
      'The page loads slowly',
      'The site asks you to accept cookies',
    ],
    correctIndex: 1,
    explanation: "Certificate errors mean the site's identity cannot be verified — it could be a spoofed site or MITM attack. Never proceed past certificate warnings.",
  },

  // ── ROUND 6: Incident Response ────────────────────────────────────
  {
    round: 6, type: 'multiple-choice', difficulty: 'easy',
    question: 'You suspect your work laptop has been infected with malware. What is the FIRST thing you should do?',
    options: [
      'Run a full antivirus scan and delete suspicious files',
      'Disconnect from the network immediately and report to IT Security',
      'Restart the laptop to clear the infection',
      'Back up all your files before doing anything',
    ],
    correctIndex: 1,
    explanation: 'Isolation is the first step — disconnecting prevents malware from spreading or exfiltrating data. Report immediately so IR can begin.',
  },
  {
    round: 6, type: 'multiple-choice', difficulty: 'medium',
    question: "You accidentally send an email with a customer's personal data to the wrong address. Under GDPR, what must happen?",
    options: [
      'Ask the recipient to delete it and consider the matter closed',
      "Report to your Data Protection Officer — GDPR requires notification within 72 hours if it's a personal data breach",
      'Nothing — it was an accident, not intentional',
      'Only report if the data included financial information',
    ],
    correctIndex: 1,
    explanation: 'GDPR Article 33 requires breach notification to supervisory authorities within 72 hours. Accidental disclosures are reportable breaches.',
  },
  {
    round: 6, type: 'multiple-choice', difficulty: 'medium',
    question: 'During a ransomware attack, encrypted files appear on shared drives and a ransom note demands payment in Bitcoin. What should you NOT do?',
    options: [
      'Isolate affected systems from the network',
      'Pay the ransom immediately to restore files',
      'Preserve logs and evidence for forensics',
      'Activate your incident response plan',
    ],
    correctIndex: 1,
    explanation: 'Paying ransoms funds criminal organizations, does not guarantee recovery, and may violate sanctions laws. Follow your IR plan and restore from clean backups.',
  },
  {
    round: 6, type: 'multiple-choice', difficulty: 'hard',
    question: 'A colleague notices unusual large data transfers from a server at 3 AM on a weekend. What type of threat does this most likely indicate?',
    options: [
      'A misconfigured backup job',
      'Potential data exfiltration — possibly an insider threat or compromised account',
      'Normal system maintenance',
      'A DDoS attack',
    ],
    correctIndex: 1,
    explanation: 'Off-hours large data transfers are a classic indicator of data exfiltration. Investigate as a potential incident immediately.',
  },
  {
    round: 6, type: 'multiple-choice', difficulty: 'medium',
    question: 'After an incident is resolved, what is the most valuable final step in the incident response lifecycle?',
    options: [
      'Change all passwords across the organization',
      'Conduct a post-incident review (lessons learned) to improve defenses',
      'Notify customers immediately about the incident',
      'Purchase new security tools',
    ],
    correctIndex: 1,
    explanation: 'Post-incident reviews identify root causes and improve response procedures. This is the "Lessons Learned" phase of NIST IR lifecycle.',
  },
];

// ── HELPERS ────────────────────────────────────────────────────────

const ROUND_NAMES = [
  'Phishing Inbox Review',
  'Social Engineering Chat',
  'PII Identification',
  'Password Fortress',
  'Secure Browsing',
  'Incident Response',
];

function buildOptions(textArray, correctIndex) {
  return textArray.map((text, i) => ({
    text,
    isCorrect: i === correctIndex,
  }));
}

// ── CORE SEED LOGIC (exported for HTTP endpoint) ──────────────────

const runSeed = async () => {
  // ── 1. Admin ────────────────────────────────────────────────────
  let adminCreated = false;
  let admin = await User.findOne({ email: ADMIN.email });

  if (admin) {
    console.log('⏭  Admin already exists:', admin.email);
  } else {
    admin = await User.create(ADMIN);
    adminCreated = true;
    console.log('✅ Admin created:', admin.email);
  }

  // ── 2. Questions (idempotent per round + question text) ──────────
  let created = 0;
  let skipped = 0;

  for (const q of QUESTIONS_DATA) {
    const exists = await Question.findOne({
      round: q.round,
      question: q.question,
    });

    if (exists) {
      skipped++;
      continue;
    }

    await Question.create({
      round:       q.round,
      roundName:   ROUND_NAMES[q.round - 1],
      type:        q.type,
      difficulty:  q.difficulty,
      question:    q.question,
      options:     buildOptions(q.options, q.correctIndex),
      explanation: q.explanation,
      piiFields:   [],
      isActive:    true,
      createdBy:   admin._id,
    });

    created++;
  }

  console.log(`✅ Questions: ${created} created, ${skipped} already existed.`);
  return { adminCreated, questionsCreated: created, questionsSkipped: skipped };
};

module.exports = { runSeed, ADMIN };

// ── CLI ENTRY POINT ────────────────────────────────────────────────
if (require.main === module) {
  require('dotenv').config();
  (async () => {
    await connectDB();
    await runSeed();
    console.log('🎉 Seed complete.');
    process.exit(0);
  })().catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  });
}
