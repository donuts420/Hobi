import React from 'react';
import { Landmark, ShieldCheck, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

/**
 * PayoutSettingsTab serves as an honest, informational placeholder for future payout setup.
 * Strictly avoids collecting bank details, account numbers, IFSC codes, PAN/GSTIN, or fabricating balances.
 */
export default function PayoutSettingsTab({ onNavigate }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-elevatedBorder">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-softButter">
            Payout & Bank Settlements
          </h3>
          <p className="text-xs sm:text-sm text-mutedClay mt-1">
            Configure direct bank settlements and revenue payouts for ticketed shows.
          </p>
        </div>

        <Badge variant="clay" size="sm">
          Coming Soon
        </Badge>
      </div>

      {/* Informational Placeholder Container */}
      <div className="bg-darkRoast/70 border border-elevatedBorder rounded-2xl p-8 sm:p-10 space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-elevated border border-clayBrown/60 flex items-center justify-center text-softButter">
          <Landmark className="w-6 h-6 text-terracotta" />
        </div>

        <div className="space-y-2">
          <h4 className="font-serif font-bold text-lg text-softButter">
            Secure Payout Onboarding in Development
          </h4>
          <p className="text-xs sm:text-sm text-mutedClay leading-relaxed max-w-2xl">
            Bank account integration and automated settlement workflows will become active when secure payment provider onboarding is connected. Organizers will be able to verify banking coordinates, review settlement batches, and automate post-event payouts.
          </p>
        </div>

        {/* Feature Preview Cards (Informational Only) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-elevated border border-elevatedBorder space-y-2">
            <div className="flex items-center gap-2 text-softButter font-serif font-bold text-xs">
              <Clock className="w-4 h-4 text-terracotta shrink-0" />
              <span>Automated Payouts</span>
            </div>
            <p className="text-[11px] text-mutedClay leading-relaxed">
              Ticket revenues scheduled for direct bank transfer following event conclusion.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-elevated border border-elevatedBorder space-y-2">
            <div className="flex items-center gap-2 text-softButter font-serif font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-terracotta shrink-0" />
              <span>Escrow Security</span>
            </div>
            <p className="text-[11px] text-mutedClay leading-relaxed">
              Secure buyer transaction protection ensuring seamless attendee refund handling.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-elevated border border-elevatedBorder space-y-2">
            <div className="flex items-center gap-2 text-softButter font-serif font-bold text-xs">
              <ArrowUpRight className="w-4 h-4 text-terracotta shrink-0" />
              <span>GST & Tax Invoices</span>
            </div>
            <p className="text-[11px] text-mutedClay leading-relaxed">
              Automated platform fee invoices and settlement statements for accounting.
            </p>
          </div>
        </div>

        {/* Status Notice */}
        <div className="p-3.5 rounded-xl bg-elevated/60 border border-elevatedBorder text-xs text-mutedClay flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-terracotta shrink-0" />
          <span>
            Payout configuration is currently unavailable. No financial credentials or bank details are collected at this stage.
          </span>
        </div>

        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            icon={<ArrowUpRight className="w-4 h-4" />}
            onClick={() => onNavigate?.('organiser-events')}
          >
            Continue to Hosted Events
          </Button>
        </div>
      </div>
    </div>
  );
}
