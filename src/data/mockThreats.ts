import { Threat, ThreatSeverity, ThreatStatus, ThreatDirection } from '../types';

/**
 * Generates realistic mock threat records for IPthreat AI SOC.
 * Unidirectional networks rely on physical hardware data diodes (TX -> RX)
 * bridging high-security enclaves (OT/SCADA/Critical Core) to external networks.
 */
export const THREAT_TEMPLATES = [
  {
    threatType: 'Data Exfiltration',
    protocol: 'UDP',
    direction: 'Unidirectional' as ThreatDirection,
    severity: 'critical' as ThreatSeverity,
    baseRisk: 96,
    baseConfidence: 98,
    sourcePrefix: '10.240.12.',
    destPrefix: '198.51.100.',
    srcPort: 49152,
    dstPort: 514,
    duration: 340,
    volMB: 412.8,
    packets: 284000,
    explanations: [
      { factor: 'Anomalous Optical Egress Rate', description: 'Continuous 1.2 Gbps UDP burst across data diode TX boundary matching encrypted archive signatures.', weight: 95 },
      { factor: 'Entropy Anomaly', description: 'Packet payloads exhibit near-maximum Shannon entropy (7.98/8.00), indicative of compressed exfiltration archives.', weight: 90 },
      { factor: 'Strict One-Way Egress Bypass Attempt', description: 'Payload contains embedded TCP syn-cookies attempting reverse channel synthesis.', weight: 88 },
    ],
    dna: { packetFrequency: 94, portDiversity: 12, destinationSpread: 8, trafficVolume: 96, protocolAnomaly: 85 },
    actions: [
      'Engage upstream switch ACL to clamp source host 10.240.12.18',
      'Inspect optical TX interface counter logs on Diode unit DG-TX-01',
      'Isolate air-gapped engineering workstation via zero-trust policy',
    ]
  },
    {
      threatType: 'Modbus Register Injection',
      protocol: 'MODBUS',
      direction: 'Unidirectional' as ThreatDirection,
      severity: 'critical' as ThreatSeverity,
      baseRisk: 94,
      baseConfidence: 95,
      sourcePrefix: '172.16.4.',
      destPrefix: '10.100.1.',
      srcPort: 50201,
      dstPort: 502,
      duration: 120,
      volMB: 4.6,
      packets: 8400,
      explanations: [
        { factor: 'Critical Function Code (0x05 / Force Single Coil)', description: 'Unauthorized write coil commands sent across optical diode into safety instrumented turbine controller.', weight: 96 },
        { factor: 'PLC Memory Boundary Violation', description: 'Register addresses target non-telemetry holding registers (40001-40016).', weight: 92 },
      ],
      dna: { packetFrequency: 68, portDiversity: 5, destinationSpread: 14, trafficVolume: 22, protocolAnomaly: 98 },
      actions: [
        'Trigger fail-safe hardware interlock on Turbine Subsystem 3',
        'Verify Diode proxy deep-packet inspection (DPI) whitelist rules',
        'Dispatch OT safety field engineer to verify physical coil state',
      ]
    },
    {
      threatType: 'DDoS / Diode Buffer Overflow',
      protocol: 'UDP',
      direction: 'Inbound' as ThreatDirection,
      severity: 'critical' as ThreatSeverity,
      baseRisk: 91,
      baseConfidence: 94,
      sourcePrefix: '203.0.113.',
      destPrefix: '10.0.10.',
      srcPort: 123,
      dstPort: 9998,
      duration: 450,
      volMB: 1840.5,
      packets: 1450000,
      explanations: [
        { factor: 'NTP Amplification Surge', description: 'Volumetric reflected UDP attack attempting to saturate optical receiver FIFO queue.', weight: 94 },
        { factor: 'Hardware Buffer Fill Level', description: 'Physical diode RX buffer threshold reached 98.4%, risking downstream telemetry drop.', weight: 91 },
      ],
      dna: { packetFrequency: 99, portDiversity: 3, destinationSpread: 5, trafficVolume: 99, protocolAnomaly: 78 },
      actions: [
        'Apply rate-limiting token bucket on RX ingress proxy',
        'Drop unvalidated monlist NTP reflection vectors at upstream edge border',
        'Purge non-critical syslog feeds from RX ingest pipe',
      ]
    },
    {
      threatType: 'Botnet C2 Beaconing',
      protocol: 'HTTPS',
      direction: 'Outbound' as ThreatDirection,
      severity: 'high' as ThreatSeverity,
      baseRisk: 84,
      baseConfidence: 91,
      sourcePrefix: '10.10.88.',
      destPrefix: '185.220.101.',
      srcPort: 52310,
      dstPort: 443,
      duration: 1800,
      volMB: 38.2,
      packets: 14200,
      explanations: [
        { factor: 'Strict Periodic Jitter (Interval: 60s +/- 1.2s)', description: 'Deterministic beacon interval characteristic of Cobalt Strike malleable C2 profile.', weight: 89 },
        { factor: 'JA3 / TLS Fingerprint Mismatch', description: 'Client Hello cipher suite hashes match known malicious botnet agent signatures.', weight: 85 },
      ],
      dna: { packetFrequency: 75, portDiversity: 8, destinationSpread: 12, trafficVolume: 35, protocolAnomaly: 88 },
      actions: [
        'Quarantine host 10.10.88.42 via host-based EDR agent',
        'Blacklist C2 destination IP across perimeter firewalls',
        'Dump volatile memory for forensic process tree inspection',
      ]
    },
    {
      threatType: 'Port Scan / Host Sweeping',
      protocol: 'TCP',
      direction: 'Inbound' as ThreatDirection,
      severity: 'medium' as ThreatSeverity,
      baseRisk: 62,
      baseConfidence: 89,
      sourcePrefix: '192.0.2.',
      destPrefix: '10.10.50.',
      srcPort: 38472,
      dstPort: 0, // variable
      duration: 90,
      volMB: 1.8,
      packets: 9800,
      explanations: [
        { factor: 'Rapid SYN Scan Pattern', description: 'Probing sequential industrial SCADA ports (502, 102, 44818, 20000, 4840) without completing handshakes.', weight: 78 },
        { factor: 'Low-and-Slow Horizontal Sweep', description: 'Targeting /24 subnet addresses across DMZ edge switch.', weight: 65 },
      ],
      dna: { packetFrequency: 82, portDiversity: 92, destinationSpread: 84, trafficVolume: 10, protocolAnomaly: 55 },
      actions: [
        'Enforce automated IP ban on edge router for 24 hours',
        'Verify zero listeners exposed on unmanaged secondary VLANs',
      ]
    },
    {
      threatType: 'Brute Force Authentication',
      protocol: 'SSH',
      direction: 'Inbound' as ThreatDirection,
      severity: 'high' as ThreatSeverity,
      baseRisk: 79,
      baseConfidence: 92,
      sourcePrefix: '91.240.118.',
      destPrefix: '10.10.12.',
      srcPort: 44102,
      dstPort: 22,
      duration: 620,
      volMB: 14.4,
      packets: 32000,
      explanations: [
        { factor: 'High Velocity Failed Logins', description: 'Over 140 authentication attempts per minute targeting administrative accounts (root, admin, scada_op).', weight: 88 },
        { factor: 'Dictionary Mutation Signatures', description: 'Wordlist sequence aligns with Hydra automated credential-stuffing toolsets.', weight: 82 },
      ],
      dna: { packetFrequency: 88, portDiversity: 2, destinationSpread: 4, trafficVolume: 24, protocolAnomaly: 62 },
      actions: [
        'Enforce SSH fail2ban threshold (lockout after 3 attempts)',
        'Mandate hardware FIDO2 key for all administrative ingress jump hosts',
      ]
    },
    {
      threatType: 'Reconnaissance',
      protocol: 'ICMP',
      direction: 'Inbound' as ThreatDirection,
      severity: 'low' as ThreatSeverity,
      baseRisk: 38,
      baseConfidence: 78,
      sourcePrefix: '198.18.0.',
      destPrefix: '10.10.100.',
      srcPort: 0,
      dstPort: 0,
      duration: 30,
      volMB: 0.4,
      packets: 620,
      explanations: [
        { factor: 'ICMP Timestamp & Address Mask Request', description: 'Probing system clock synchronization and internal subnet masks.', weight: 45 },
      ],
      dna: { packetFrequency: 30, portDiversity: 1, destinationSpread: 35, trafficVolume: 5, protocolAnomaly: 40 },
      actions: [
        'Disable ICMP Type 13/17 responses on edge gateways',
        'Log source IP for correlation with future intrusion attempts',
      ]
    },
    {
      threatType: 'Covert Timing Channel Leak',
      protocol: 'UDP',
      direction: 'Unidirectional' as ThreatDirection,
      severity: 'high' as ThreatSeverity,
      baseRisk: 86,
      baseConfidence: 93,
      sourcePrefix: '10.240.14.',
      destPrefix: '192.168.99.',
      srcPort: 32001,
      dstPort: 161,
      duration: 1240,
      volMB: 12.1,
      packets: 18900,
      explanations: [
        { factor: 'Inter-Arrival Time Modulation', description: 'Inter-packet arrival time intervals encode binary ASCII bitstreams across the diode barrier.', weight: 92 },
        { factor: 'Jitter Symmetry Analysis', description: 'Statistical distribution of microsecond delays deviates significantly from standard Poisson traffic.', weight: 86 },
      ],
      dna: { packetFrequency: 62, portDiversity: 6, destinationSpread: 4, trafficVolume: 18, protocolAnomaly: 95 },
      actions: [
        'Enable deterministic traffic pacing on diode TX proxy queue',
        'Inject microsecond jitter normalizer on optical transmitter',
      ]
    },
    {
      threatType: 'Anomalous Packet Fragmentation',
      protocol: 'IP',
      direction: 'Unidirectional' as ThreatDirection,
      severity: 'medium' as ThreatSeverity,
      baseRisk: 58,
      baseConfidence: 84,
      sourcePrefix: '10.200.5.',
      destPrefix: '10.50.2.',
      srcPort: 8080,
      dstPort: 8080,
      duration: 85,
      volMB: 6.2,
      packets: 11200,
      explanations: [
        { factor: 'Overlapping Fragment Offsets', description: 'Teardrop-style fragment offset overlaps designed to evade diode proxy reassembly cache.', weight: 76 },
        { factor: 'Illegal FO Bits Set', description: 'Fragment offset headers exhibit non-standard flag states.', weight: 64 },
      ],
      dna: { packetFrequency: 65, portDiversity: 10, destinationSpread: 12, trafficVolume: 25, protocolAnomaly: 72 },
      actions: [
        'Drop non-initial fragments at hardware pre-filter',
        'Verify MTU parity between TX sender and optical interface',
      ]
    },
    {
      threatType: 'Unauthorized Multi-Cast Egress',
      protocol: 'UDP',
      direction: 'Unidirectional' as ThreatDirection,
      severity: 'medium' as ThreatSeverity,
      baseRisk: 52,
      baseConfidence: 82,
      sourcePrefix: '10.240.8.',
      destPrefix: '224.0.0.',
      srcPort: 5353,
      dstPort: 5353,
      duration: 180,
      volMB: 3.2,
      packets: 4100,
      explanations: [
        { factor: 'mDNS Multicast Leakage', description: 'Internal OT hostname resolution broadcast leaking onto unidirectional logging stream.', weight: 68 },
      ],
      dna: { packetFrequency: 45, portDiversity: 4, destinationSpread: 25, trafficVolume: 15, protocolAnomaly: 48 },
      actions: [
        'Filter 224.0.0.251 multicast groups at OT distribution switch',
        'Harden device mDNS responder services on ICS subnets',
      ]
    },
    {
      threatType: 'OPC-UA Secure Channel Tampering',
      protocol: 'TCP',
      direction: 'Unidirectional' as ThreatDirection,
      severity: 'high' as ThreatSeverity,
      baseRisk: 88,
      baseConfidence: 94,
      sourcePrefix: '10.240.20.',
      destPrefix: '10.10.40.',
      srcPort: 48400,
      dstPort: 4840,
      duration: 310,
      volMB: 28.5,
      packets: 42000,
      explanations: [
        { factor: 'Asymmetric Security Token Mismatch', description: 'Replay of stale SecureConversation message IDs across unidirectional link.', weight: 91 },
        { factor: 'Certificate Trust Chain Anomaly', description: 'Self-signed node management certificate not present in local trust store.', weight: 85 },
      ],
      dna: { packetFrequency: 78, portDiversity: 15, destinationSpread: 6, trafficVolume: 42, protocolAnomaly: 89 },
      actions: [
        'Invalidate compromised OPC-UA endpoint session tokens',
        'Rotate node security certificates via central PKI',
      ]
    },
    {
      threatType: 'DNP3 Command Replay',
      protocol: 'UDP',
      direction: 'Unidirectional' as ThreatDirection,
      severity: 'critical' as ThreatSeverity,
      baseRisk: 95,
      baseConfidence: 97,
      sourcePrefix: '10.240.33.',
      destPrefix: '10.30.12.',
      srcPort: 20000,
      dstPort: 20000,
      duration: 95,
      volMB: 8.9,
      packets: 16800,
      explanations: [
        { factor: 'Out-of-Order DNP3 Sequence Counter', description: 'Remote terminal unit (RTU) control sequence number rolled backwards, signaling man-in-the-middle replay.', weight: 95 },
        { factor: 'Direct Operate Command to Substation Breaker', description: 'Select-Before-Operate bypass detected targeting high-voltage circuit breaker.', weight: 97 },
      ],
      dna: { packetFrequency: 85, portDiversity: 4, destinationSpread: 5, trafficVolume: 30, protocolAnomaly: 96 },
      actions: [
        'Assert emergency lockout on Substation Feeder 4',
        'Verify physical relay telemetry against optical diode raw capture',
        'Initiate ICS Incident Response Runbook Level 3',
      ]
    }
  ];

