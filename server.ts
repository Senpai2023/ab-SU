import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '10mb' }));

  // In-memory backend database store
  const mockAnnouncements = [
    {
      id: 'ann-2026-001',
      title: 'Afternoon Classes Suspended per Memo-01-1010',
      message: '[CarSU] CLASS SUSPENSION NOTICE: AFTERNOON CLASSES SUSPENDED on 11-20-2026 per Memo-[01-1010]. Online classes proceed as scheduled. Full memo: [https://carsu.edu.ph/memo/01-1010]',
      category: 'SUSPENSION NOTICE',
      subCategory: 'AFTERNOON CLASSES',
      referenceUrl: 'https://carsu.edu.ph/memo/01-1010',
      memoNumber: '01-1010',
      eventDate: '11-20-2026',
      senderId: 'usr-pio-01',
      senderName: 'Officer Justin Cruz',
      sentAt: '2026-10-10T11:45:00Z',
      status: 'sent',
      recipientCount: 4820,
      deliverySuccessCount: 4806,
      deliveryRate: 99.71,
      smsSegments: 1,
      gatewayUsed: 'semaphore',
      targetColleges: ['ALL'],
    },
    {
      id: 'ann-2026-002',
      title: 'Extreme Caution Heat Index Advisory (50°C)',
      message: '[CarSU] HEAT ADVISORY: EXTREME CAUTION level on 10-09-2026, heat index ~ [50]°C. Avoid outdoor activity between 10AM - 3PM. Stay hydrated. Info: [https://pagasa.dost.gov.ph/heat-index]',
      category: 'HEAT ADVISORY',
      subCategory: 'EXTREME CAUTION',
      referenceUrl: 'https://pagasa.dost.gov.ph/heat-index',
      temperature: '50',
      eventDate: '10-09-2026',
      senderId: 'usr-pio-01',
      senderName: 'Officer Justin Cruz',
      sentAt: '2026-10-09T08:15:00Z',
      status: 'sent',
      recipientCount: 4820,
      deliverySuccessCount: 4812,
      deliveryRate: 99.83,
      smsSegments: 1,
      gatewayUsed: 'semaphore',
      targetColleges: ['ALL'],
    },
  ];

  const mockRecipients = [
    {
      id: 'rec-001',
      studentId: '2023-10492',
      fullName: 'Mark Angelo Villanueva',
      phoneNumber: '+63 917 842 1920',
      college: 'CCIS',
      program: 'BS Computer Science',
      yearLevel: 3,
      consentStatus: 'OPTED_IN',
      isActive: true,
      registeredAt: '2026-01-20T10:15:00Z',
    },
    {
      id: 'rec-002',
      studentId: '2024-04183',
      fullName: 'Jasmine Rose Tan',
      phoneNumber: '+63 928 501 8294',
      college: 'CEGS',
      program: 'BS Civil Engineering',
      yearLevel: 2,
      consentStatus: 'OPTED_IN',
      isActive: true,
      registeredAt: '2026-01-22T14:30:00Z',
    },
  ];

  // API: Get announcements
  app.get('/api/announcements', (_req: Request, res: Response) => {
    res.json({ success: true, data: mockAnnouncements });
  });

  // API: Create & broadcast announcement
  app.post('/api/announcements', (req: Request, res: Response) => {
    const { category, subCategory, message, referenceUrl, memoNumber, eventDate, temperature, senderName, senderId } = req.body;
    
    if (!category || !message) {
      return res.status(400).json({ success: false, error: 'Category and message are required' });
    }

    const newRecord = {
      id: `ann-${Date.now().toString(36)}`,
      title: `${category}: ${subCategory || 'Notice'}`,
      message,
      category,
      subCategory: subCategory || 'General',
      referenceUrl: referenceUrl || '',
      memoNumber,
      eventDate,
      temperature,
      senderId: senderId || 'usr-pio-01',
      senderName: senderName || 'Officer Justin Cruz',
      sentAt: new Date().toISOString(),
      status: process.env.SMS_MODE === 'production' ? 'sent' : 'delivered_simulated',
      isSimulated: process.env.SMS_MODE !== 'production',
      recipientCount: 4820,
      deliverySuccessCount: 4807,
      deliveryRate: 99.73,
      smsSegments: Math.ceil(message.length / 160) || 1,
      gatewayUsed: process.env.SMS_MODE === 'production' ? (process.env.SMS_PROVIDER || 'semaphore') : 'simulation',
      targetColleges: ['ALL'],
    };

    mockAnnouncements.unshift(newRecord);
    res.status(201).json({ success: true, data: newRecord });
  });

  // API: Get student recipients
  app.get('/api/recipients', (_req: Request, res: Response) => {
    res.json({ success: true, data: mockRecipients });
  });

  // API: Return raw SQL Schema deliverable
  app.get('/api/schema', (_req: Request, res: Response) => {
    try {
      const schemaPath = path.resolve(__dirname, 'schema.sql');
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      res.type('text/plain').send(sql);
    } catch {
      res.status(500).send('-- Schema file unavailable');
    }
  });

  // API: Health / System Telemetry
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      system: 'Ab!SU Emergency SMS Broadcast Server',
      institution: 'Caraga State University (CarSU)',
      version: '1.0.0',
      time: new Date().toISOString(),
    });
  });

  // Mount Vite development middlewares or serve production build
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ab!SU server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
