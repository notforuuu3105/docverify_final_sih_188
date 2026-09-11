import { VerificationRecord, ComparisonRecord, DocumentRecord } from '../types';

export function generateMockDocumentSvg(
  type:
    | 'aadhaar_authentic'
    | 'aadhaar_tampered'
    | 'pan_authentic'
    | 'pan_tampered'
    | 'passport_authentic'
    | 'passport_tampered'
    | 'visa_authentic'
    | 'invoice_orig'
    | 'invoice_tampered'
    | 'id_authentic'
    | 'cert_forged'
): string {
  let content = '';

  if (type === 'aadhaar_authentic') {
    content = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380" style="background:#ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <rect x="10" y="10" width="580" height="360" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="10" y="10" width="580" height="42" rx="8" fill="#f8fafc"/>
        <rect x="10" y="48" width="580" height="4" fill="#f59e0b"/>
        <text x="300" y="32" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">भारत सरकार | GOVERNMENT OF INDIA</text>
        <text x="30" y="32" font-size="11" font-weight="bold" fill="#1e3a8a">UIDAI</text>
        <rect x="35" y="70" width="120" height="150" rx="4" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
        <circle cx="95" cy="125" r="32" fill="#cbd5e1"/>
        <path d="M55,195 C55,155 135,155 135,195 Z" fill="#94a3b8"/>
        <text x="95" y="212" font-size="8" font-weight="bold" fill="#475569" text-anchor="middle">CITIZEN PHOTO</text>
        <text x="175" y="85" font-size="10" font-weight="bold" fill="#64748b">नाम / Name</text>
        <text x="175" y="105" font-size="15" font-weight="bold" fill="#0f172a">आरव वर्मा / Aarav Verma</text>
        <text x="175" y="130" font-size="10" font-weight="bold" fill="#64748b">जन्म तिथि / DOB</text>
        <text x="175" y="148" font-size="13" font-weight="bold" fill="#0f172a">14/08/1992</text>
        <text x="175" y="173" font-size="10" font-weight="bold" fill="#64748b">लिंग / Gender</text>
        <text x="175" y="191" font-size="13" font-weight="bold" fill="#0f172a">पुरुष / MALE</text>
        <rect x="430" y="70" width="135" height="135" rx="4" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
        <rect x="440" y="80" width="30" height="30" fill="#0f172a"/>
        <rect x="445" y="85" width="20" height="20" fill="#ffffff"/>
        <rect x="450" y="90" width="10" height="10" fill="#0f172a"/>
        <rect x="525" y="80" width="30" height="30" fill="#0f172a"/>
        <rect x="530" y="85" width="20" height="20" fill="#ffffff"/>
        <rect x="535" y="90" width="10" height="10" fill="#0f172a"/>
        <rect x="440" y="165" width="30" height="30" fill="#0f172a"/>
        <rect x="445" y="170" width="20" height="20" fill="#ffffff"/>
        <rect x="450" y="175" width="10" height="10" fill="#0f172a"/>
        <text x="497" y="222" font-size="8" font-weight="bold" fill="#16a34a" text-anchor="middle">✓ SECURE UIDAI QR</text>
        <rect x="35" y="245" width="530" height="55" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
        <text x="300" y="280" font-family="'Courier New', monospace" font-size="24" font-weight="bold" fill="#0f172a" text-anchor="middle" letter-spacing="4">XXXX XXXX 8841</text>
        <text x="300" y="295" font-size="8" fill="#64748b" text-anchor="middle">VID: 9182 0482 1984 2104</text>
        <rect x="10" y="325" width="580" height="45" rx="8" fill="#e11d48"/>
        <text x="300" y="352" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">मेरा आधार, मेरी पहचान (आधार - आम आदमी का अधिकार)</text>
      </svg>
    `;
  } else if (type === 'aadhaar_tampered') {
    content = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380" style="background:#ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <rect x="10" y="10" width="580" height="360" rx="10" fill="#ffffff" stroke="#e11d48" stroke-width="2"/>
        <rect x="10" y="10" width="580" height="42" rx="8" fill="#f8fafc"/>
        <rect x="10" y="48" width="580" height="4" fill="#e11d48"/>
        <text x="300" y="32" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">भारत सरकार | GOVERNMENT OF INDIA</text>
        <text x="30" y="32" font-size="11" font-weight="bold" fill="#1e3a8a">UIDAI</text>
        <rect x="30" y="65" width="130" height="160" rx="4" fill="none" stroke="#e11d48" stroke-dasharray="4,3" stroke-width="2"/>
        <rect x="35" y="70" width="120" height="150" rx="4" fill="#fee2e2" stroke="#e11d48" stroke-width="1.5"/>
        <circle cx="95" cy="125" r="32" fill="#f43f5e"/>
        <path d="M55,195 C55,155 135,155 135,195 Z" fill="#be123c"/>
        <rect x="35" y="195" width="120" height="25" fill="#e11d48"/>
        <text x="95" y="211" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">⚠️ PHOTO SPLICED</text>
        <text x="175" y="85" font-size="10" font-weight="bold" fill="#64748b">नाम / Name</text>
        <text x="175" y="105" font-size="15" font-weight="bold" fill="#0f172a">रोहन शर्मा / Rohan Sharma</text>
        <text x="175" y="130" font-size="10" font-weight="bold" fill="#64748b">जन्म तिथि / DOB</text>
        <rect x="170" y="135" width="110" height="25" fill="#fee2e2" stroke="#e11d48" stroke-width="1.5" rx="3"/>
        <text x="175" y="152" font-size="13" font-weight="bold" fill="#be123c">05/11/2002 ⚠️</text>
        <text x="175" y="180" font-size="10" font-weight="bold" fill="#64748b">लिंग / Gender</text>
        <text x="175" y="198" font-size="13" font-weight="bold" fill="#0f172a">पुरुष / MALE</text>
        <rect x="430" y="70" width="135" height="135" rx="4" fill="#fff1f2" stroke="#e11d48" stroke-width="2"/>
        <rect x="440" y="80" width="30" height="30" fill="#9f1239"/>
        <rect x="525" y="80" width="30" height="30" fill="#9f1239"/>
        <rect x="440" y="165" width="30" height="30" fill="#9f1239"/>
        <text x="497" y="222" font-size="8" font-weight="bold" fill="#e11d48" text-anchor="middle">⚠️ QR CHECKSUM FAIL</text>
        <rect x="35" y="245" width="530" height="55" rx="4" fill="#fff1f2" stroke="#e11d48" stroke-width="1.5"/>
        <text x="300" y="280" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="#be123c" text-anchor="middle" letter-spacing="3">8912 3456 8841 (UNMASKED)</text>
        <text x="300" y="295" font-size="8" font-weight="bold" fill="#e11d48" text-anchor="middle">⚠️ VIOLATION: FULL AADHAAR UNMASKED</text>
        <rect x="10" y="325" width="580" height="45" rx="8" fill="#e11d48"/>
        <text x="300" y="352" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">मेरा आधार, मेरी पहचान (आधार - आम आदमी का अधिकार)</text>
      </svg>
    `;
  } else if (type === 'passport_authentic') {
    content = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" style="background:#f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <rect x="15" y="15" width="570" height="820" rx="8" fill="#fcfcf9" stroke="#334155" stroke-width="2"/>
        <rect x="25" y="25" width="550" height="800" rx="6" fill="#fbfbfa" stroke="#e2e8f0" stroke-width="1"/>
        <rect x="25" y="25" width="550" height="95" fill="#0f172a" rx="4"/>
        <text x="300" y="55" font-size="11" font-weight="bold" fill="#f59e0b" text-anchor="middle" letter-spacing="2">REPUBLIC OF INDIA / भारत गणराज्य</text>
        <text x="300" y="80" font-size="19" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="3">PASSPORT / पासपोर्ट</text>
        <text x="300" y="102" font-size="10" fill="#94a3b8" text-anchor="middle">TYPE/प्रकार: P • COUNTRY CODE/कोड: IND • PASSPORT NO: A9842104</text>
        <rect x="45" y="140" width="160" height="200" rx="4" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.5"/>
        <circle cx="125" cy="210" r="42" fill="#94a3b8"/>
        <path d="M75,310 C75,260 175,260 175,310 Z" fill="#64748b"/>
        <text x="125" y="330" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle">OFFICIAL BIOMETRIC PHOTO</text>
        <text x="230" y="155" font-size="9" font-weight="bold" fill="#64748b">SURNAME / उपनाम</text>
        <text x="230" y="175" font-size="14" font-weight="bold" fill="#0f172a">VERMA</text>
        <text x="230" y="200" font-size="9" font-weight="bold" fill="#64748b">GIVEN NAME(S) / दिया गया नाम</text>
        <text x="230" y="220" font-size="14" font-weight="bold" fill="#0f172a">PRIYA SUNIL</text>
        <text x="230" y="245" font-size="9" font-weight="bold" fill="#64748b">NATIONALITY / राष्ट्रीयता</text>
        <text x="230" y="265" font-size="12" font-weight="bold" fill="#0f172a">INDIAN</text>
        <text x="380" y="245" font-size="9" font-weight="bold" fill="#64748b">SEX / लिंग</text>
        <text x="380" y="265" font-size="12" font-weight="bold" fill="#0f172a">F</text>
        <text x="230" y="290" font-size="9" font-weight="bold" fill="#64748b">DATE OF BIRTH / जन्म तिथि</text>
        <text x="230" y="310" font-size="12" font-weight="bold" fill="#0f172a">22/09/1992</text>
        <text x="380" y="290" font-size="9" font-weight="bold" fill="#64748b">PLACE OF BIRTH / जन्म स्थान</text>
        <text x="380" y="310" font-size="12" font-weight="bold" fill="#0f172a">MUMBAI, MAHARASHTRA</text>
        <text x="45" y="375" font-size="9" font-weight="bold" fill="#64748b">DATE OF ISSUE / जारी करने की तिथि</text>
        <text x="45" y="395" font-size="12" font-weight="bold" fill="#0f172a">22/09/2022</text>
        <text x="230" y="375" font-size="9" font-weight="bold" fill="#64748b">DATE OF EXPIRY / समाप्ति की तिथि</text>
        <text x="230" y="395" font-size="12" font-weight="bold" fill="#0f172a">21/09/2032</text>
        <text x="380" y="375" font-size="9" font-weight="bold" fill="#64748b">PLACE OF ISSUE / जारी करने का स्थान</text>
        <text x="380" y="395" font-size="12" font-weight="bold" fill="#0f172a">RPO MUMBAI</text>
        <rect x="35" y="680" width="530" height="110" fill="#f1f5f9" stroke="#cbd5e1" rx="4"/>
        <text x="50" y="705" font-size="9" font-weight="bold" fill="#475569">ICAO DOC 9303 MACHINE READABLE ZONE (MRZ):</text>
        <text x="50" y="738" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#0f172a" letter-spacing="3.5">P&lt;INDVERMA&lt;&lt;PRIYA&lt;SUNIL&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
        <text x="50" y="768" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#0f172a" letter-spacing="3.5">A9842104&lt;8IND9209224F3209218&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;04</text>
      </svg>
    `;
  } else if (type === 'passport_tampered') {
    content = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" style="background:#f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <rect x="15" y="15" width="570" height="820" rx="8" fill="#fcfcf9" stroke="#334155" stroke-width="2"/>
        <rect x="25" y="25" width="550" height="800" rx="6" fill="#fbfbfa" stroke="#e2e8f0" stroke-width="1"/>
        <rect x="25" y="25" width="550" height="95" fill="#0f172a" rx="4"/>
        <text x="300" y="55" font-size="11" font-weight="bold" fill="#f59e0b" text-anchor="middle" letter-spacing="2">REPUBLIC OF INDIA / भारत गणराज्य</text>
        <text x="300" y="80" font-size="19" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="3">PASSPORT / पासपोर्ट</text>
        <text x="300" y="102" font-size="10" fill="#94a3b8" text-anchor="middle">TYPE/प्रकार: P • COUNTRY CODE/कोड: IND • PASSPORT NO: Z5891402</text>
        <rect x="40" y="135" width="170" height="210" rx="4" fill="none" stroke="#e11d48" stroke-dasharray="4,3" stroke-width="2"/>
        <rect x="45" y="140" width="160" height="200" rx="4" fill="#fee2e2" stroke="#e11d48" stroke-width="1.5"/>
        <circle cx="125" cy="210" r="42" fill="#f43f5e"/>
        <path d="M75,310 C75,260 175,260 175,310 Z" fill="#be123c"/>
        <rect x="45" y="315" width="160" height="25" fill="#e11d48"/>
        <text x="125" y="331" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">⚠️ PHOTO SPLICED</text>
        <text x="230" y="155" font-size="9" font-weight="bold" fill="#64748b">SURNAME / उपनाम</text>
        <text x="230" y="175" font-size="14" font-weight="bold" fill="#0f172a">SHARMA</text>
        <text x="230" y="200" font-size="9" font-weight="bold" fill="#64748b">GIVEN NAME(S) / दिया गया नाम</text>
        <text x="230" y="220" font-size="14" font-weight="bold" fill="#0f172a">RAJESH KUMAR</text>
        <text x="230" y="245" font-size="9" font-weight="bold" fill="#64748b">NATIONALITY / राष्ट्रीयता</text>
        <text x="230" y="265" font-size="12" font-weight="bold" fill="#0f172a">INDIAN</text>
        <text x="380" y="245" font-size="9" font-weight="bold" fill="#64748b">SEX / लिंग</text>
        <text x="380" y="265" font-size="12" font-weight="bold" fill="#0f172a">M</text>
        <text x="230" y="290" font-size="9" font-weight="bold" fill="#64748b">DATE OF BIRTH / जन्म तिथि</text>
        <rect x="226" y="294" width="115" height="22" fill="#fff1f2" stroke="#e11d48" stroke-dasharray="2,2"/>
        <text x="230" y="310" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#e11d48">14/05/1996</text>
        <text x="380" y="290" font-size="9" font-weight="bold" fill="#64748b">PLACE OF BIRTH / जन्म स्थान</text>
        <text x="380" y="310" font-size="12" font-weight="bold" fill="#0f172a">NEW DELHI</text>
        <text x="45" y="375" font-size="9" font-weight="bold" fill="#64748b">DATE OF ISSUE / जारी करने की तिथि</text>
        <text x="45" y="395" font-size="12" font-weight="bold" fill="#0f172a">12/03/2021</text>
        <text x="230" y="375" font-size="9" font-weight="bold" fill="#64748b">DATE OF EXPIRY / समाप्ति की तिथि</text>
        <rect x="226" y="379" width="115" height="22" fill="#fff1f2" stroke="#e11d48" stroke-dasharray="2,2"/>
        <text x="230" y="395" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#e11d48">11/03/2036</text>
        <text x="380" y="375" font-size="9" font-weight="bold" fill="#64748b">PLACE OF ISSUE / जारी करने का स्थान</text>
        <text x="380" y="395" font-size="12" font-weight="bold" fill="#0f172a">RPO DELHI</text>
        <rect x="45" y="440" width="510" height="40" fill="#fee2e2" stroke="#e11d48" stroke-width="1.5" rx="4"/>
        <text x="300" y="465" font-size="11" font-weight="bold" fill="#be123c" text-anchor="middle">🚨 NATIONAL WATCHLIST HIT: LOOKOUT CIRCULAR (LOC) ACTIVE</text>
        <rect x="35" y="680" width="530" height="110" fill="#fff1f2" stroke="#e11d48" stroke-width="1.5" rx="4"/>
        <text x="50" y="705" font-size="9" font-weight="bold" fill="#be123c">⚠️ MRZ CHECKSUM COMPUTATION FAILURE (LINE 2):</text>
        <text x="50" y="738" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#0f172a" letter-spacing="3.5">P&lt;INDSHARMA&lt;&lt;RAJESH&lt;KUMAR&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
        <text x="50" y="768" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#e11d48" letter-spacing="3.5">Z5891402&lt;4IND9605148M3603115&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;06</text>
      </svg>
    `;
  } else if (type === 'invoice_orig') {
    content = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" style="background:#ffffff; font-family: sans-serif;">
        <!-- Header -->
        <rect x="0" y="0" width="600" height="110" fill="#1e293b"/>
        <text x="40" y="55" font-size="24" font-weight="bold" fill="#ffffff">ACME SUPPLY CORP.</text>
        <text x="40" y="80" font-size="12" fill="#94a3b8">Official Commercial Billing Invoice #INV-2026-8891</text>
        <rect x="460" y="35" width="100" height="36" rx="4" fill="#10b981"/>
        <text x="510" y="58" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">VERIFIED ORIGINAL</text>

        <!-- Bill To / Ship To -->
        <text x="40" y="160" font-size="11" font-weight="bold" fill="#64748b">BILLED TO:</text>
        <text x="40" y="185" font-size="14" font-weight="bold" fill="#0f172a">Apex Logistics Global Inc.</text>
        <text x="40" y="205" font-size="12" fill="#334155">450 Enterprise Parkway, Suite 800</text>
        <text x="40" y="225" font-size="12" fill="#334155">Austin, TX 78701, United States</text>

        <text x="360" y="160" font-size="11" font-weight="bold" fill="#64748b">INVOICE DETAILS:</text>
        <text x="360" y="185" font-size="12" fill="#334155"><tspan font-weight="bold">Date:</tspan> August 14, 2026</text>
        <text x="360" y="205" font-size="12" fill="#334155"><tspan font-weight="bold">Due Date:</tspan> September 14, 2026</text>
        <text x="360" y="225" font-size="12" fill="#334155"><tspan font-weight="bold">PO Number:</tspan> PO-994218-A</text>

        <!-- Table Header -->
        <rect x="40" y="270" width="520" height="32" fill="#f1f5f9" rx="4"/>
        <text x="55" y="291" font-size="11" font-weight="bold" fill="#475569">DESCRIPTION</text>
        <text x="320" y="291" font-size="11" font-weight="bold" fill="#475569">QTY</text>
        <text x="410" y="291" font-size="11" font-weight="bold" fill="#475569">UNIT PRICE</text>
        <text x="510" y="291" font-size="11" font-weight="bold" fill="#475569" text-anchor="middle">TOTAL</text>

        <!-- Row 1 -->
        <text x="55" y="335" font-size="13" fill="#1e293b">Enterprise Cloud Security Appliance</text>
        <text x="325" y="335" font-size="13" fill="#1e293b">2</text>
        <text x="410" y="335" font-size="13" fill="#1e293b">$5,500.00</text>
        <text x="510" y="335" font-size="13" font-weight="600" fill="#1e293b" text-anchor="middle">$11,000.00</text>
        <line x1="40" y1="355" x2="560" y2="355" stroke="#e2e8f0" stroke-width="1"/>

        <!-- Row 2 -->
        <text x="55" y="390" font-size="13" fill="#1e293b">Annual Maintenance & Support Tier 3</text>
        <text x="325" y="390" font-size="13" fill="#1e293b">1</text>
        <text x="410" y="390" font-size="13" fill="#1e293b">$3,250.00</text>
        <text x="510" y="390" font-size="13" font-weight="600" fill="#1e293b" text-anchor="middle">$3,250.00</text>
        <line x1="40" y1="410" x2="560" y2="410" stroke="#e2e8f0" stroke-width="1"/>

        <!-- Summary -->
        <rect x="340" y="440" width="220" height="90" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" rx="6"/>
        <text x="355" y="468" font-size="12" fill="#64748b">Subtotal:</text>
        <text x="545" y="468" font-size="12" fill="#334155" text-anchor="end">$14,250.00</text>
        <text x="355" y="493" font-size="12" fill="#64748b">Tax (0.00% Exempt):</text>
        <text x="545" y="493" font-size="12" fill="#334155" text-anchor="end">$0.00</text>
        <line x1="355" y1="504" x2="545" y2="504" stroke="#cbd5e1"/>
        <text x="355" y="522" font-size="13" font-weight="bold" fill="#0f172a">Total Due:</text>
        <text x="545" y="522" font-size="15" font-weight="bold" fill="#0f172a" text-anchor="end">$14,250.00</text>

        <!-- Banking Information -->
        <rect x="40" y="560" width="520" height="95" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" rx="6"/>
        <text x="55" y="585" font-size="12" font-weight="bold" fill="#334155">PAYMENT & WIRE INSTRUCTIONS</text>
        <text x="55" y="608" font-size="11" fill="#64748b">Bank Name: <tspan fill="#0f172a" font-weight="500">JPMorgan Chase Bank, N.A.</tspan></text>
        <text x="55" y="626" font-size="11" fill="#64748b">Routing Transit: <tspan fill="#0f172a" font-weight="500">021000021</tspan> | Account Number: <tspan fill="#0f172a" font-weight="500">9842104471</tspan></text>
        <text x="55" y="644" font-size="11" fill="#64748b">Beneficiary: <tspan fill="#0f172a" font-weight="500">ACME SUPPLY CORPORATE ESCROW</tspan></text>

        <!-- Signatures -->
        <text x="40" y="700" font-size="11" font-weight="bold" fill="#64748b">AUTHORIZED SIGNATURE</text>
        <path d="M40,740 Q60,710 90,735 T140,730 T190,740" fill="none" stroke="#2563eb" stroke-width="2.5"/>
        <line x1="40" y1="755" x2="220" y2="755" stroke="#94a3b8" stroke-width="1"/>
        <text x="40" y="775" font-size="11" fill="#64748b">Marcus Sterling, VP of Finance</text>
      </svg>
    `;
  } else if (type === 'invoice_tampered') {
    content = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" style="background:#ffffff; font-family: sans-serif;">
        <!-- Header -->
        <rect x="0" y="0" width="600" height="110" fill="#1e293b"/>
        <text x="40" y="55" font-size="24" font-weight="bold" fill="#ffffff">ACME SUPPLY CORP.</text>
        <text x="40" y="80" font-size="12" fill="#94a3b8">Official Commercial Billing Invoice #INV-2026-8891</text>
        
        <!-- Newly Added Urgent Watermark (BLUE DIFF) -->
        <rect x="310" y="32" width="250" height="42" rx="4" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
        <text x="435" y="58" font-size="11" font-weight="bold" fill="#1d4ed8" text-anchor="middle">⚡ PRIORITY WIRE TRANSFER REQUIRED</text>

        <!-- Bill To / Ship To -->
        <text x="40" y="160" font-size="11" font-weight="bold" fill="#64748b">BILLED TO:</text>
        <text x="40" y="185" font-size="14" font-weight="bold" fill="#0f172a">Apex Logistics Global Inc.</text>
        <text x="40" y="205" font-size="12" fill="#334155">450 Enterprise Parkway, Suite 800</text>
        <text x="40" y="225" font-size="12" fill="#334155">Austin, TX 78701, United States</text>

        <text x="360" y="160" font-size="11" font-weight="bold" fill="#64748b">INVOICE DETAILS:</text>
        <text x="360" y="185" font-size="12" fill="#334155"><tspan font-weight="bold">Date:</tspan> August 14, 2026</text>
        <text x="360" y="205" font-size="12" fill="#334155"><tspan font-weight="bold">Due Date:</tspan> September 14, 2026</text>
        <text x="360" y="225" font-size="12" fill="#334155"><tspan font-weight="bold">PO Number:</tspan> PO-994218-A</text>

        <!-- Table Header -->
        <rect x="40" y="270" width="520" height="32" fill="#f1f5f9" rx="4"/>
        <text x="55" y="291" font-size="11" font-weight="bold" fill="#475569">DESCRIPTION</text>
        <text x="320" y="291" font-size="11" font-weight="bold" fill="#475569">QTY</text>
        <text x="410" y="291" font-size="11" font-weight="bold" fill="#475569">UNIT PRICE</text>
        <text x="510" y="291" font-size="11" font-weight="bold" fill="#475569" text-anchor="middle">TOTAL</text>

        <!-- Row 1 -->
        <text x="55" y="335" font-size="13" fill="#1e293b">Enterprise Cloud Security Appliance</text>
        <text x="325" y="335" font-size="13" fill="#1e293b">2</text>
        <text x="410" y="335" font-size="13" fill="#1e293b">$5,500.00</text>
        <text x="510" y="335" font-size="13" font-weight="600" fill="#1e293b" text-anchor="middle">$11,000.00</text>
        <line x1="40" y1="355" x2="560" y2="355" stroke="#e2e8f0" stroke-width="1"/>

        <!-- Row 2 -->
        <text x="55" y="390" font-size="13" fill="#1e293b">Annual Maintenance & Support Tier 3</text>
        <text x="325" y="390" font-size="13" fill="#1e293b">1</text>
        <text x="410" y="390" font-size="13" fill="#1e293b">$3,250.00</text>
        <text x="510" y="390" font-size="13" font-weight="600" fill="#1e293b" text-anchor="middle">$3,250.00</text>
        <line x1="40" y1="410" x2="560" y2="410" stroke="#e2e8f0" stroke-width="1"/>

        <!-- Summary (TAMPERED RED VALUE) -->
        <rect x="340" y="440" width="220" height="90" fill="#fff1f2" stroke="#f43f5e" stroke-width="1.5" rx="6"/>
        <text x="355" y="468" font-size="12" fill="#64748b">Subtotal:</text>
        <text x="545" y="468" font-size="12" fill="#be123c" text-anchor="end" font-weight="bold">$142,500.00</text>
        <text x="355" y="493" font-size="12" fill="#64748b">Tax (0.00% Exempt):</text>
        <text x="545" y="493" font-size="12" fill="#334155" text-anchor="end">$0.00</text>
        <line x1="355" y1="504" x2="545" y2="504" stroke="#f43f5e"/>
        <text x="355" y="522" font-size="13" font-weight="bold" fill="#0f172a">Total Due:</text>
        <!-- Tampered 142,500 with font mismatch -->
        <text x="545" y="522" font-size="16" font-family="Courier New, monospace" font-weight="bold" fill="#e11d48" text-anchor="end">$142,500.00</text>

        <!-- Banking Information (TAMPERED YELLOW VALUE) -->
        <rect x="40" y="560" width="520" height="95" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5" rx="6"/>
        <text x="55" y="585" font-size="12" font-weight="bold" fill="#b45309">PAYMENT & WIRE INSTRUCTIONS (ALTERED)</text>
        <text x="55" y="608" font-size="11" fill="#64748b">Bank Name: <tspan fill="#b45309" font-weight="bold">Offshore Cayman Trust Bank Ltd</tspan></text>
        <text x="55" y="626" font-size="11" fill="#64748b">Routing Transit: <tspan fill="#b45309" font-weight="bold">099881122</tspan> | Account: <tspan fill="#b45309" font-weight="bold">11029488319</tspan></text>
        <text x="55" y="644" font-size="11" fill="#64748b">Beneficiary: <tspan fill="#b45309" font-weight="bold">ACME INTERNATIONAL HOLDINGS LTD</tspan></text>

        <!-- Signatures -->
        <text x="40" y="700" font-size="11" font-weight="bold" fill="#64748b">AUTHORIZED SIGNATURE</text>
        <!-- Digital copy-paste signature artifact -->
        <path d="M40,740 Q60,710 90,735 T140,730 T190,740" fill="none" stroke="#2563eb" stroke-width="2.5" opacity="0.8"/>
        <rect x="35" y="715" width="165" height="35" fill="none" stroke="#e11d48" stroke-dasharray="3,3" stroke-width="1"/>
        <line x1="40" y1="755" x2="220" y2="755" stroke="#94a3b8" stroke-width="1"/>
        <text x="40" y="775" font-size="11" fill="#64748b">Marcus Sterling, VP of Finance</text>
      </svg>
    `;
  } else {
    content = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" style="background:#ffffff; font-family: sans-serif;">
        <rect x="30" y="30" width="540" height="790" fill="none" stroke="#334155" stroke-width="3"/>
        <text x="300" y="100" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle">CERTIFICATE OF RECOGNITION</text>
        <text x="300" y="200" font-size="16" fill="#475569" text-anchor="middle">This document is certified for forensic analysis.</text>
      </svg>
    `;
  }

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(content.trim());
}

// Initial mock database store for citizen identity and document verification
export const INITIAL_MOCK_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-aadhaar-auth-01',
    user_id: 'officer-goi-1',
    file_name: 'Aadhaar_Card_Arun_Verma_Authentic.pdf',
    file_size: 345600,
    mime_type: 'application/pdf',
    storage_path: 'officer-goi-1/doc-aadhaar-auth-01/Aadhaar_Card_Arun_Verma_Authentic.pdf',
    sha256_hash: '8f12b28c34f1e091567d4982a176e5c82098b163d04071fa6e921d78294a0999',
    page_count: 1,
    document_type: 'aadhaar',
    subtype: 'aadhaar',
    upload_format: 'pdf',
    uploaded_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    preview_url: generateMockDocumentSvg('aadhaar_authentic'),
  },
  {
    id: 'doc-aadhaar-tamp-02',
    user_id: 'officer-goi-1',
    file_name: 'Aadhaar_Card_Rohan_Sharma_Tampered.pdf',
    file_size: 362100,
    mime_type: 'application/pdf',
    storage_path: 'officer-goi-1/doc-aadhaar-tamp-02/Aadhaar_Card_Rohan_Sharma_Tampered.pdf',
    sha256_hash: '5d318e9a2b704cb5038b3459c34b1a457492c10b7b39d1b090a2938e55e04444',
    page_count: 1,
    document_type: 'aadhaar',
    subtype: 'aadhaar',
    upload_format: 'scanner_flatbed',
    uploaded_at: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    preview_url: generateMockDocumentSvg('aadhaar_tampered'),
  },
  {
    id: 'doc-pass-auth-01',
    user_id: 'officer-goi-1',
    file_name: 'Indian_Passport_A9842104_Authentic.pdf',
    file_size: 512400,
    mime_type: 'application/pdf',
    storage_path: 'officer-goi-1/doc-pass-auth-01/Indian_Passport_A9842104_Authentic.pdf',
    sha256_hash: '9a71b28c34f1e091567d4982a176e5c82098b163d04071fa6e921d78294a0812',
    page_count: 1,
    document_type: 'passport',
    subtype: 'passport_regular',
    upload_format: 'pdf',
    uploaded_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    preview_url: generateMockDocumentSvg('passport_authentic'),
  },
  {
    id: 'doc-pass-tamp-02',
    user_id: 'officer-goi-1',
    file_name: 'Indian_Passport_Z5891402_Tampered.pdf',
    file_size: 524180,
    mime_type: 'application/pdf',
    storage_path: 'officer-goi-1/doc-pass-tamp-02/Indian_Passport_Z5891402_Tampered.pdf',
    sha256_hash: '3f518e9a2b704cb5038b3459c34b1a457492c10b7b39d1b090a2938e55e09f58',
    page_count: 1,
    document_type: 'passport',
    subtype: 'passport_regular',
    upload_format: 'scanner_flatbed',
    uploaded_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    preview_url: generateMockDocumentSvg('passport_tampered'),
  },
];

export const INITIAL_MOCK_VERIFICATIONS: VerificationRecord[] = [
  {
    id: 'verif-aadhaar-tamp-1',
    document_id: 'doc-aadhaar-tamp-02',
    user_id: 'officer-goi-1',
    status: 'completed',
    verdict: 'tampered',
    confidence_score: 98.2,
    tampering_risk_score: 94.0,
    summary: 'Aadhaar Tampering Detected: Photo splicing boundary detected on citizen photograph, date of birth typography shifted, and UIDAI QR code digital signature mismatch.',
    metadata_analysis: {
      pdf_version: '1.6',
      producer: 'Canva / Digital Image Editor',
      tamper_detected: true,
      exif_anomalies: 2,
      stream_hashes_match: false,
    },
    aadhaar_data: {
      aadhaar_number_masked: '8912 3456 8841 (UNMASKED)',
      is_masked: false,
      full_name: 'Rohan Sharma',
      date_of_birth: '05/11/2002',
      gender: 'M',
      address: 'Plot 12, Gali No 4, Anand Vihar, East Delhi, Delhi - 110092',
      qr_code_detected: true,
      qr_code_verified: false,
      qr_signature_valid: false,
      photo_tamper_detected: true,
      dob_tamper_detected: true,
      uidai_watermark_present: true,
    },
    created_at: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    completed_at: new Date(Date.now() - 3600 * 1000 * 3 + 4000).toISOString(),
    checks: [
      {
        id: 'chk-aadh-1',
        verification_id: 'verif-aadhaar-tamp-1',
        check_type: 'digital_tampering',
        title: 'Photo Splicing Boundary Detected',
        description: 'Pixel gradient analysis reveals photo replacement overlay with unnatural bounding seam.',
        status: 'failed',
        score: 18,
        findings: {
          edge_contrast_variance: 4.8,
          compression_ratio_shift: 3.2,
          splicing_detected: true,
        },
        suspicious_regions: [
          {
            id: 'reg-aadh-photo',
            page: 1,
            coordinates: { x: 0.05, y: 0.17, width: 0.22, height: 0.42 },
            severity: 'critical',
            label: 'Photo Replacement Seam',
            description: 'Manipulated citizen photograph inserted over original background.',
          },
        ],
        created_at: new Date().toISOString(),
      },
      {
        id: 'chk-aadh-2',
        verification_id: 'verif-aadhaar-tamp-1',
        check_type: 'font_consistency',
        title: 'DOB Font Kerning Mismatch',
        description: 'The date of birth "05/11/2002" does not match standard UIDAI typography font metrics.',
        status: 'failed',
        score: 24,
        findings: {
          font_family_detected: 'Arial Bold',
          expected_font: 'Noto Sans Devanagari / Arial Regular',
          baseline_shift_pt: 3.1,
        },
        suspicious_regions: [
          {
            id: 'reg-aadh-dob',
            page: 1,
            coordinates: { x: 0.28, y: 0.35, width: 0.20, height: 0.08 },
            severity: 'high',
            label: 'Altered Date of Birth',
            description: 'Year of birth modified from 1992 to 2002 using digital text box insertion.',
          },
        ],
        created_at: new Date().toISOString(),
      },
      {
        id: 'chk-aadh-3',
        verification_id: 'verif-aadhaar-tamp-1',
        check_type: 'metadata_integrity',
        title: 'Aadhaar Masking Privacy Violation',
        description: 'Document contains full 12-digit unmasked Aadhaar number without required regulatory masking.',
        status: 'warning',
        score: 45,
        findings: {
          masked_digits: 0,
          unmasked_digits: 12,
          regulation_status: 'Non-Compliant with Aadhaar Regulations',
        },
        suspicious_regions: [],
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'verif-tamp-1',
    document_id: 'doc-pass-tamp-02',
    user_id: 'officer-mha-1',
    status: 'completed',
    verdict: 'tampered',
    confidence_score: 96.8,
    tampering_risk_score: 93.5,
    summary: 'Critical border interdiction alert: High probability of passport tampering detected. Biometric face mismatch indicates photo replacement; character baseline anomalies on date of birth and checksum failure on ICAO 9303 MRZ line 2.',
    metadata_analysis: {
      pdf_version: '1.7',
      producer: 'Adobe Photoshop 2025 / Spliced Layer',
      tamper_detected: true,
      exif_anomalies: 3,
      stream_hashes_match: false,
    },
    ocr_passport_data: {
      document_number: 'Z5891402',
      document_type_code: 'P',
      issuing_country: 'IND',
      full_name: 'SHARMA, RAJESH KUMAR',
      surname: 'SHARMA',
      given_names: 'RAJESH KUMAR',
      nationality: 'INDIAN',
      date_of_birth: '14/05/1996',
      gender: 'M',
      date_of_expiry: '11/03/2036',
      place_of_issue: 'DELHI',
      mrz_line1: 'P<INDSHARMA<<RAJESH<KUMAR<<<<<<<<<<<<<<<<<<<',
      mrz_line2: 'Z5891402<4IND9605148M3603115<<<<<<<<<<<<<<06',
      mrz_checksum_valid: false,
      standards_compliance: 'Non-Compliant Format',
    },
    biometric_face_match: {
      document_photo_url: '',
      live_booth_photo_url: '',
      similarity_score: 34.1,
      match_status: 'photo_replaced',
      liveness_verified: true,
      confidence_level: 'high',
      facial_landmarks_detected: 68,
      tamper_flags: [
        'Bounding cut-and-paste halo detected around photo perimeter',
        'Facial embedding vector mismatch with live booth camera (Similarity 34.1%)',
        'Quantization step discontinuity in portrait raster area',
      ],
    },
    watchlist_query: {
      interpol_sltd_status: 'FLAGGED',
      interpol_sltd_hits: 1,
      mha_loc_status: 'INTERDICTION_REQUIRED',
      expiry_status: 'VALID',
      days_to_expiry: 3650,
    },
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    completed_at: new Date(Date.now() - 3600 * 1000 * 1.9).toISOString(),
    document: INITIAL_MOCK_DOCUMENTS[1],
    checks: [
      {
        id: 'chk-1',
        verification_id: 'verif-tamp-1',
        check_type: 'digital_tampering',
        title: 'Photo Replacement & Biometric Discontinuity',
        description: 'Spectral ELA analysis and facial landmark boundary verification.',
        status: 'failed',
        score: 24.0,
        findings: {
          photo_spliced: true,
          halo_border_detected: true,
          biometric_similarity: '34.1%',
          face_match_status: 'Mismatch - Impersonation Risk',
        },
        suspicious_regions: [
          {
            id: 'sr-1',
            page: 1,
            coordinates: { x: 0.05, y: 0.16, width: 0.32, height: 0.28 },
            severity: 'critical',
            label: 'Spliced Photo Boundary',
            description: 'Compression disparity and border halo indicate photo replacement over original passport substrate.',
          },
        ],
        created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
      {
        id: 'chk-2',
        verification_id: 'verif-tamp-1',
        check_type: 'layout_alignment',
        title: 'ICAO Doc 9303 MRZ Checksum Integrity',
        description: 'Validates 2-line machine readable zone check digits against parsed birth & expiry dates.',
        status: 'failed',
        score: 18.0,
        findings: {
          mrz_line2_valid: false,
          computed_check_digit: '8',
          encoded_check_digit: '4',
          mismatch_reason: 'Tampered birth year 1996 fails composite modulus 7-3-1 weighting algorithm',
        },
        suspicious_regions: [
          {
            id: 'sr-2',
            page: 1,
            coordinates: { x: 0.05, y: 0.80, width: 0.90, height: 0.14 },
            severity: 'critical',
            label: 'Invalid MRZ Check-Digit',
            description: 'Calculated check digit does not match composite hash of date of birth and expiry.',
          },
        ],
        created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
      {
        id: 'chk-3',
        verification_id: 'verif-tamp-1',
        check_type: 'font_consistency',
        title: 'Date of Birth & Expiry Kerning Drift',
        description: 'Analyzes character spacing, typography weight, and anti-aliasing variations.',
        status: 'failed',
        score: 32.0,
        findings: {
          detected_fonts: ['OCR-B-Standard', 'Courier-Modified'],
          baseline_shift_pt: 2.4,
          kerning_anomaly_score: 91.2,
        },
        suspicious_regions: [
          {
            id: 'sr-3',
            page: 1,
            coordinates: { x: 0.38, y: 0.34, width: 0.25, height: 0.06 },
            severity: 'high',
            label: 'Altered Date of Birth',
            description: 'Font kerning baseline shift of 2.4pt detected on birth year "1996".',
          },
        ],
        created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
      {
        id: 'chk-4',
        verification_id: 'verif-tamp-1',
        check_type: 'metadata_integrity',
        title: 'Metadata & Software Producer Signatures',
        description: 'Examines PDF trailer markers, object xref tables, and modification history.',
        status: 'warning',
        score: 58.0,
        findings: {
          creation_date: '2026-03-12T10:44:19Z',
          modification_producer: 'Adobe Photoshop 24.0 (Windows)',
          discrepancy: 'Document modified with raster graphics editor after government print spooling.',
        },
        suspicious_regions: [],
        created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
    ],
  },
  {
    id: 'verif-auth-2',
    document_id: 'doc-pass-auth-01',
    user_id: 'officer-mha-1',
    status: 'completed',
    verdict: 'authentic',
    confidence_score: 98.8,
    tampering_risk_score: 1.8,
    summary: 'Document verified authentic for border clearance. ICAO Doc 9303 MRZ check digits verified, 97.8% biometric facial match with live passenger camera, uniform security microprinting, and zero Lookout Circular hits.',
    metadata_analysis: {
      pdf_version: '1.7',
      creator: 'Government Security Press / SPMCIL Digital Spooler',
      compression: 'FlateDecode',
      signature_valid: true,
    },
    ocr_passport_data: {
      document_number: 'A9842104',
      document_type_code: 'P',
      issuing_country: 'IND',
      full_name: 'VERMA, PRIYA SUNIL',
      surname: 'VERMA',
      given_names: 'PRIYA SUNIL',
      nationality: 'INDIAN',
      date_of_birth: '22/09/1992',
      gender: 'F',
      date_of_expiry: '21/09/2032',
      place_of_issue: 'MUMBAI',
      mrz_line1: 'P<INDVERMA<<PRIYA<SUNIL<<<<<<<<<<<<<<<<<<<<<',
      mrz_line2: 'A9842104<8IND9209224F3209218<<<<<<<<<<<<<<04',
      mrz_checksum_valid: true,
      standards_compliance: 'ICAO Doc 9303 Compliant',
    },
    biometric_face_match: {
      document_photo_url: '',
      live_booth_photo_url: '',
      similarity_score: 97.8,
      match_status: 'matched',
      liveness_verified: true,
      confidence_level: 'high',
      facial_landmarks_detected: 68,
      tamper_flags: [],
    },
    watchlist_query: {
      interpol_sltd_status: 'CLEARED',
      interpol_sltd_hits: 0,
      mha_loc_status: 'NO_ADVERSE_RECORD',
      expiry_status: 'VALID',
      days_to_expiry: 2200,
    },
    created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    completed_at: new Date(Date.now() - 3600 * 1000 * 3.9).toISOString(),
    document: INITIAL_MOCK_DOCUMENTS[0],
    checks: [
      {
        id: 'chk-auth-1',
        verification_id: 'verif-auth-2',
        check_type: 'digital_tampering',
        title: 'Biometric Face Match & Liveness',
        description: 'Matches extracted photo against live booth camera capture with liveness verification.',
        status: 'passed',
        score: 98.5,
        findings: {
          similarity_score: '97.8%',
          facial_landmarks_matched: 68,
          liveness_confirmed: true,
        },
        suspicious_regions: [],
        created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      },
      {
        id: 'chk-auth-2',
        verification_id: 'verif-auth-2',
        check_type: 'layout_alignment',
        title: 'ICAO Doc 9303 MRZ Validation',
        description: 'Validates 2-line machine readable zone check digits against parsed birth & expiry dates.',
        status: 'passed',
        score: 99.2,
        findings: {
          mrz_checksum_verified: true,
          composite_check_digit: '04 (Valid)',
        },
        suspicious_regions: [],
        created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      },
      {
        id: 'chk-auth-3',
        verification_id: 'verif-auth-2',
        check_type: 'font_consistency',
        title: 'Typography & Microprint Fidelity',
        description: 'Verifies character metrics and microprint resolution against SPMCIL security plate.',
        status: 'passed',
        score: 99.0,
        findings: { embedded_fonts_valid: true, spacing_deviations: 0 },
        suspicious_regions: [],
        created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      },
    ],
  },
];

export const INITIAL_MOCK_COMPARISONS: ComparisonRecord[] = [
  {
    id: 'comp-invoice-99',
    user_id: 'user-demo-1',
    original_document_id: 'doc-orig-101',
    suspected_document_id: 'doc-tamp-202',
    status: 'completed',
    similarity_score: 74.3,
    overall_risk: 'critical',
    text_diff_score: 42.0,
    image_diff_score: 65.0,
    layout_diff_score: 91.0,
    metadata_diff_score: 38.0,
    total_differences: 3,
    created_at: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    completed_at: new Date(Date.now() - 3600 * 1000 * 0.9).toISOString(),
    original_document: INITIAL_MOCK_DOCUMENTS[0],
    suspected_document: INITIAL_MOCK_DOCUMENTS[1],
    differences: [
      {
        id: 'diff-1',
        comparison_id: 'comp-invoice-99',
        page_number: 1,
        difference_type: 'modified_name',
        visual_tag: 'red',
        risk_level: 'critical',
        region_title: 'Invoice Total Payable Amount',
        original_value: '$14,250.00 USD',
        suspected_value: '$142,500.00 USD',
        original_coordinates: { x: 0.56, y: 0.58, width: 0.38, height: 0.05 },
        suspected_coordinates: { x: 0.56, y: 0.58, width: 0.38, height: 0.05 },
        description: 'Value altered by an exact factor of 10. Trailing zero appended using mismatched font metrics.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'diff-2',
        comparison_id: 'comp-invoice-99',
        page_number: 1,
        difference_type: 'altered_signature',
        visual_tag: 'yellow',
        risk_level: 'high',
        region_title: 'Wire Routing & Bank Beneficiary',
        original_value: 'JPMorgan Chase Bank, N.A. (Routing: 021000021)',
        suspected_value: 'Offshore Cayman Trust Bank Ltd (Routing: 099881122)',
        original_coordinates: { x: 0.06, y: 0.66, width: 0.88, height: 0.11 },
        suspected_coordinates: { x: 0.06, y: 0.66, width: 0.88, height: 0.11 },
        description: 'Recipient beneficiary wire instructions replaced with offshore entity.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'diff-3',
        comparison_id: 'comp-invoice-99',
        page_number: 1,
        difference_type: 'added_element',
        visual_tag: 'blue',
        risk_level: 'medium',
        region_title: 'Priority Transfer Banner',
        original_value: 'None (Clean space)',
        suspected_value: 'PRIORITY WIRE TRANSFER REQUIRED',
        original_coordinates: { x: 0.51, y: 0.04, width: 0.42, height: 0.05 },
        suspected_coordinates: { x: 0.51, y: 0.04, width: 0.42, height: 0.05 },
        description: 'Newly inserted urgent watermark banner not present in baseline authentic document.',
        created_at: new Date().toISOString(),
      },
    ],
  },
];