export function generateMockThreats(count = 76): Threat[] {
  const statuses: ThreatStatus[] = ['detected', 'investigating', 'confirmed', 'contained', 'resolved'];

  // Reference base time aligned with September 2026
  const now = new Date('2026-09-11T07:30:00.000Z').getTime();

  const threats: Threat[] = [];

  for (let i = 0; i < count; i++) {
    const templateIndex = i % THREAT_TEMPLATES.length;
    const template = THREAT_TEMPLATES[templateIndex];

    // Distribute timestamps realistically over the past 30 days:
    // i = 0..3: past 1-3 hours
    // i = 4..14: past 4-24 hours
    // i = 15..32: past 2-7 days
    // i = 33..52: past 8-15 days
    // i = 53..75: past 16-30 days
    let minutesAgo = 0;
    if (i < 4) {
      minutesAgo = 15 + i * 35; // 15m to ~2h
    } else if (i < 15) {
      minutesAgo = 180 + (i - 4) * 110; // 3h to 23h
    } else if (i < 33) {
      minutesAgo = 1440 + (i - 15) * 480; // ~1 day to 7 days
    } else if (i < 53) {
      minutesAgo = 10080 + (i - 33) * 580; // ~7 days to 15 days
    } else {
      minutesAgo = 21600 + (i - 53) * 920; // ~15 days to 30 days
    }

    const detectedAt = new Date(now - minutesAgo * 60 * 1000).toISOString();

    // Pick status based on age & index
    let status: ThreatStatus;
    if (i < 4) {
      status = 'detected';
    } else if (i < 12) {
      status = 'investigating';
    } else if (i < 23) {
      status = 'confirmed';
    } else if (i < 39) {
      status = 'contained';
    } else {
      status = 'resolved';
    }

    // IP generation
    const srcHost = (10 + (i * 7) % 240);
    const dstHost = (20 + (i * 11) % 230);
    const sourceIP = `${template.sourcePrefix}${srcHost}`;
    const destinationIP = `${template.destPrefix}${dstHost}`;

    // Calculate dynamic variation
    const riskVariation = ((i * 13) % 9) - 4;
    const riskScore = Math.min(100, Math.max(25, template.baseRisk + riskVariation));

    const confVariation = ((i * 7) % 7) - 3;
    const aiConfidence = Math.min(99, Math.max(65, template.baseConfidence + confVariation));

    // ID formatting e.g. THREAT-8412
    const idNumber = 8400 + i * 19;
    const id = `DG-${idNumber}`;

    const trafficMultiplier = 0.8 + ((i * 17) % 50) / 100;
    const trafficVolumeMB = parseFloat((template.volMB * trafficMultiplier).toFixed(2));
    const packetCount = Math.floor(template.packets * trafficMultiplier);
    const durationSeconds = Math.floor(template.duration * (0.85 + ((i * 23) % 40) / 100));

    // Perturb DNA metrics slightly for natural visual variety
    const dnaPerturb = (val: number, seed: number) => {
      const delta = ((seed * 7) % 11) - 5;
      return Math.min(100, Math.max(0, val + delta));
    };

    const dnaMetrics = {
      packetFrequency: dnaPerturb(template.dna.packetFrequency, i + 1),
      portDiversity: dnaPerturb(template.dna.portDiversity, i + 2),
      destinationSpread: dnaPerturb(template.dna.destinationSpread, i + 3),
      trafficVolume: dnaPerturb(template.dna.trafficVolume, i + 4),
      protocolAnomaly: dnaPerturb(template.dna.protocolAnomaly, i + 5),
    };

    threats.push({
      id,
      detectedAt,
      threatType: template.threatType,
      sourceIP,
      destinationIP,
      protocol: template.protocol,
      direction: template.direction,
      severity: template.severity,
      riskScore,
      aiConfidence,
      status,
      durationSeconds,
      trafficVolumeMB,
      sourcePort: template.srcPort === 0 ? 1024 + (i * 257) % 60000 : template.srcPort,
      destinationPort: template.dstPort === 0 ? 20 + (i * 37) % 1000 : template.dstPort,
      packetCount,
      explanations: template.explanations,
      dnaMetrics,
      recommendedActions: template.actions,
    });
  }

  // Sort descending by detectedAt (newest first)
  return threats.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
}

