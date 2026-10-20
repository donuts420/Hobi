import { useState } from 'react';
import { Check, Copy, Download, MapPin, QrCode, Share2, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';
import CodeSlots from '../bits/CodeSlots';
import FlipCard from '../bits/FlipCard';
import './ETicketStub.css';

const sampleTicket = {
  id: 'HOPI-9481-JPR',
  eventTitle: 'Prateek Kuhad — Silhouettes Acoustic India Tour',
  tierName: 'Gold Fan Pit',
  date: 'Sat, 28 Nov 2026',
  time: '07:00 PM onwards',
  venue: 'Jawahar Kala Kendra Amphitheatre',
  city: 'Jaipur, India',
  attendeeName: 'Aarav Sharma',
  gate: 'Gate B (Fan Pit)',
  seat: 'Front Pit • 2 Guests',
  code: 'HOPI-9481',
};

export default function ETicketStub({ ticket }) {
  const [copied, setCopied] = useState(false);
  const data = { ...sampleTicket, ...ticket };

  const front = (
    <div className="ticket-face ticket-front">
      <div className="ticket-front__art">
        {data.eventImage && <img className="ticket-front__image" src={data.eventImage} alt="" />}
        <span className="ticket-front__shade" aria-hidden="true" />
        <div className="ticket-front__wordmark">HOPI <span>LIVE</span></div>
        <div className="ticket-front__side-label">ADMIT ONE · {data.tierName}</div>
      </div>
      <div className="ticket-front__details">
        <div className="ticket-front__main">
          <span className="ticket-eyebrow">EVENT PASS · {data.date}</span>
          <h3>{data.eventTitle}</h3>
          <p><MapPin aria-hidden="true" />{data.venue}{data.city ? ` · ${data.city}` : ''}</p>
        </div>
        <div className="ticket-front__stub">
          <div className="ticket-bars" aria-hidden="true" />
          <span>BOOKING ID</span>
          <strong>{data.id}</strong>
          <small>Tap or press Enter to flip</small>
        </div>
      </div>
      <span className="ticket-front__perforation" aria-hidden="true" />
    </div>
  );

  const back = (
    <div className="ticket-face ticket-back">
      <div className="ticket-back__header">
        <div><span className="ticket-eyebrow">HOPI · EVENT ADMISSION</span><h3>{data.eventTitle}</h3></div>
        <span className="ticket-back__admit">ADMIT ONE</span>
      </div>
      <div className="ticket-back__body">
        <div className="ticket-back__info">
          <div><span>DATE & TIME</span><strong>{data.date}</strong><small>{data.time}</small></div>
          <div><span>VENUE</span><strong>{data.venue}</strong><small>{data.city}</small></div>
          <div><span>TICKET TIER</span><strong>{data.tierName}</strong><small>{data.seat}</small></div>
          <div><span>ATTENDEE</span><strong>{data.attendeeName}</strong><small>{data.gate}</small></div>
        </div>
        <div className="ticket-back__code">
          <div className="ticket-qr" aria-label="Illustrative QR preview"><QrCode aria-hidden="true" /><small>QR PREVIEW</small></div>
          <span>BOOKING REFERENCE</span>
          <strong>{data.id}</strong>
          <ShieldCheck aria-hidden="true" className="ticket-back__verified" />
        </div>
      </div>
      <div className="ticket-back__footer"><CodeSlots code={data.code} label="BOOKING CODE" size="sm" copyable={false} /></div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto font-serif">
      <FlipCard
        front={front}
        back={back}
        axis="y"
        flipOnClick
        draggable={false}
        tilt
        tiltMax={5}
        glare={false}
        hoverScale={1.01}
        perspective={1200}
        width={640}
        height={350}
        radius={18}
        background="#f1eee6"
        color="#211a18"
        shadow
        shadowColor="#000000"
        shadowOpacity={0.35}
        ariaLabel={`Event ticket for ${data.eventTitle}. Activate to flip for pass details.`}
        className="event-ticket-flip"
      />
      <div className="mt-4 flex items-center justify-end gap-3">
        <Button variant="outline" size="sm" icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} onClick={() => { navigator.clipboard?.writeText(data.code); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }}>{copied ? 'Copied' : 'Copy Code'}</Button>
        <Button variant="outline" size="sm" icon={<Share2 className="h-3.5 w-3.5" />} onClick={() => alert(`Share link for ticket #${data.id} copied to clipboard!`)}>Share Pass</Button>
        <Button variant="secondary" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => window.print()}>Download PDF</Button>
      </div>
    </div>
  );
}
