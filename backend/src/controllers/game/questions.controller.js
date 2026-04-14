const Question = require('../../models/Question');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const { ROUNDS, HTTP } = require('../../config/constants');
const logger = require('../../utils/logger');

// ── HARDCODED FALLBACK QUESTIONS PER ROUND ─────────────────────────
// Used when DB has < 5 questions for a round (e.g. fresh deploy)
const FALLBACK_QUESTIONS = {
  1: [ // Phishing Inbox Review
    {
      _id: 'fallback-r1-q1',
      round: 1, type: 'multiple-choice',
      question: 'You receive an email: "Your Amazon account has been suspended. Click here immediately to restore access: amaz0n-support.xyz/verify". What should you do?',
      options: [
        { text: 'Click the link immediately to restore your account' },
        { text: 'Forward it to colleagues to warn them' },
        { text: 'Ignore and report it as phishing — the domain "amaz0n-support.xyz" is fake' },
        { text: 'Reply asking for more information' },
      ],
      correctIndex: 2,
      explanation: 'Legitimate companies use their official domain. "amaz0n-support.xyz" is not amazon.com.',
      difficulty: 'easy',
    },
    {
      _id: 'fallback-r1-q2',
      round: 1, type: 'multiple-choice',
      question: 'An email from "paypal-security@secure-paypal.net" says your account will be locked in 24 hours unless you verify your details. The grammar looks professional. Is this phishing?',
      options: [
        { text: 'No — the email looks professional so it must be real' },
        { text: 'Yes — "secure-paypal.net" is not PayPal\'s official domain (paypal.com)' },
        { text: 'Not sure — call PayPal to ask' },
        { text: 'No — PayPal always sends urgent warnings' },
      ],
      correctIndex: 1,
      explanation: 'Professional grammar does not make an email legitimate. Always check the actual sending domain.',
      difficulty: 'medium',
    },
    {
      _id: 'fallback-r1-q3',
      round: 1, type: 'multiple-choice',
      question: 'GitHub sends an email: "Unusual sign-in detected. Review activity at: github.com.login-verify.ru/account". Should you click the link?',
      options: [
        { text: 'Yes — GitHub said to review the activity' },
        { text: 'No — the real domain is "login-verify.ru", not github.com' },
        { text: 'Yes — the URL starts with "github.com" so it\'s safe' },
        { text: 'Only if you think you were hacked' },
      ],
      correctIndex: 1,
      explanation: 'Attackers hide fake domains after a trusted name. "github.com.login-verify.ru" resolves to login-verify.ru, not GitHub.',
      difficulty: 'medium',
    },
    {
      _id: 'fallback-r1-q4',
      round: 1, type: 'multiple-choice',
      question: 'An email from noreply@irs-taxrefund.com says: "You have a $3,200 tax refund. Provide your bank account to receive it within 48 hours." What is this?',
      options: [
        { text: 'A legitimate IRS notification — the IRS emails refund notices' },
        { text: 'A phishing attack — the IRS never emails unsolicited refund offers and this is not irs.gov' },
        { text: 'A spam email but not dangerous' },
        { text: 'Possibly real — reply to confirm' },
      ],
      correctIndex: 1,
      explanation: 'The IRS communicates by postal mail, not email. "irs-taxrefund.com" is not a government domain.',
      difficulty: 'easy',
    },
    {
      _id: 'fallback-r1-q5',
      round: 1, type: 'multiple-choice',
      question: 'HR sends an internal email: "All staff must update payroll details by Friday. Click here: hr-portal-internal.com/payroll". You don\'t recognize this domain. What do you do?',
      options: [
        { text: 'Click the link — it says it\'s from HR' },
        { text: 'Update it after work hours for safety' },
        { text: 'Contact HR directly through official channels to verify before clicking anything' },
        { text: 'Ignore it — HR will resend if it\'s important' },
      ],
      correctIndex: 2,
      explanation: 'Internal systems use company domains. Always verify through a known contact method before submitting payroll data.',
      difficulty: 'medium',
    },
  ],

  2: [ // Social Engineering Chat
    {
      _id: 'fallback-r2-q1',
      round: 2, type: 'multiple-choice',
      question: 'Someone messages you on Teams: "Hi, I\'m from IT. We\'re doing an urgent security audit. I need your employee ID and password to verify your account." What should you do?',
      options: [
        { text: 'Provide the information — IT staff need it for the audit' },
        { text: 'Refuse — legitimate IT never asks for your password via chat' },
        { text: 'Give only your employee ID, not the password' },
        { text: 'Ask them to send the request via email first' },
      ],
      correctIndex: 1,
      explanation: 'IT departments never need your password. This is a classic social engineering pretexting attack.',
      difficulty: 'easy',
    },
    {
      _id: 'fallback-r2-q2',
      round: 2, type: 'multiple-choice',
      question: 'A caller claims to be your bank and says: "We detected fraud on your account. To protect you, I need to verify your card number and CVV." What is the safest response?',
      options: [
        { text: 'Provide the details — they called you so it must be real' },
        { text: 'Hang up and call your bank back using the number on your card' },
        { text: 'Give only the last 4 digits' },
        { text: 'Ask them to send a text message instead' },
      ],
      correctIndex: 1,
      explanation: 'Vishing (voice phishing) calls spoof legitimate numbers. Always hang up and call back using official contact info.',
      difficulty: 'medium',
    },
    {
      _id: 'fallback-r2-q3',
      round: 2, type: 'multiple-choice',
      question: 'A vendor emails: "We\'ve updated our banking details. Please redirect the upcoming $50,000 payment to account 9876-5432." The email looks exactly like your usual contact. What do you do?',
      options: [
        { text: 'Update the payment details — the email matches the usual contact' },
        { text: 'Call the vendor on their known phone number to verify the change before updating anything' },
        { text: 'Reply to the email asking for confirmation' },
        { text: 'Forward to your manager to decide' },
      ],
      correctIndex: 1,
      explanation: 'This is Business Email Compromise (BEC). Always verify payment changes via a separate, trusted channel like a phone call.',
      difficulty: 'hard',
    },
    {
      _id: 'fallback-r2-q4',
      round: 2, type: 'multiple-choice',
      question: 'Someone follows you closely through a secure door, saying "Thanks! My hands are full." What security principle does this violate?',
      options: [
        { text: 'Password policy' },
        { text: 'Tailgating / piggybacking — each person must badge in separately' },
        { text: 'Clean desk policy' },
        { text: 'Data classification' },
      ],
      correctIndex: 1,
      explanation: 'Tailgating bypasses physical access controls. Politely ask everyone to use their own credentials to enter.',
      difficulty: 'easy',
    },
    {
      _id: 'fallback-r2-q5',
      round: 2, type: 'multiple-choice',
      question: 'You receive a LinkedIn message: "I\'m a journalist writing about your company. Can you confirm the names of your security team and what tools you use?" What is the risk?',
      options: [
        { text: 'No risk — public information is already available online' },
        { text: 'Low risk — only share non-sensitive details' },
        { text: 'High risk — this is reconnaissance; refer them to your PR/communications team' },
        { text: 'Help them — good press is valuable' },
      ],
      correctIndex: 2,
      explanation: 'Attackers use social media to gather intelligence (OSINT). Staff names and tool stacks help them craft targeted attacks.',
      difficulty: 'medium',
    },
  ],

  3: [ // PII Identification
    {
      _id: 'fallback-r3-q1',
      round: 3, type: 'multiple-choice',
      question: 'A document contains: "Patient: John Smith, DOB: 04/12/1985, SSN: 123-45-6789, Diagnosis: Hypertension". How many PII fields are present?',
      options: [
        { text: '1 — only the name is PII' },
        { text: '2 — name and SSN' },
        { text: '4 — name, DOB, SSN, and medical diagnosis are all PII' },
        { text: '3 — name, DOB, SSN (diagnosis is not PII)' },
      ],
      correctIndex: 2,
      explanation: 'Name, DOB, SSN, and health information are all classified as PII/PHI. Medical records require highest protection.',
      difficulty: 'medium',
    },
    {
      _id: 'fallback-r3-q2',
      round: 3, type: 'multiple-choice',
      question: 'Which of the following is NOT considered Personally Identifiable Information (PII)?',
      options: [
        { text: 'IP address' },
        { text: 'Employee badge number' },
        { text: 'The color of a public building' },
        { text: 'Device fingerprint' },
      ],
      correctIndex: 2,
      explanation: 'The color of a public building cannot identify a person. IP addresses, badge numbers, and device fingerprints can all be linked to individuals.',
      difficulty: 'easy',
    },
    {
      _id: 'fallback-r3-q3',
      round: 3, type: 'multiple-choice',
      question: 'An HR spreadsheet is being shared with an external recruiter. It contains: Name, Email, Phone, Salary, Performance Rating. What must happen before sharing?',
      options: [
        { text: 'Share it as-is — recruiters need full information' },
        { text: 'Remove salary and performance data, or obtain explicit consent from each employee' },
        { text: 'Password-protect the file and share' },
        { text: 'Only share with employees earning above $50k' },
      ],
      correctIndex: 1,
      explanation: 'Salary and performance data is sensitive PII. It should be minimized or have explicit consent before sharing externally.',
      difficulty: 'medium',
    },
    {
      _id: 'fallback-r3-q4',
      round: 3, type: 'multiple-choice',
      question: 'A customer support log contains: "User complained about slow service. Their account ID is ACC-9921." Is this PII?',
      options: [
        { text: 'No — account IDs are not personal information' },
        { text: 'Yes — if the account ID can be linked back to a specific person, it is PII' },
        { text: 'Only if combined with a name' },
        { text: 'No — only government IDs are PII' },
      ],
      correctIndex: 1,
      explanation: 'Any identifier that can be traced to an individual qualifies as PII. Account IDs in linked systems identify real people.',
      difficulty: 'hard',
    },
    {
      _id: 'fallback-r3-q5',
      round: 3, type: 'multiple-choice',
      question: 'You find a printed document on the printer containing customer names, emails, and credit card last-4 digits. What should you do?',
      options: [
        { text: 'Leave it — someone will come back for it' },
        { text: 'Take it to your desk for safekeeping' },
        { text: 'Secure it and report it as a potential data incident per company policy' },
        { text: 'Shred it immediately without telling anyone' },
      ],
      correctIndex: 2,
      explanation: 'Unattended PII documents are a security incident. Follow your data breach reporting procedure — do not destroy evidence.',
      difficulty: 'medium',
    },
  ],

  4: [ // Password Fortress
    {
      _id: 'fallback-r4-q1',
      round: 4, type: 'multiple-choice',
      question: 'Which password is the strongest?',
      options: [
        { text: 'Password123!' },
        { text: 'p@ssw0rd' },
        { text: 'Tr0ub4dor&3' },
        { text: 'Xk#9mP2$qL7vN' },
      ],
      correctIndex: 3,
      explanation: '"Xk#9mP2$qL7vN" is random, 13 characters, and uses all character classes. Dictionary words with substitutions (p@ssw0rd) are easily cracked.',
      difficulty: 'easy',
    },
    {
      _id: 'fallback-r4-q2',
      round: 4, type: 'multiple-choice',
      question: 'You use the same password for your work email and personal banking. A data breach exposes your email password. What is the immediate risk?',
      options: [
        { text: 'Low risk — breach databases take time to be exploited' },
        { text: 'High risk — attackers will try the same password on banking sites (credential stuffing)' },
        { text: 'No risk — your bank has 2FA' },
        { text: 'Medium risk — only if the breach is publicized' },
      ],
      correctIndex: 1,
      explanation: 'Credential stuffing automates login attempts across many sites instantly after breaches. Never reuse passwords.',
      difficulty: 'medium',
    },
    {
      _id: 'fallback-r4-q3',
      round: 4, type: 'multiple-choice',
      question: 'What is the most secure way to store and manage passwords for 50+ work accounts?',
      options: [
        { text: 'Write them in a notebook kept at your desk' },
        { text: 'Use a company-approved password manager with a strong master password and MFA' },
        { text: 'Store them in a spreadsheet on your desktop' },
        { text: 'Use variations of one master password (e.g., Work1!, Work2!)' },
      ],
      correctIndex: 1,
      explanation: 'Password managers generate and store unique passwords securely. They are the only scalable way to have unique strong passwords.',
      difficulty: 'easy',
    },
    {
      _id: 'fallback-r4-q4',
      round: 4, type: 'multiple-choice',
      question: 'Your company requires passwords to be changed every 90 days. Research now shows this policy often leads to weaker passwords. What does NIST recommend instead?',
      options: [
        { text: 'Change every 30 days for better security' },
        { text: 'Use longer passphrases, change only when compromise is suspected, and use MFA' },
        { text: 'Never change passwords once set' },
        { text: 'Reuse old passwords but add a number at the end' },
      ],
      correctIndex: 1,
      explanation: 'NIST SP 800-63B discourages forced periodic resets as users choose weaker, predictable passwords. Use long passphrases + MFA instead.',
      difficulty: 'hard',
    },
    {
      _id: 'fallback-r4-q5',
      round: 4, type: 'multiple-choice',
      question: 'Multi-factor authentication (MFA) is enabled on your account. An attacker has your correct username and password. Can they log in?',
      options: [
        { text: 'Yes — password is the main security layer' },
        { text: 'Usually not — they also need the second factor (phone/hardware key)' },
        { text: 'Yes — MFA only works on mobile devices' },
        { text: 'Only if they know your security questions' },
      ],
      correctIndex: 1,
      explanation: 'MFA requires possession of a second factor. Even with correct credentials, attackers are blocked without the physical device or authenticator app.',
      difficulty: 'easy',
    },
  ],

  5: [ // Secure Browsing
    {
      _id: 'fallback-r5-q1',
      round: 5, type: 'multiple-choice',
      question: 'A website URL shows: https://secure-login.bank0famerica.com. Is it safe to enter your banking credentials?',
      options: [
        { text: 'Yes — it has HTTPS so it\'s secure' },
        { text: 'Yes — "Bank of America" is in the URL' },
        { text: 'No — the real domain is "bank0famerica.com" (zero not letter O), not bankofamerica.com' },
        { text: 'Only if the padlock icon shows green' },
      ],
      correctIndex: 2,
      explanation: 'HTTPS only encrypts data in transit — it does NOT verify the site is legitimate. Typosquatting uses visually similar domains.',
      difficulty: 'medium',
    },
    {
      _id: 'fallback-r5-q2',
      round: 5, type: 'multiple-choice',
      question: 'You are working on sensitive files in a coffee shop on public WiFi. What is the safest approach?',
      options: [
        { text: 'It\'s fine — HTTPS encrypts everything' },
        { text: 'Use your company VPN before accessing any work systems' },
        { text: 'Use incognito mode for protection' },
        { text: 'Only access files not marked "confidential"' },
      ],
      correctIndex: 1,
      explanation: 'Public WiFi is vulnerable to man-in-the-middle attacks. A VPN encrypts your entire connection and tunnels it securely.',
      difficulty: 'easy',
    },
    {
      _id: 'fallback-r5-q3',
      round: 5, type: 'multiple-choice',
      question: 'A browser pop-up says: "Your computer has a virus! Call Microsoft Support at 1-800-XXX-XXXX immediately." What should you do?',
      options: [
        { text: 'Call the number — Microsoft detected a real problem' },
        { text: 'This is a tech support scam — close the tab and run your real antivirus' },
        { text: 'Click "X" to dismiss, then call your IT team to check' },
        { text: 'Restart your computer' },
      ],
      correctIndex: 1,
      explanation: 'Browser pop-ups cannot scan your computer. This is a tech support scam designed to trick you into calling fraudsters.',
      difficulty: 'easy',
    },
    {
      _id: 'fallback-r5-q4',
      round: 5, type: 'multiple-choice',
      question: 'You want to download free software for a work task. The official site charges a fee, but a third-party site offers it free. What is the risk?',
      options: [
        { text: 'No risk — free software is widely available' },
        { text: 'High risk — third-party downloads often contain malware, adware, or trojans' },
        { text: 'Low risk — run a virus scan after installing' },
        { text: 'Only risky on Windows, not Mac' },
      ],
      correctIndex: 1,
      explanation: 'Unofficial download sites are a primary malware distribution vector. Always download from official sources or use your company\'s approved software library.',
      difficulty: 'medium',
    },
    {
      _id: 'fallback-r5-q5',
      round: 5, type: 'multiple-choice',
      question: 'Which browser behavior should raise a security concern when visiting your company\'s internal portal?',
      options: [
        { text: 'The site requests your AD credentials via a login form' },
        { text: 'The browser shows a certificate error: "Your connection is not private"' },
        { text: 'The page loads slowly' },
        { text: 'The site asks you to accept cookies' },
      ],
      correctIndex: 1,
      explanation: 'Certificate errors mean the site\'s identity cannot be verified — it could be a spoofed site or MITM attack. Never proceed past certificate warnings.',
      difficulty: 'medium',
    },
  ],

  6: [ // Incident Response
    {
      _id: 'fallback-r6-q1',
      round: 6, type: 'multiple-choice',
      question: 'You suspect your work laptop has been infected with malware. What is the FIRST thing you should do?',
      options: [
        { text: 'Run a full antivirus scan and delete suspicious files' },
        { text: 'Disconnect from the network immediately and report to IT Security' },
        { text: 'Restart the laptop to clear the infection' },
        { text: 'Back up all your files before doing anything' },
      ],
      correctIndex: 1,
      explanation: 'Isolation is the first step — disconnecting prevents malware from spreading or exfiltrating data. Report immediately so IR can begin.',
      difficulty: 'easy',
    },
    {
      _id: 'fallback-r6-q2',
      round: 6, type: 'multiple-choice',
      question: 'You accidentally send an email with a customer\'s personal data to the wrong address. Under GDPR, what must happen?',
      options: [
        { text: 'Ask the recipient to delete it and consider the matter closed' },
        { text: 'Report to your Data Protection Officer — GDPR requires notification within 72 hours if it\'s a personal data breach' },
        { text: 'Nothing — it was an accident, not intentional' },
        { text: 'Only report if the data included financial information' },
      ],
      correctIndex: 1,
      explanation: 'GDPR Article 33 requires breach notification to supervisory authorities within 72 hours. Accidental disclosures are reportable breaches.',
      difficulty: 'medium',
    },
    {
      _id: 'fallback-r6-q3',
      round: 6, type: 'multiple-choice',
      question: 'During a ransomware attack, encrypted files appear on shared drives and a ransom note demands payment in Bitcoin. What should you NOT do?',
      options: [
        { text: 'Isolate affected systems from the network' },
        { text: 'Pay the ransom immediately to restore files' },
        { text: 'Preserve logs and evidence for forensics' },
        { text: 'Activate your incident response plan' },
      ],
      correctIndex: 1,
      explanation: 'Paying ransoms funds criminal organizations, does not guarantee recovery, and may violate sanctions laws. Follow your IR plan and restore from clean backups.',
      difficulty: 'medium',
    },
    {
      _id: 'fallback-r6-q4',
      round: 6, type: 'multiple-choice',
      question: 'A colleague notices unusual large data transfers from a server at 3 AM on a weekend. What type of threat does this most likely indicate?',
      options: [
        { text: 'A misconfigured backup job' },
        { text: 'Potential data exfiltration — possibly an insider threat or compromised account' },
        { text: 'Normal system maintenance' },
        { text: 'A DDoS attack' },
      ],
      correctIndex: 1,
      explanation: 'Off-hours large data transfers are a classic indicator of data exfiltration. Investigate as a potential incident immediately.',
      difficulty: 'hard',
    },
    {
      _id: 'fallback-r6-q5',
      round: 6, type: 'multiple-choice',
      question: 'After an incident is resolved, what is the most valuable final step in the incident response lifecycle?',
      options: [
        { text: 'Change all passwords across the organization' },
        { text: 'Conduct a post-incident review (lessons learned) to improve defenses' },
        { text: 'Notify customers immediately about the incident' },
        { text: 'Purchase new security tools' },
      ],
      correctIndex: 1,
      explanation: 'Post-incident reviews identify root causes and improve response procedures. This is the "Lessons Learned" phase of NIST IR lifecycle.',
      difficulty: 'medium',
    },
  ],
};