let liveSequence = 9600;

/**
 * Generates a realistic live incoming threat on the fly to simulate active optical diode DPI
 */
export function generateSingleLiveThreat(): Threat {
  liveSequence += Math.floor(Math.random() * 5) + 3;
  const templateIdx = Math.floor(Math.random() * THREAT_TEMPLATES.length);
  const template = THREAT_TEMPLATES[templateIdx];

  const now = new Date().toISOString();
  const srcHost = Math.floor(Math.random() * 230) + 10;
  const dstHost = Math.floor(Math.random() * 230) + 10;
  const sourceIP = `${template.sourcePrefix}${srcHost}`;
  const destinationIP = `${template.destPrefix}${dstHost}`;

  const riskDelta = Math.floor(Math.random() * 9) - 4;
  const riskScore = Math.min(100, Math.max(30, template.baseRisk + riskDelta));

  const confDelta = Math.floor(Math.random() * 6) - 2;
  const aiConfidence = Math.min(99, Math.max(70, template.baseConfidence + confDelta));

  const volMultiplier = 0.5 + Math.random();
  const trafficVolumeMB = parseFloat((template.volMB * volMultiplier).toFixed(2));
  const packetCount = Math.floor(template.packets * volMultiplier);
  const durationSeconds = Math.floor(Math.random() * 45) + 4;

  const dnaPerturb = (val: number) => {
    const delta = Math.floor(Math.random() * 11) - 5;
    return Math.min(100, Math.max(0, val + delta));
  };

  return {
    id: `DG-${liveSequence}`,
    detectedAt: now,
    threatType: template.threatType,
    sourceIP,
    destinationIP,
    protocol: template.protocol,
    direction: template.direction,
    severity: template.severity,
    riskScore,
    aiConfidence,
    status: 'detected',
    durationSeconds,
    trafficVolumeMB,
    sourcePort: template.srcPort === 0 ? 1024 + Math.floor(Math.random() * 50000) : template.srcPort,
    destinationPort: template.dstPort === 0 ? 21 + Math.floor(Math.random() * 900) : template.dstPort,
    packetCount,
    explanations: template.explanations,
    dnaMetrics: {
      packetFrequency: dnaPerturb(template.dna.packetFrequency),
      portDiversity: dnaPerturb(template.dna.portDiversity),
      destinationSpread: dnaPerturb(template.dna.destinationSpread),
      trafficVolume: dnaPerturb(template.dna.trafficVolume),
      protocolAnomaly: dnaPerturb(template.dna.protocolAnomaly),
    },
    recommendedActions: template.actions,
  };
}

export const INITIAL_MOCK_THREATS: Threat[] = generateMockThreats(76);
