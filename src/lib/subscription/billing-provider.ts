import type { SubscriptionPlan } from "~/types/database";

/**
 * ============================================================================
 * BILLING PROVIDER ABSTRACTION & INDONESIAN PAYMENT GATEWAY AUDIT
 * ============================================================================
 *
 * Target Monetira Plan: Pro @ Rp5.000 / minggu
 *
 * CRITICAL ANALYSIS OF INDONESIAN PAYMENT ECOSYSTEM:
 * 1. Midtrans:
 *    - Supported Methods: QRIS, Virtual Accounts (BCA, Mandiri, BNI, BRI, Permata), GoPay, ShopeePay, Cards.
 *    - Recurring Capability: Midtrans Snap DOES NOT support automatic recurring billing on QRIS or VA.
 *      Automatic recurring is only possible via Credit Card Tokenization or GoPay Tokenization (requiring custom enterprise aggregator agreement).
 *    - Minimum Fees: Midtrans charges Rp2.000 - Rp4.000 per VA transaction or 0.7% on QRIS (min. fee may apply depending on tier).
 *      A Rp5.000 transaction with Rp3.000 - Rp4.000 flat VA fee yields an unsustainable 60-80% fee burn.
 *
 * 2. Xendit:
 *    - Subscriptions API exists for Cards and e-Wallets (OVO, DANA via tokenization).
 *    - However, micro-charges of Rp5.000 weekly face strict processing fees and e-wallet OTP friction.
 *
 * 3. Mayar / Tripay:
 *    - Mayar specializes in Indonesian SaaS subscriptions and payment links with QRIS/VA support, but recurring QRIS typically requires manual weekly user approval/push notice because BI (Bank Indonesia) QRIS standard does not yet natively support unilateral pull-debit for standard consumers without direct debit mandates.
 *
 * ARCHITECTURAL DECISION:
 * Rather than binding the application tightly to a single gateway or creating a "fake" simulated checkout,
 * we establish a strict provider-agnostic interface (`BillingProvider`).
 * Real billing will be activated once server authentication and database models are deployed.
 */

export interface CheckoutParams {
  userId: string;
  userEmail: string;
  plan: SubscriptionPlan;
  billingCycle: "WEEKLY";
  amount: number; // In IDR (e.g. 5000)
  currency: "IDR";
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  provider: string;
  checkoutUrl?: string;
  referenceId: string;
  expiresAt: string;
  pendingSetupReason?: string;
}

export interface WebhookEvent {
  id: string;
  eventType: string;
  provider: string;
  rawPayload: string;
  signature: string;
  timestamp: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  status: "SUCCESS" | "FAILED" | "PENDING";
  referenceId: string;
  orderId: string;
  amount: number;
  plan: SubscriptionPlan;
  paidAt?: string;
  errorMessage?: string;
}

export interface CancelResult {
  success: boolean;
  message?: string;
}

/**
 * Universal Billing Provider Contract
 */
export interface BillingProvider {
  readonly name: string;
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
  verifyWebhookSignature(
    rawBody: string,
    signature: string,
    secret: string,
  ): boolean;
  handleWebhook(event: WebhookEvent): Promise<PaymentVerificationResult>;
  cancelSubscription(providerSubId: string): Promise<CancelResult>;
}

/**
 * Pending / Deferred Billing Provider Implementation
 *
 * Explicitly guards against fake checkouts while providing the exact architectural contract
 * that Midtrans/Xendit adapters will implement once backend infrastructure is ready.
 */
export class DeferredBillingProvider implements BillingProvider {
  readonly name = "Monetira Deferred Provider (Awaiting Auth/Database Backend)";

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    return {
      provider: this.name,
      referenceId: `ref_pending_${params.userId}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      pendingSetupReason:
        "Integrasi Payment Gateway ditangguhkan hingga server-side Authentication dan Database PostgreSQL siap di Phase berikutnya.",
    };
  }

  verifyWebhookSignature(
    _rawBody: string,
    _signature: string,
    _secret: string,
  ): boolean {
    // Signature verification cannot be performed without a live provider secret
    return false;
  }

  async handleWebhook(
    _event: WebhookEvent,
  ): Promise<PaymentVerificationResult> {
    return {
      verified: false,
      status: "FAILED",
      referenceId: "",
      orderId: "",
      amount: 0,
      plan: "FREE",
      errorMessage: "Deferred provider does not accept live webhook triggers.",
    };
  }

  async cancelSubscription(_providerSubId: string): Promise<CancelResult> {
    return {
      success: false,
      message: "Tidak ada provider pembayaran aktif yang terhubung.",
    };
  }
}
