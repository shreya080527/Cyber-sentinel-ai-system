const { AIThreatAnalysisService } = require('../src/lib/services/aiThreatAnalysisService');

async function testEngine() {
  console.log('=== TEST 1: Safe URL Analysis ===');
  const safeRes = await AIThreatAnalysisService.analyzeUrl('https://google.com');
  console.log('Google.com result:', safeRes.riskLevel, 'Confidence:', safeRes.confidenceScore);
  if (safeRes.riskLevel !== 'SAFE' && safeRes.riskLevel !== 'LOW') {
    throw new Error('Safe URL test failed!');
  }

  console.log('\n=== TEST 2: Phishing URL Analysis ===');
  const phishRes = await AIThreatAnalysisService.analyzeUrl('http://login-verify-paypal-secure-bank.tk/signin');
  console.log('Phishing result:', phishRes.riskLevel, 'Threat Type:', phishRes.threatType);
  if (phishRes.riskLevel !== 'CRITICAL' && phishRes.riskLevel !== 'HIGH') {
    throw new Error('Phishing URL test failed!');
  }

  console.log('\n=== TEST 3: Upfront Payment Job Scam Analysis ===');
  const scamRes = await AIThreatAnalysisService.analyzeJobScam({
    companyName: 'Global Remote Services',
    jobTitle: 'Data Entry Assistant',
    recruiterEmail: 'careers.globaltech@gmail.com',
    salaryOffer: '$150/hr no experience',
    jobDescription: 'Conduct chat interview on Telegram t.me/recruiter. Send $200 equipment deposit wire transfer for background badge check.',
  });
  console.log('Job Scam result:', scamRes.riskLevel, 'Confidence:', scamRes.confidenceScore);
  if (scamRes.riskLevel !== 'CRITICAL' && scamRes.riskLevel !== 'HIGH') {
    throw new Error('Job scam test failed!');
  }

  console.log('\n=== ALL UNIT TESTS PASSED SUCCESSFULLY! ===');
}

testEngine().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