// ── GET QUESTIONS FOR ROUND ────────────────────────────────────────
const getQuestionsForRound = asyncHandler(async (req, res) => {
  const roundNumber = parseInt(req.params.roundNumber);

  if (!roundNumber || roundNumber < 1 || roundNumber > ROUNDS.TOTAL) {
    throw new ApiError(HTTP.BAD_REQUEST, `Round must be between 1 and ${ROUNDS.TOTAL}.`);
  }

  // Try to fetch from DB first
  const dbQuestions = await Question.aggregate([
    { $match: { round: roundNumber, isActive: true } },
    { $sample: { size: ROUNDS.QUESTIONS_PER_ROUND } },
  ]);

  let questions;
  let usingFallback = false;

  if (dbQuestions.length >= ROUNDS.QUESTIONS_PER_ROUND) {
    // Enough DB questions — strip correct answers before sending
    questions = dbQuestions.map((q) => ({
      _id:       q._id,
      round:     q.round,
      type:      q.type,
      question:  q.question,
      options:   q.options?.map((o) => ({ _id: o._id, text: o.text })),
      difficulty: q.difficulty,
      imageUrl:  q.imageUrl,
      piiFields: q.piiFields,
    }));
  } else {
    // Use fallback questions (answers already stripped from fallback objects)
    usingFallback = true;
    const fallbacks = FALLBACK_QUESTIONS[roundNumber] || [];

    if (fallbacks.length === 0) {
      throw new ApiError(
        HTTP.SERVICE_UNAVAILABLE,
        `No questions available for round ${roundNumber}. Please seed the database.`
      );
    }

    if (dbQuestions.length > 0) {
      logger.warn(`Round ${roundNumber}: only ${dbQuestions.length} DB questions found. Using fallbacks to fill to ${ROUNDS.QUESTIONS_PER_ROUND}.`);
    }

    // Shuffle and pick from fallbacks
    const shuffled = [...fallbacks].sort(() => Math.random() - 0.5);
    questions = shuffled.slice(0, ROUNDS.QUESTIONS_PER_ROUND).map((q) => ({
      _id:       q._id,
      round:     q.round,
      type:      q.type,
      question:  q.question,
      options:   q.options?.map((o) => ({ text: o.text })),  // no correctIndex exposed
      difficulty: q.difficulty,
      imageUrl:  q.imageUrl || null,
      piiFields: q.piiFields || [],
    }));
  }

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      round: roundNumber,
      roundName: ROUNDS.NAMES[roundNumber - 1],
      questions,
      total: questions.length,
      timeLimit: ROUNDS.TIME_LIMIT_SECONDS,
      usingFallback,
    }, `Questions for round ${roundNumber} fetched.`)
  );
});

module.exports = { getQuestionsForRound, FALLBACK_QUESTIONS };
