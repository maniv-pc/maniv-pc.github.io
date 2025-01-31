import { PreferencesData } from "pages/portal/components/preferences/types";

export interface Order {
    id: string;
    status: OrderStatus;
    created_at: string;
    updated_at: string;
    postal_code?: string;
    payment_method?: string;
    transaction_id?: string;
    parts_list?: any;
    build_notes?: string;
    build_date: string;
    actual_delivery_date?: string;
    warranty_start_date?: string;
    warranty_end_date?: string;
    support_tickets?: any;
    agree_to_terms: boolean;
    paid_amount: number;
    weekend_fee_applied: boolean;
    offer_id: string;
    user_id: string;
    cancelled_at?: string;
    peripherals_added?: boolean;
    consultation_paid?: boolean;
    proposed_by: string;
    offers?: {
      full_name: string;
      email: string;
      service_type: string;
      service_cost: number;
      delivery_type: string;
      status: string;
      address?: string;
      city?: string;
      budget: number;
      operating_system?: string;
      use_types?: string[];  // Changed this from required to optional
      game_resolution?: string;
      video_software?: string;
      preferences?: PreferencesData;
      peripherals_budget?: number;
    };
  }
  
  export interface Filters {
    email: string;
    name: string;
    useType: string;
    serviceType: string;
    status: string;
  }
  
  export type OrderStatus = 
    | 'pending'
    | 'approved' 
    | 'pending_initial_list'
    | 'pending_consultation_payment'
    | 'pending_parts_upload'
    | 'pending_schedule'
    | 'schedule_pending_approval'
    | 'building'
    | 'ready'
    | 'delivered'
    | 'cancellation_pending'
    | 'cancelled';