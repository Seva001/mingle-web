/** Minimal generated-style types for the integrated Batch B–F schema. Regenerate from Supabase after migrations are applied. */
export type AccountStatus = "pending" | "active" | "suspended" | "blocked_underage" | "deleted";
export type AgeAssuranceOutcome = "not_started" | "pending" | "passed" | "failed" | "error";

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          status: AccountStatus;
          age_assurance_outcome: AgeAssuranceOutcome;
          age_assurance_checked_at: string | null;
          market_code: string | null;
          locale: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          status?: AccountStatus;
          age_assurance_outcome?: AgeAssuranceOutcome;
          age_assurance_checked_at?: string | null;
          market_code?: string | null;
          locale?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          status?: AccountStatus;
          age_assurance_outcome?: AgeAssuranceOutcome;
          age_assurance_checked_at?: string | null;
          market_code?: string | null;
          locale?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: { account_id: string; display_name: string | null; gender: "woman" | "man" | "non_binary" | null; city: string | null; country: string | null; bio: string | null; relationship_intention: "long_term" | "marriage" | "dating_open" | "friendship_first" | null; interests: string[]; profile_status: "draft" | "complete"; visibility: "visible" | "hidden"; created_at: string; updated_at: string };
        Insert: { account_id: string; display_name?: string | null; gender?: "woman" | "man" | "non_binary" | null; city?: string | null; country?: string | null; bio?: string | null; relationship_intention?: "long_term" | "marriage" | "dating_open" | "friendship_first" | null; interests?: string[]; visibility?: "visible" | "hidden"; created_at?: string; updated_at?: string };
        Update: { account_id?: string; display_name?: string; gender?: "woman" | "man" | "non_binary" | null; city?: string | null; country?: string | null; bio?: string | null; relationship_intention?: "long_term" | "marriage" | "dating_open" | "friendship_first" | null; interests?: string[]; visibility?: "visible" | "hidden"; updated_at?: string };
        Relationships: [];
      };
      profile_photos: {
        Row: { id: string; account_id: string; storage_path: string; position: number; moderation_state: "pending" | "approved" | "rejected"; created_at: string };
        Insert: { id?: string; account_id: string; storage_path: string; position: number; moderation_state?: "pending" | "approved" | "rejected"; created_at?: string };
        Update: { id?: string; account_id?: string; storage_path?: string; position?: number; moderation_state?: "pending" | "approved" | "rejected" };
        Relationships: [];
      };
      preferences: {
        Row: { account_id: string; interested_in: string[]; age_min: number; age_max: number; max_distance_km: number | null; updated_at: string };
        Insert: { account_id: string; interested_in: string[]; age_min: number; age_max: number; max_distance_km?: number | null; updated_at?: string };
        Update: { account_id?: string; interested_in?: string[]; age_min?: number; age_max?: number; max_distance_km?: number | null; updated_at?: string };
        Relationships: [];
      };
      compatibility_answers: {
        Row: { account_id: string; question_id: string; option_id: string; updated_at: string };
        Insert: { account_id: string; question_id: string; option_id: string; updated_at?: string };
        Update: { account_id?: string; question_id?: string; option_id?: string; updated_at?: string };
        Relationships: [];
      };
      market_config: {
        Row: {
          code: string;
          enabled: boolean;
          minimum_age: number;
          display_name: string;
          default_locale: string;
          supported_locales: string[];
          default_timezone: string;
          terms_version: string;
          privacy_version: string;
          age_assurance_policy: string;
          allow_cross_market: boolean;
          retention_days: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          enabled?: boolean;
          minimum_age?: number;
          display_name?: string;
          default_locale?: string;
          supported_locales?: string[];
          default_timezone?: string;
          terms_version?: string;
          privacy_version?: string;
          age_assurance_policy?: string;
          allow_cross_market?: boolean;
          retention_days?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          enabled?: boolean;
          minimum_age?: number;
          display_name?: string;
          default_locale?: string;
          supported_locales?: string[];
          default_timezone?: string;
          terms_version?: string;
          privacy_version?: string;
          age_assurance_policy?: string;
          allow_cross_market?: boolean;
          retention_days?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      market_consent_records: {
        Row: { id: number; account_id: string; market_code: string; consent_type: "terms" | "privacy"; policy_version: string; locale: string; accepted_at: string; created_at: string };
        Insert: { id?: never; account_id: string; market_code: string; consent_type: "terms" | "privacy"; policy_version: string; locale: string; accepted_at?: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      conversations: {
        Row: { id: string; connection_id: string | null; member_one: string; member_two: string; created_at: string; last_message_at: string | null };
        Insert: { id?: string; connection_id?: string | null; member_one: string; member_two: string; created_at?: string; last_message_at?: string | null };
        Update: { connection_id?: string | null; last_message_at?: string | null };
        Relationships: [];
      };
      conversation_members: {
        Row: { conversation_id: string; account_id: string; joined_at: string };
        Insert: { conversation_id: string; account_id: string; joined_at?: string };
        Update: never;
        Relationships: [];
      };
      messages: {
        Row: { id: string; conversation_id: string; sender_id: string; body: string; created_at: string };
        Insert: { id?: string; conversation_id: string; sender_id: string; body: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      conversation_reads: {
        Row: { conversation_id: string; account_id: string; last_read_at: string };
        Insert: { conversation_id: string; account_id: string; last_read_at?: string };
        Update: { last_read_at?: string };
        Relationships: [];
      };
      notification_preferences: {
        Row: { account_id: string; in_app_messages: boolean; email_messages: boolean; email_product_updates: boolean; updated_at: string };
        Insert: { account_id: string; in_app_messages?: boolean; email_messages?: boolean; email_product_updates?: boolean; updated_at?: string };
        Update: { in_app_messages?: boolean; email_messages?: boolean; email_product_updates?: boolean; updated_at?: string };
        Relationships: [];
      };
      notification_events: {
        Row: { id: string; account_id: string; related_conversation_id: string | null; category: string; title: string; body: string; read_at: string | null; created_at: string };
        Insert: { id?: string; account_id: string; related_conversation_id?: string | null; category: string; title: string; body: string; read_at?: string | null; created_at?: string };
        Update: { read_at?: string | null };
        Relationships: [];
      };
      notification_email_outbox: {
        Row: { id: string; account_id: string; event_type: string; template_data: unknown; status: string; attempts: number; available_at: string; created_at: string; sent_at: string | null; last_error_code: string | null };
        Insert: { id?: string; account_id: string; event_type: string; template_data?: unknown; status?: string; attempts?: number; available_at?: string; created_at?: string; sent_at?: string | null; last_error_code?: string | null };
        Update: { status?: string; attempts?: number; available_at?: string; sent_at?: string | null; last_error_code?: string | null };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_enabled_markets: { Args: Record<PropertyKey, never>; Returns: unknown[] };
      admin_configure_market: { Args: { p_code: string; p_display_name: string; p_enabled: boolean; p_minimum_age: number; p_default_locale: string; p_supported_locales: string[]; p_default_timezone: string; p_terms_version: string; p_privacy_version: string; p_allow_cross_market?: boolean; p_retention_days?: number | null }; Returns: undefined };
      get_my_market_settings: { Args: Record<PropertyKey, never>; Returns: unknown };
      update_my_locale_settings: { Args: { p_locale: string; p_timezone: string }; Returns: undefined };
      refresh_account_eligibility: { Args: { target_account_id: string }; Returns: undefined };
      get_my_profile_age: { Args: Record<PropertyKey, never>; Returns: number | null };
      save_my_profile_step: { Args: { section_key: string; profile_data: unknown }; Returns: undefined };
      reorder_my_profile_photos: { Args: { photo_ids: string[] }; Returns: undefined };
      get_discovery_candidates: { Args: { result_limit?: number; result_offset?: number }; Returns: unknown[] };
      like_member: { Args: { target_account_id: string }; Returns: { liked: boolean; matched: boolean; connection_id: string | null }[] };
      pass_member: { Args: { target_account_id: string }; Returns: undefined };
      toggle_saved_profile: { Args: { target_account_id: string; should_save: boolean }; Returns: undefined };
      block_member: { Args: { target_account_id: string }; Returns: undefined };
      unmatch_member: { Args: { target_account_id: string }; Returns: undefined };
      is_valid_conversation_member: { Args: { target_conversation_id: string }; Returns: boolean };
      get_my_conversations: { Args: { result_limit?: number }; Returns: unknown[] };
      get_conversation_messages: { Args: { target_conversation_id: string; before_created_at?: string | null; before_message_id?: string | null; result_limit?: number }; Returns: unknown[] };
      send_conversation_message: { Args: { target_conversation_id: string; message_body: string }; Returns: unknown };
      mark_conversation_read: { Args: { target_conversation_id: string }; Returns: undefined };
      get_my_notifications: { Args: { result_limit?: number }; Returns: unknown[] };
      mark_my_notification_read: { Args: { target_notification_id: string }; Returns: undefined };
      mark_all_my_notifications_read: { Args: Record<PropertyKey, never>; Returns: undefined };
      update_my_notification_preferences: { Args: { p_in_app_messages: boolean; p_email_messages: boolean; p_email_product_updates: boolean }; Returns: undefined };
      get_my_notification_preferences: { Args: Record<PropertyKey, never>; Returns: unknown };
      get_my_connections: { Args: Record<PropertyKey, never>; Returns: unknown[] };
      get_my_saved_profiles: { Args: Record<PropertyKey, never>; Returns: unknown[] };
      has_admin_role: { Args: { allowed_roles?: string[] }; Returns: boolean };
      submit_safety_report: { Args: { target_account_id: string | null; report_category: string; report_details: string }; Returns: string };
      get_admin_moderation_queue: { Args: { result_limit?: number }; Returns: unknown };
      admin_review_profile_photo: { Args: { photo_id: string; decision: string; moderator_note?: string | null }; Returns: undefined };
      admin_update_report: { Args: { report_id: string; new_status: string; resolution?: string | null }; Returns: undefined };
      admin_suspend_member: { Args: { target_account_id: string; reason: string }; Returns: undefined };
      get_admin_audit_events: { Args: { result_limit?: number }; Returns: unknown[] };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
