/**
 * Hand-written mirror of the Supabase schema (supabase/migrations/0001_init.sql).
 * Once the project is linked, prefer generating this via
 * `supabase gen types typescript` and replacing this file.
 */

export type SubscriptionPlan = "starter" | "pro" | "business" | "enterprise";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete";
export type VideoGenerationStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";
export type CreditTransactionType =
  | "purchase"
  | "subscription_grant"
  | "generation_spend"
  | "refund"
  | "admin_adjustment";
export type HistoryAction =
  | "upload"
  | "generate"
  | "download"
  | "delete"
  | "duplicate"
  | "favorite"
  | "unfavorite";

export interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentRow {
  id: string;
  user_id: string;
  stripe_invoice_id: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface CreditsRow {
  user_id: string;
  balance: number;
  updated_at: string;
}

export interface CreditTransactionRow {
  id: string;
  user_id: string;
  amount: number;
  type: CreditTransactionType;
  related_video_id: string | null;
  created_at: string;
}

export interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface VideoRow {
  id: string;
  user_id: string;
  project_id: string | null;
  source_video_url: string;
  source_duration_seconds: number | null;
  persona: string;
  settings: Record<string, unknown>;
  provider: string;
  provider_job_id: string | null;
  status: VideoGenerationStatus;
  progress: number;
  error_message: string | null;
  result_video_url: string | null;
  thumbnail_url: string | null;
  credits_spent: number;
  created_at: string;
  updated_at: string;
}

export interface FavoriteRow {
  user_id: string;
  video_id: string;
  created_at: string;
}

export interface HistoryRow {
  id: string;
  user_id: string;
  video_id: string | null;
  action: HistoryAction;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CharacterRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  reference_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CharacterImageRow {
  id: string;
  character_id: string;
  user_id: string;
  prompt: string;
  is_reference: boolean;
  status: VideoGenerationStatus;
  provider: string;
  provider_job_id: string | null;
  image_url: string | null;
  error_message: string | null;
  credits_spent: number;
  created_at: string;
}
