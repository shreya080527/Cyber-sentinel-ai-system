import { AnalysisResult, IndicatorItem, JobScamInput, PhoneCallInput, RiskLevel } from '@/types';

/**
 * AIThreatAnalysisService
 * 
 * Central reusable cybersecurity threat analysis service for Cyber Sentinel AI System.
 * Supports:
 * - URL threat analysis & phishing detection
 * - Fake job/internship scam detection
 * - Recruitment message verification
 * - Phone call scam & suspicious caller analysis (Senior Citizen protection)
 * 
 * Architecture features a modular pattern analysis engine with optional external AI LLM integration capability.
 */
export class AIThreatAnalysisService {
  private static version = '2.0.0';

  /**
   * Analyzes a URL for cybersecurity threats, phishing, deceptive domains, and malware indicators.
   */
  public static async analyzeUrl(inputUrl: string): Promise<AnalysisResult> {
    const trimmedUrl = inputUrl ? inputUrl.trim() : '';

    // URL Validation
    if (!trimmedUrl) {
      throw new Error('Please enter a valid website URL.');
    }

    let parsedUrl: URL;
    try {
      const urlToParse = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `http://${trimmedUrl}`;
      parsedUrl = new URL(urlToParse);
    } catch {
      throw new Error('Please enter a valid website URL format (e.g., https://example.com).');
    }

    const protocol = parsedUrl.protocol.toLowerCase();
    if (protocol !== 'http:' && protocol !== 'https:') {
      throw new Error('Invalid URL protocol. Only HTTP and HTTPS URLs are supported.');
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname.toLowerCase();
    const fullUrl = parsedUrl.href.toLowerCase();

    const indicators: IndicatorItem[] = [];
    let riskScore = 0; // 0 to 100

    // 1. Check for IP Address hostname
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    if (isIpAddress) {
      riskScore += 35;
      indicators.push({
        type: 'IP_HOST_DETECTED',
        title: 'Raw IP Address Hostname',
        description: 'The URL uses a numerical IP address instead of a standard registered domain name. Legitimate services rarely request users to log in via raw IP addresses.',
        severity: 'high',
      });
    }

    // 2. Check for suspicious TLDs
    const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.vip', '.work', '.click', '.cc', '.support', '.buzz', '.monster', '.icu', '.fit', '.rest'];
    const hasSuspiciousTld = suspiciousTlds.some((tld) => hostname.endsWith(tld));
    if (hasSuspiciousTld) {
      riskScore += 25;
      indicators.push({
        type: 'HIGH_RISK_TLD',
        title: 'High-Risk Top-Level Domain',
        description: 'The domain uses an extension frequently associated with low-cost or disposable phishing campaigns.',
        severity: 'medium',
      });
    }

    // 3. Check for Deceptive Brand Typosquatting / Target Brand Keywords
    const sensitiveBrandKeywords = [
      'paypal', 'bank', 'secure', 'login', 'verify', 'account', 'update', 'signin', 'auth', 
      'amazon', 'apple', 'microsoft', 'google', 'netflix', 'chase', 'wellsfargo', 'support',
      'recover', 'wallet', 'crypto', 'binance', 'coinbase', 'payment', 'payout'
    ];

    const matchedKeywords = sensitiveBrandKeywords.filter((kw) => hostname.includes(kw));
    if (matchedKeywords.length >= 2 || (matchedKeywords.length >= 1 && !hostname.endsWith('.com') && !hostname.endsWith('.org') && !hostname.endsWith('.gov') && !hostname.endsWith('.edu'))) {
      riskScore += 30;
      indicators.push({
        type: 'BRAND_TYPOSQUATTING',
        title: 'Deceptive Brand & Security Keywords',
        description: `URL contains sensitive brand/security terms (${matchedKeywords.join(', ')}) in an unverified domain structure, indicating potential credential phishing.`,
        severity: 'high',
      });
    }

    // 4. Excessive Subdomains
    const domainParts = hostname.split('.');
    if (domainParts.length > 3 && !isIpAddress) {
      riskScore += 15;
      indicators.push({
        type: 'EXCESSIVE_SUBDOMAINS',
        title: 'Deceptive Subdomain Depth',
        description: 'The URL uses multiple layered subdomains designed to obscure the actual root target domain.',
        severity: 'medium',
      });
    }

    // 5. Insecure HTTP Protocol for Sensitive Pages
    if (protocol === 'http:' && (pathname.includes('login') || pathname.includes('auth') || pathname.includes('account') || matchedKeywords.length > 0)) {
      riskScore += 20;
      indicators.push({
        type: 'INSECURE_PROTOCOL',
        title: 'Unencrypted HTTP Connection',
        description: 'The destination link uses unencrypted HTTP without SSL encryption on sensitive paths.',
        severity: 'high',
      });
    }

    // 6. URL Shortener Detection
    const shortenerDomains = ['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'buff.ly', 'ow.ly', 'cutt.ly', 'rb.gy'];
    if (shortenerDomains.some((sd) => hostname.includes(sd))) {
      riskScore += 15;
      indicators.push({
        type: 'URL_SHORTENER_OBFUSCATION',
        title: 'Shortened / Masked URL Link',
        description: 'The link is obscured behind a URL redirection service. The final destination domain cannot be verified prior to clicking.',
        severity: 'low',
      });
    }

    // 7. Suspicious Path & Query Parameters
    if (fullUrl.includes('@')) {
      riskScore += 35;
      indicators.push({
        type: 'CREDENTIAL_EMBEDDED_URL',
        title: 'Deceptive User-Auth "@" Syntax',
        description: 'The URL contains an "@" symbol. Modern web browsers interpret text before "@" as authentication credentials, disguising the true hostname.',
        severity: 'critical',
      });
    }

    if (/\.(exe|scr|bat|cmd|vbs|ps1|apk|iso|zip)$/i.test(pathname)) {
      riskScore += 30;
      indicators.push({
        type: 'EXECUTABLE_DOWNLOAD_LINK',
        title: 'Direct Executable/Archive Download Link',
        description: 'The path points directly to an executable binary or compressed archive file which could contain malware or ransomware payload.',
        severity: 'high',
      });
    }

    // Determine Risk Level & Threat Classification
    let riskLevel: RiskLevel = 'SAFE';
    let threatType = 'BENIGN_URL';

    if (riskScore >= 70) {
      riskLevel = 'CRITICAL';
      threatType = 'PHISHING_CREDENTIAL_HARVESTER';
    } else if (riskScore >= 45) {
      riskLevel = 'HIGH';
      threatType = 'SUSPICIOUS_DECEPTIVE_SITE';
    } else if (riskScore >= 25) {
      riskLevel = 'MEDIUM';
      threatType = 'POTENTIALLY_UNWANTED_REDIRECT';
    } else if (riskScore > 0) {
      riskLevel = 'LOW';
      threatType = 'LOW_RISK_INDICATOR';
    }

    if (indicators.length === 0) {
      indicators.push({
        type: 'CLEAN_ANALYSIS',
        title: 'Standard Security Profile',
        description: 'No known phishing patterns, deceptive subdomains, or dangerous executable triggers detected.',
        severity: 'info',
      });
    }

    const confidenceScore = Math.min(99.0, Math.max(65.0, 75.0 + indicators.length * 5.0));

    let explanation = '';
    let recommendation = '';

    switch (riskLevel) {
      case 'CRITICAL':
        explanation = `CRITICAL THREAT DETECTED: The submitted URL (${hostname}) exhibits multiple severe red flags including phishing keyword spoofing and deceptive structural syntax. High probability of malicious intent to steal credentials or personal data.`;
        recommendation = 'DO NOT CLICK OR VISIT THIS LINK. Do not enter any passwords, personal details, or financial credentials. Report this URL to your organization or IT administrator.';
        break;
      case 'HIGH':
        explanation = `HIGH RISK WARNING: The domain (${hostname}) shows strong characteristics of a deceptive site or malicious link. Contains unverified brand terms or suspicious top-level domain extensions.`;
        recommendation = 'Avoid interacting with this link. Verify the legitimate company URL by searching directly through an established search engine or official app.';
        break;
      case 'MEDIUM':
        explanation = `MODERATE RISK NOTICE: The URL includes minor suspicious elements such as redirection masking or deep subdomains. Proceed with caution.`;
        recommendation = 'Exercise caution before logging in or granting permissions on this site. Check for proper SSL certificates (https) and verify domain ownership.';
        break;
      case 'LOW':
        explanation = `LOW RISK NOTICE: Minor non-critical anomalies detected. No explicit malicious patterns confirmed.`;
        recommendation = 'Double check the domain name in your browser address bar before providing personal information.';
        break;
      case 'SAFE':
      default:
        explanation = `CLEAN SECURITY ASSESSMENT: The URL (${hostname}) has been scanned and displays legitimate structural characteristics with standard domain formatting.`;
        recommendation = 'The link appears safe based on structural and pattern analysis. Always maintain safe browsing habits.';
        break;
    }

    return {
      riskLevel,
      confidenceScore: Math.round(confidenceScore * 10) / 10,
      threatType,
      indicators,
      explanation,
      recommendation,
      engineType: 'SECURITY_HEURISTICS_ENGINE',
    };
  }

  /**
   * Analyzes job/internship recruitment details for scam red flags, fraudulent recruiters, fee requests, and fake offers.
   */
  public static async analyzeJobScam(input: JobScamInput): Promise<AnalysisResult> {
    const company = (input.companyName || '').trim();
    const title = (input.jobTitle || '').trim();
    const desc = (input.jobDescription || '').trim();
    const recruiterName = (input.recruiterName || '').trim();
    const recruiterEmail = (input.recruiterEmail || '').trim().toLowerCase();
    const phone = (input.contactNumber || '').trim();
    const message = (input.recruitmentMessage || '').trim();
    const salary = (input.salaryOffer || '').trim();
    const website = (input.websiteUrl || '').trim();
    const details = (input.additionalDetails || '').trim();

    const fullText = `${company} ${title} ${desc} ${recruiterName} ${recruiterEmail} ${phone} ${message} ${salary} ${website} ${details}`.toLowerCase();

    if (!fullText.trim()) {
      throw new Error('Please provide sufficient recruitment information for analysis.');
    }

    const indicators: IndicatorItem[] = [];
    let scamScore = 0;

    // 1. Upfront Payment / Security Deposit Request
    const paymentKeywords = [
      'security deposit', 'equipment fee', 'training fee', 'laptop fee', 'badge fee', 
      'processing fee', 'wire transfer', 'crypto', 'bitcoin', 'zelle', 'venmo', 'cashapp',
      'buy gift card', 'check deposit', 'reimburse equipment', 'pay for software'
    ];

    const matchedPayment = paymentKeywords.filter((kw) => fullText.includes(kw));
    if (matchedPayment.length > 0) {
      scamScore += 45;
      indicators.push({
        type: 'UPFRONT_PAYMENT_DEMAND',
        title: 'Upfront Fee / Payment Request Required',
        description: `Mentions payment or financial transaction keywords (${matchedPayment.join(', ')}). Legitimate employers NEVER ask candidate job applicants to pay fees for background checks, equipment, or badges.`,
        severity: 'critical',
      });
    }

    // 2. Free Public Email Domain for Corporate Recruiter
    const freeDomains = ['@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com', '@aol.com', '@mail.com', '@proton.me', '@yandex.com'];
    if (recruiterEmail) {
      const isFreeEmail = freeDomains.some((fd) => recruiterEmail.endsWith(fd));
      if (isFreeEmail && company && !['freelance', 'private', 'self-employed'].some((kw) => company.toLowerCase().includes(kw))) {
        scamScore += 30;
        indicators.push({
          type: 'FREE_EMAIL_RECRUITER',
          title: 'Public Email Used for Enterprise Hiring',
          description: `Recruiter email (${recruiterEmail}) uses a free public provider instead of an official corporate domain for company "${company}".`,
          severity: 'high',
        });
      }
    }

    // 3. Exclusive Telegram / WhatsApp / Signal Chat Interviewing
    const chatOnlyKeywords = ['telegram', 'whatsapp', 'signal', 'google hangouts', 'text-only interview', 'chat interview', 'no video interview'];
    const matchedChat = chatOnlyKeywords.filter((kw) => fullText.includes(kw));
    if (matchedChat.length > 0) {
      scamScore += 25;
      indicators.push({
        type: 'CHAT_ONLY_INTERVIEW',
        title: 'Chat App / Messaging Only Interview',
        description: `Recruitment relies on informal chat apps (${matchedChat.join(', ')}) without formal video or in-person evaluation.`,
        severity: 'medium',
      });
    }

    // 4. Unrealistic High Salary / Instant Hiring Promises
    const salaryKeywords = ['100/hr', '150/hr', '200/hr', '$5000/week', '$10000/month', 'no experience required', 'instant job offer', 'hired immediately', 'work 1 hour a day'];
    const matchedSalary = salaryKeywords.filter((kw) => fullText.includes(kw));
    if (matchedSalary.length > 0 || (salary && (salary.includes('1000') || salary.includes('5000')) && desc.toLowerCase().includes('entry level'))) {
      scamScore += 25;
      indicators.push({
        type: 'UNREALISTIC_COMPENSATION',
        title: 'Unrealistically High Pay for Minimal Work',
        description: 'Promises unusually high compensation with minimal required skills or immediate hiring without evaluation.',
        severity: 'high',
      });
    }

    // 5. Overly Urgent Wording
    const urgencyKeywords = ['urgent hiring', 'act immediately', 'limited spots', 'apply today or lose spot', 'immediate start mandatory'];
    if (urgencyKeywords.some((kw) => fullText.includes(kw))) {
      scamScore += 15;
      indicators.push({
        type: 'ARTIFICIAL_URGENCY',
        title: 'High Pressure / Urgent Deadline Language',
        description: 'Uses high-pressure psychological tactics to force quick decisions before candidates can verify legitimacy.',
        severity: 'medium',
      });
    }

    // 6. Suspicious / Non-Existent Company Website
    if (website) {
      if (website.includes('bit.ly') || website.includes('tinyurl') || website.includes('.tk') || website.includes('.xyz')) {
        scamScore += 20;
        indicators.push({
          type: 'SUSPICIOUS_JOB_LINK',
          title: 'Suspicious / Masked Job Website Link',
          description: 'The job website link points to a high-risk TLD or shortened URL redirect.',
          severity: 'high',
        });
      }
    }

    // Determine Risk Level & Threat Classification
    let riskLevel: RiskLevel = 'SAFE';
    let threatType = 'LEGITIMATE_JOB_OFFER';

    if (scamScore >= 65) {
      riskLevel = 'CRITICAL';
      threatType = 'CONFIRMED_RECRUITMENT_SCAM';
    } else if (scamScore >= 40) {
      riskLevel = 'HIGH';
      threatType = 'HIGH_RISK_JOB_OFFER';
    } else if (scamScore >= 20) {
      riskLevel = 'MEDIUM';
      threatType = 'SUSPICIOUS_RECRUITMENT_INDICATORS';
    } else if (scamScore > 0) {
      riskLevel = 'LOW';
      threatType = 'LOW_RISK_NOTICE';
    }

    if (indicators.length === 0) {
      indicators.push({
        type: 'CLEAN_RECRUITMENT_PROFILE',
        title: 'Standard Job Profile',
        description: 'No known payment requests, chat-only interview traps, or suspicious recruiter domains detected.',
        severity: 'info',
      });
    }

    const confidenceScore = Math.min(98.0, Math.max(70.0, 80.0 + indicators.length * 4.0));

    let explanation = '';
    let recommendation = '';

    switch (riskLevel) {
      case 'CRITICAL':
        explanation = `HIGHLY LIKELY SCAM: This job/internship listing contains severe red flags, including requests for payment/deposit, public recruiter emails, or chat-only interviews.`;
        recommendation = 'DO NOT SEND MONEY, BANK DETAILS, OR COPIES OF YOUR PASSPORT/ID. Cut off contact with the recruiter immediately. Legitimate companies never charge applicants fees.';
        break;
      case 'HIGH':
        explanation = `SUSPICIOUS OPPORTUNITY: Several warning signs detected. The recruiter contact details or offer promises deviate significantly from standard hiring practices.`;
        recommendation = 'Verify the employer independently by visiting the official corporate website careers page directly. Never conduct interviews solely over text messaging apps.';
        break;
      case 'MEDIUM':
        explanation = `CAUTION ADVISED: Minor recruitment anomalies detected. Ensure all terms are documented in an official written offer letter before proceeding.`;
        recommendation = 'Research the recruiter on LinkedIn and confirm their official corporate email address before sharing sensitive personal details.';
        break;
      case 'LOW':
        explanation = `LOW SCAM PROBABILITY: The listing appears standard, though normal candidate due diligence is recommended.`;
        recommendation = 'Ensure you communicate through official company channels and review job responsibilities carefully.';
        break;
      case 'SAFE':
      default:
        explanation = `LEGITIMATE PROFILE: No fraudulent recruitment patterns detected in the submitted job information.`;
        recommendation = 'Proceed with standard application procedures. Remember to protect your personal identity information until a formal contract is signed.';
        break;
    }

    return {
      riskLevel,
      confidenceScore: Math.round(confidenceScore * 10) / 10,
      threatType,
      indicators,
      explanation,
      recommendation,
      engineType: 'SECURITY_HEURISTICS_ENGINE',
    };
  }

  /**
   * Verifies raw recruitment messages (SMS, WhatsApp, LinkedIn DM) for phishing, job scams, and social engineering.
   */
  public static async analyzeRecruitmentMessage(message: string): Promise<AnalysisResult> {
    if (!message || !message.trim()) {
      throw new Error('Please paste a recruitment message to verify.');
    }

    return this.analyzeJobScam({
      recruitmentMessage: message,
      jobDescription: message,
    });
  }

  /**
   * Analyzes a suspicious phone call, voicemail, or conversation transcript for senior fraud tactics.
   */
  public static async analyzePhoneCall(input: PhoneCallInput): Promise<AnalysisResult> {
    const callerNumber = (input.callerNumber || '').trim();
    const callerName = (input.callerName || '').trim();
    const transcript = (input.transcript || '').trim();
    const context = (input.callContext || '').trim();

    const fullText = `${callerNumber} ${callerName} ${transcript} ${context}`.toLowerCase();

    if (!callerNumber && !transcript && !context) {
      throw new Error('Please provide at least a phone number or conversation details to analyze.');
    }

    const indicators: IndicatorItem[] = [];
    let scamScore = 0;

    // 1. Government / Law Enforcement Impersonation & Arrest Threats
    const govKeywords = [
      'irs', 'internal revenue service', 'police department', 'sheriff', 'arrest warrant', 
      'fbi', 'customs and border', 'social security administration', 'ssn suspended', 
      'lawsuit filed', 'federal warrant', 'jail time', 'arrest you today'
    ];
    const matchedGov = govKeywords.filter((kw) => fullText.includes(kw));
    if (matchedGov.length > 0) {
      scamScore += 45;
      indicators.push({
        type: 'GOVERNMENT_IMPERSONATION_THREAT',
        title: 'Government / Law Enforcement Impersonation',
        description: `Caller claims to represent official authorities (${matchedGov.join(', ')}) with threats of arrest or legal action. Official agencies NEVER demand immediate payment over the telephone.`,
        severity: 'critical',
      });
    }

    // 2. Bank Fraud / Account Compromise Urgency
    const bankKeywords = [
      'bank fraud department', 'account frozen', 'unauthorized charge', 'transfer to safe account',
      'compromised checking', 'verify your pin', 'online banking password', 'move your funds'
    ];
    const matchedBank = bankKeywords.filter((kw) => fullText.includes(kw));
    if (matchedBank.length > 0) {
      scamScore += 40;
      indicators.push({
        type: 'BANK_ACCOUNT_TAKEOVER_SCAM',
        title: 'Urgent Bank / Account Compromise Claim',
        description: `Caller demands immediate transfer to a "safe" account or asks for banking PIN/passwords (${matchedBank.join(', ')}). Your bank will NEVER ask you to transfer funds to protect them.`,
        severity: 'critical',
      });
    }

    // 3. Tech Support & Remote Desktop Software Traps
    const techKeywords = [
      'microsoft support', 'windows virus', 'computer infected', 'anydesk', 'teamviewer', 
      'quicksupport', 'ultraviewer', 'download software to fix', 'allow remote access', 'call from apple support'
    ];
    const matchedTech = techKeywords.filter((kw) => fullText.includes(kw));
    if (matchedTech.length > 0) {
      scamScore += 40;
      indicators.push({
        type: 'TECH_SUPPORT_REMOTE_ACCESS',
        title: 'Fake Tech Support & Remote Control Demand',
        description: `Caller instructs you to install remote desktop software (${matchedTech.join(', ')}) to remove non-existent viruses. Granting access allows attackers to take over your PC and steal banking data.`,
        severity: 'high',
      });
    }

    // 4. Grandchild / Family Emergency Impostor Scam
    const familyKeywords = [
      'grandma', 'grandpa', 'in jail', 'car accident', 'need bail money', 'bonded out', 
      'please don\'t tell mom', 'don\'t tell my parents', 'lawyer needs cash'
    ];
    const matchedFamily = familyKeywords.filter((kw) => fullText.includes(kw));
    if (matchedFamily.length > 0) {
      scamScore += 50;
      indicators.push({
        type: 'GRANDCHILD_EMERGENCY_IMPOSTOR',
        title: 'Grandparent / Family Emergency Impersonation',
        description: `Uses emotional distress claiming a relative is in jail or hospitalized and asks you not to contact other family members. Always verify directly with family before sending funds.`,
        severity: 'critical',
      });
    }

    // 5. Irreversible Payment Methods (Gift Cards, Crypto ATM, Wire)
    const paymentKeywords = [
      'gift card', 'target gift card', 'apple card', 'google play card', 'walmart card', 
      'bitcoin machine', 'crypto atm', 'wire transfer', 'western union', 'moneygram', 'cash in envelope'
    ];
    const matchedPayment = paymentKeywords.filter((kw) => fullText.includes(kw));
    if (matchedPayment.length > 0) {
      scamScore += 45;
      indicators.push({
        type: 'UNTRACEABLE_PAYMENT_DEMAND',
        title: 'Demanding Gift Cards or Crypto ATM Payment',
        description: `Instructs you to buy gift cards or visit a cryptocurrency kiosk (${matchedPayment.join(', ')}). No legitimate business, utility, or government agency accepts gift cards as payment.`,
        severity: 'critical',
      });
    }

    // 6. Extreme Psychological Pressure & Secrecy Tactics
    const pressureKeywords = [
      'do not hang up', 'stay on the phone', 'don\'t talk to anyone', 'confidential order', 
      'act immediately', 'within thirty minutes', 'immediate arrest'
    ];
    const matchedPressure = pressureKeywords.filter((kw) => fullText.includes(kw));
    if (matchedPressure.length > 0) {
      scamScore += 25;
      indicators.push({
        type: 'COERCIVE_SECRECY_TACTICS',
        title: 'High-Pressure Secrecy & Urgency Tactics',
        description: 'Caller uses intimidation, forbids you from hanging up, or demands you hide the situation from family.',
        severity: 'high',
      });
    }

    // 7. Suspicious Caller Number Format / Known Scam Patterns
    if (callerNumber) {
      const cleanNum = callerNumber.replace(/\D/g, '');
      if (cleanNum.startsWith('800') || cleanNum.startsWith('888') || cleanNum.startsWith('877') || cleanNum.startsWith('866')) {
        scamScore += 10;
        indicators.push({
          type: 'TOLL_FREE_OUTBOUND_CALL',
          title: 'Toll-Free Outbound Caller ID',
          description: 'Incoming calls displaying toll-free numbers are frequently spoofed by overseas automated robocall centers.',
          severity: 'low',
        });
      }
    }

    // Determine Risk Level & Threat Classification
    let riskLevel: RiskLevel = 'SAFE';
    let threatType = 'STANDARD_PHONE_CALL';

    if (scamScore >= 65) {
      riskLevel = 'CRITICAL';
      threatType = 'CONFIRMED_PHONE_FRAUD_SCAM';
    } else if (scamScore >= 40) {
      riskLevel = 'HIGH';
      threatType = 'HIGH_RISK_SUSPICIOUS_CALL';
    } else if (scamScore >= 20) {
      riskLevel = 'MEDIUM';
      threatType = 'POTENTIALLY_UNWANTED_ROBOCALL';
    } else if (scamScore > 0) {
      riskLevel = 'LOW';
      threatType = 'LOW_RISK_CALL_INDICATOR';
    }

    if (indicators.length === 0) {
      indicators.push({
        type: 'CLEAN_CALL_PROFILE',
        title: 'No Immediate Scam Indicators',
        description: 'No known high-pressure arrest threats, gift card demands, or remote desktop software prompts detected.',
        severity: 'info',
      });
    }

    const confidenceScore = Math.min(99.0, Math.max(70.0, 78.0 + indicators.length * 4.5));

    let explanation = '';
    let recommendation = '';

    switch (riskLevel) {
      case 'CRITICAL':
        explanation = `DANGEROUS SCAM CALL DETECTED: This call exhibits severe indicators of elder financial fraud, such as law enforcement impersonation, grandchild emergency claims, or gift card/crypto payment demands.`;
        recommendation = 'HANG UP THE PHONE IMMEDIATELY. Do not provide any bank numbers, PINs, or gift card codes. Notify a trusted family member or emergency contact right away.';
        break;
      case 'HIGH':
        explanation = `HIGH RISK WARNING: The caller is utilizing high-pressure urgency tactics, requesting remote access to your computer, or claiming an unverified account problem.`;
        recommendation = 'Hang up and call the official institution directly using the telephone number on the back of your bank card or utility statement.';
        break;
      case 'MEDIUM':
        explanation = `SUSPICIOUS ACTIVITY: This call contains unusual elements like toll-free spoofing or unsolicited marketing urgency.`;
        recommendation = 'Do not confirm your name, address, or financial details. Ask for written verification via official postal mail.';
        break;
      case 'LOW':
        explanation = `LOW RISK NOTICE: Minor non-critical indicators detected, but no aggressive extortion patterns found.`;
        recommendation = 'Never share two-factor authentication codes or passwords over the phone.';
        break;
      case 'SAFE':
      default:
        explanation = `NORMAL CALL PROFILE: The analyzed call details show standard communication patterns without predatory scam keywords.`;
        recommendation = 'Stay vigilant. If a caller ever asks for banking codes, gift cards, or money transfers in the future, hang up immediately.';
        break;
    }

    return {
      riskLevel,
      confidenceScore: Math.round(confidenceScore * 10) / 10,
      threatType,
      indicators,
      explanation,
      recommendation,
      engineType: 'SECURITY_HEURISTICS_ENGINE',
      familyAlertRecommended: riskLevel === 'HIGH' || riskLevel === 'CRITICAL',
    };
  }
}
