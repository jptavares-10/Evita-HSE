export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      aso_exam_types: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          validity_months: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          validity_months?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          validity_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "aso_exam_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aso_exam_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      aso_records: {
        Row: {
          company_id: string
          created_at: string
          crm: string | null
          doctor_name: string | null
          employee_id: string
          exam_date: string
          exam_type_id: string
          expires_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          notes: string | null
          registered_by: string | null
          result: string
        }
        Insert: {
          company_id: string
          created_at?: string
          crm?: string | null
          doctor_name?: string | null
          employee_id: string
          exam_date: string
          exam_type_id: string
          expires_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          registered_by?: string | null
          result?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          crm?: string | null
          doctor_name?: string | null
          employee_id?: string
          exam_date?: string
          exam_type_id?: string
          expires_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          registered_by?: string | null
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "aso_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aso_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aso_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aso_records_exam_type_id_fkey"
            columns: ["exam_type_id"]
            isOneToOne: false
            referencedRelation: "aso_exam_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aso_records_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_event_attachments: {
        Row: {
          company_id: string
          event_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          event_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          event_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_event_attachments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_event_attachments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_event_attachments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_event_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean
          area: Database["public"]["Enums"]["calendar_area"]
          category: Database["public"]["Enums"]["calendar_category"]
          color: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          location: string | null
          starts_at: string
          status: Database["public"]["Enums"]["calendar_event_status"]
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          area?: Database["public"]["Enums"]["calendar_area"]
          category?: Database["public"]["Enums"]["calendar_category"]
          color?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["calendar_event_status"]
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          area?: Database["public"]["Enums"]["calendar_area"]
          category?: Database["public"]["Enums"]["calendar_category"]
          color?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["calendar_event_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          cnpj: string | null
          created_at: string
          id: string
          logo_url: string | null
          max_users: number
          name: string
          plan: string
          plan_billing: string | null
          plan_expires_at: string | null
          plan_started_at: string | null
          segment: string | null
          storage_gb: number
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          subscription_cancel_at: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          max_users?: number
          name: string
          plan?: string
          plan_billing?: string | null
          plan_expires_at?: string | null
          plan_started_at?: string | null
          segment?: string | null
          storage_gb?: number
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_cancel_at?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          max_users?: number
          name?: string
          plan?: string
          plan_billing?: string | null
          plan_expires_at?: string | null
          plan_started_at?: string | null
          segment?: string | null
          storage_gb?: number
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_cancel_at?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
        }
        Relationships: []
      }
      corrective_actions: {
        Row: {
          cause_id: string | null
          company_id: string
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          control_hierarchy: string | null
          cost_estimated: number | null
          created_at: string
          created_by: string | null
          description: string
          due_date: string | null
          effectiveness_check_date: string | null
          effectiveness_result: string | null
          evidence_name: string | null
          evidence_url: string | null
          how_method: string | null
          id: string
          occurrence_id: string
          responsible_employee_id: string | null
          responsible_profile_id: string | null
          status: string
          where_location: string | null
          why: string | null
        }
        Insert: {
          cause_id?: string | null
          company_id: string
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          control_hierarchy?: string | null
          cost_estimated?: number | null
          created_at?: string
          created_by?: string | null
          description: string
          due_date?: string | null
          effectiveness_check_date?: string | null
          effectiveness_result?: string | null
          evidence_name?: string | null
          evidence_url?: string | null
          how_method?: string | null
          id?: string
          occurrence_id: string
          responsible_employee_id?: string | null
          responsible_profile_id?: string | null
          status?: string
          where_location?: string | null
          why?: string | null
        }
        Update: {
          cause_id?: string | null
          company_id?: string
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          control_hierarchy?: string | null
          cost_estimated?: number | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string | null
          effectiveness_check_date?: string | null
          effectiveness_result?: string | null
          evidence_name?: string | null
          evidence_url?: string | null
          how_method?: string | null
          id?: string
          occurrence_id?: string
          responsible_employee_id?: string | null
          responsible_profile_id?: string | null
          status?: string
          where_location?: string | null
          why?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corrective_actions_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "occurrence_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_actions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_actions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_actions_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_actions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_actions_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_actions_responsible_employee_id_fkey"
            columns: ["responsible_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_actions_responsible_profile_id_fkey"
            columns: ["responsible_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_review_assignments: {
        Row: {
          company_id: string
          created_at: string
          cycle_id: string
          id: string
          read_at: string | null
          responded_at: string | null
          reviewer_id: string
          status: string
        }
        Insert: {
          company_id: string
          created_at?: string
          cycle_id: string
          id?: string
          read_at?: string | null
          responded_at?: string | null
          reviewer_id: string
          status?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          cycle_id?: string
          id?: string
          read_at?: string | null
          responded_at?: string | null
          reviewer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_review_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_review_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_review_assignments_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "document_review_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_review_assignments_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_review_comments: {
        Row: {
          assignment_id: string
          attachment_name: string | null
          attachment_url: string | null
          author_id: string
          comment_type: string
          company_id: string
          content: string
          created_at: string
          cycle_id: string
          id: string
          is_resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string
        }
        Insert: {
          assignment_id: string
          attachment_name?: string | null
          attachment_url?: string | null
          author_id: string
          comment_type?: string
          company_id: string
          content: string
          created_at?: string
          cycle_id: string
          id?: string
          is_resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          attachment_name?: string | null
          attachment_url?: string | null
          author_id?: string
          comment_type?: string
          company_id?: string
          content?: string
          created_at?: string
          cycle_id?: string
          id?: string
          is_resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_review_comments_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "document_review_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_review_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_review_comments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_review_comments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_review_comments_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "document_review_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_review_comments_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_review_cycles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          comments_visible: boolean
          company_id: string
          created_at: string
          created_by: string | null
          document_id: string
          due_date: string | null
          id: string
          message: string | null
          require_all_responses: boolean
          revision_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          comments_visible?: boolean
          company_id: string
          created_at?: string
          created_by?: string | null
          document_id: string
          due_date?: string | null
          id?: string
          message?: string | null
          require_all_responses?: boolean
          revision_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          comments_visible?: boolean
          company_id?: string
          created_at?: string
          created_by?: string | null
          document_id?: string
          due_date?: string | null
          id?: string
          message?: string | null
          require_all_responses?: boolean
          revision_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_review_cycles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_review_cycles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_review_cycles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_review_cycles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_review_cycles_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_review_cycles_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "document_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_revisions: {
        Row: {
          company_id: string
          document_id: string
          file_name: string
          file_url: string
          id: string
          notes: string | null
          revision_date: string
          revision_number: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          document_id: string
          file_name: string
          file_url: string
          id?: string
          notes?: string | null
          revision_date: string
          revision_number: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          document_id?: string
          file_name?: string
          file_url?: string
          id?: string
          notes?: string | null
          revision_date?: string
          revision_number?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_revisions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_revisions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_revisions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_revisions_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_service_links: {
        Row: {
          company_id: string
          document_id: string
          id: string
          linked_at: string
          linked_by: string | null
          service_id: string
        }
        Insert: {
          company_id: string
          document_id: string
          id?: string
          linked_at?: string
          linked_by?: string | null
          service_id: string
        }
        Update: {
          company_id?: string
          document_id?: string
          id?: string
          linked_at?: string
          linked_by?: string | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_service_links_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_service_links_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_service_links_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_service_links_linked_by_fkey"
            columns: ["linked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_service_links_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "periodic_services"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_default: boolean
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          area: string | null
          code: string | null
          company_id: string
          created_at: string
          created_by: string | null
          current_file_name: string | null
          current_file_url: string | null
          current_revision: string
          current_revision_date: string
          description: string | null
          document_type_id: string | null
          has_revision_cycle: boolean
          id: string
          next_revision_at: string | null
          responsible: string | null
          revision_frequency_days: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          code?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          current_file_name?: string | null
          current_file_url?: string | null
          current_revision: string
          current_revision_date: string
          description?: string | null
          document_type_id?: string | null
          has_revision_cycle?: boolean
          id?: string
          next_revision_at?: string | null
          responsible?: string | null
          revision_frequency_days?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          code?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          current_file_name?: string | null
          current_file_url?: string | null
          current_revision?: string
          current_revision_date?: string
          description?: string | null
          document_type_id?: string | null
          has_revision_cycle?: boolean
          id?: string
          next_revision_at?: string | null
          responsible?: string | null
          revision_frequency_days?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_training_records: {
        Row: {
          certificate_name: string | null
          certificate_url: string | null
          company_id: string
          created_at: string
          done_at: string
          employee_id: string
          expires_at: string
          id: string
          notes: string | null
          registered_by: string | null
          training_id: string
        }
        Insert: {
          certificate_name?: string | null
          certificate_url?: string | null
          company_id: string
          created_at?: string
          done_at: string
          employee_id: string
          expires_at: string
          id?: string
          notes?: string | null
          registered_by?: string | null
          training_id: string
        }
        Update: {
          certificate_name?: string | null
          certificate_url?: string | null
          company_id?: string
          created_at?: string
          done_at?: string
          employee_id?: string
          expires_at?: string
          id?: string
          notes?: string | null
          registered_by?: string | null
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_training_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_training_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_training_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_training_records_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_training_records_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          company_id: string
          created_at: string
          id: string
          job_position_id: string | null
          name: string
          sector: string | null
          sector_id: string | null
          status: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          job_position_id?: string | null
          name: string
          sector?: string | null
          sector_id?: string | null
          status?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          job_position_id?: string | null
          name?: string
          sector?: string | null
          sector_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_job_position_id_fkey"
            columns: ["job_position_id"]
            isOneToOne: false
            referencedRelation: "job_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      environmental_licenses: {
        Row: {
          alert_days_before: number
          company_id: string
          conditionants: string | null
          created_at: string
          expires_at: string | null
          file_name: string | null
          file_url: string | null
          has_expiry: boolean
          id: string
          issued_at: string
          issuing_body: string
          license_number: string
          license_type_id: string | null
          notes: string | null
          registered_by: string | null
          sphere: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          alert_days_before?: number
          company_id: string
          conditionants?: string | null
          created_at?: string
          expires_at?: string | null
          file_name?: string | null
          file_url?: string | null
          has_expiry?: boolean
          id?: string
          issued_at: string
          issuing_body: string
          license_number: string
          license_type_id?: string | null
          notes?: string | null
          registered_by?: string | null
          sphere: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          alert_days_before?: number
          company_id?: string
          conditionants?: string | null
          created_at?: string
          expires_at?: string | null
          file_name?: string | null
          file_url?: string | null
          has_expiry?: boolean
          id?: string
          issued_at?: string
          issuing_body?: string
          license_number?: string
          license_type_id?: string | null
          notes?: string | null
          registered_by?: string | null
          sphere?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "environmental_licenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environmental_licenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environmental_licenses_license_type_id_fkey"
            columns: ["license_type_id"]
            isOneToOne: false
            referencedRelation: "license_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environmental_licenses_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      epi_deliveries: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          company_id: string
          created_at: string
          delivered_at: string
          employee_id: string
          epi_type_id: string
          id: string
          notes: string | null
          quantity: number
          reason: string | null
          registered_by: string | null
          returned_at: string | null
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          company_id: string
          created_at?: string
          delivered_at: string
          employee_id: string
          epi_type_id: string
          id?: string
          notes?: string | null
          quantity?: number
          reason?: string | null
          registered_by?: string | null
          returned_at?: string | null
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          company_id?: string
          created_at?: string
          delivered_at?: string
          employee_id?: string
          epi_type_id?: string
          id?: string
          notes?: string | null
          quantity?: number
          reason?: string | null
          registered_by?: string | null
          returned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epi_deliveries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epi_deliveries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epi_deliveries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epi_deliveries_epi_type_id_fkey"
            columns: ["epi_type_id"]
            isOneToOne: false
            referencedRelation: "epi_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epi_deliveries_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      epi_stock_movements: {
        Row: {
          company_id: string
          created_at: string
          delivery_id: string | null
          epi_type_id: string
          id: string
          moved_at: string
          movement_type: string
          notes: string | null
          quantity: number
          registered_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          delivery_id?: string | null
          epi_type_id: string
          id?: string
          moved_at: string
          movement_type?: string
          notes?: string | null
          quantity: number
          registered_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          delivery_id?: string | null
          epi_type_id?: string
          id?: string
          moved_at?: string
          movement_type?: string
          notes?: string | null
          quantity?: number
          registered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epi_stock_movements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epi_stock_movements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epi_stock_movements_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "epi_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epi_stock_movements_epi_type_id_fkey"
            columns: ["epi_type_id"]
            isOneToOne: false
            referencedRelation: "epi_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epi_stock_movements_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      epi_types: {
        Row: {
          ca_alert_days_before: number
          ca_expires_at: string | null
          ca_file_name: string | null
          ca_file_url: string | null
          ca_number: string | null
          company_id: string
          created_at: string
          description: string | null
          id: string
          minimum_stock: number
          name: string
          unit: string
        }
        Insert: {
          ca_alert_days_before?: number
          ca_expires_at?: string | null
          ca_file_name?: string | null
          ca_file_url?: string | null
          ca_number?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          minimum_stock?: number
          name: string
          unit?: string
        }
        Update: {
          ca_alert_days_before?: number
          ca_expires_at?: string | null
          ca_file_name?: string | null
          ca_file_url?: string | null
          ca_number?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          minimum_stock?: number
          name?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "epi_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epi_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_corrective_actions: {
        Row: {
          company_id: string
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          created_at: string
          created_by: string | null
          description: string
          due_date: string
          evidence_name: string | null
          evidence_url: string | null
          execution_id: string
          id: string
          priority: string
          responsible_employee_id: string | null
          responsible_name: string | null
          status: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          due_date: string
          evidence_name?: string | null
          evidence_url?: string | null
          execution_id: string
          id?: string
          priority?: string
          responsible_employee_id?: string | null
          responsible_name?: string | null
          status?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string
          evidence_name?: string | null
          evidence_url?: string | null
          execution_id?: string
          id?: string
          priority?: string
          responsible_employee_id?: string | null
          responsible_name?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_corrective_actions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_corrective_actions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_corrective_actions_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_corrective_actions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_corrective_actions_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "inspection_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_corrective_actions_responsible_employee_id_fkey"
            columns: ["responsible_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_entries: {
        Row: {
          company_id: string
          created_at: string
          employee_id: string | null
          employee_name: string
          executed_at: string
          execution_id: string
          file_name: string
          file_url: string
          id: string
          notes: string | null
          registered_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          employee_id?: string | null
          employee_name: string
          executed_at?: string
          execution_id: string
          file_name: string
          file_url: string
          id?: string
          notes?: string | null
          registered_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          employee_id?: string | null
          employee_name?: string
          executed_at?: string
          execution_id?: string
          file_name?: string
          file_url?: string
          id?: string
          notes?: string | null
          registered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_entries_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "inspection_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_entries_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_executions: {
        Row: {
          company_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          due_date: string
          id: string
          model_id: string
          reference: string
          status: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          due_date: string
          id?: string
          model_id: string
          reference?: string
          status?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          due_date?: string
          id?: string
          model_id?: string
          reference?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_executions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_executions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_executions_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_executions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "inspection_models"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_models: {
        Row: {
          alert_hours_before: number
          company_id: string
          created_at: string
          created_by: string | null
          default_responsible_id: string | null
          document_id: string | null
          frequency_days: number | null
          frequency_type: string
          id: string
          name: string
          related_nr: string | null
          sector_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          alert_hours_before?: number
          company_id: string
          created_at?: string
          created_by?: string | null
          default_responsible_id?: string | null
          document_id?: string | null
          frequency_days?: number | null
          frequency_type?: string
          id?: string
          name: string
          related_nr?: string | null
          sector_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          alert_hours_before?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          default_responsible_id?: string | null
          document_id?: string | null
          frequency_days?: number | null
          frequency_type?: string
          id?: string
          name?: string
          related_nr?: string | null
          sector_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_models_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_models_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_models_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_models_default_responsible_id_fkey"
            columns: ["default_responsible_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_models_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_models_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          company_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          status: string
          token: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          status?: string
          token?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_positions: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
          sector_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
          sector_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          sector_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_positions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_positions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_positions_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      license_renewals: {
        Row: {
          company_id: string
          expires_at: string | null
          file_name: string
          file_url: string
          id: string
          issued_at: string
          license_id: string
          license_number: string | null
          notes: string | null
          registered_at: string
          registered_by: string | null
        }
        Insert: {
          company_id: string
          expires_at?: string | null
          file_name: string
          file_url: string
          id?: string
          issued_at: string
          license_id: string
          license_number?: string | null
          notes?: string | null
          registered_at?: string
          registered_by?: string | null
        }
        Update: {
          company_id?: string
          expires_at?: string | null
          file_name?: string
          file_url?: string
          id?: string
          issued_at?: string
          license_id?: string
          license_number?: string | null
          notes?: string | null
          registered_at?: string
          registered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "license_renewals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_renewals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_renewals_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "environmental_licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_renewals_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      license_types: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "license_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      mtr_waste_items: {
        Row: {
          company_id: string
          created_at: string
          id: string
          mtr_id: string
          quantity_tons: number | null
          waste_category_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          mtr_id: string
          quantity_tons?: number | null
          waste_category_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          mtr_id?: string
          quantity_tons?: number | null
          waste_category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mtr_waste_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mtr_waste_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mtr_waste_items_mtr_id_fkey"
            columns: ["mtr_id"]
            isOneToOne: false
            referencedRelation: "mtrs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mtr_waste_items_waste_category_id_fkey"
            columns: ["waste_category_id"]
            isOneToOne: false
            referencedRelation: "waste_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      mtrs: {
        Row: {
          alert_at: string
          cdf_deadline_at: string
          cdf_file_name: string | null
          cdf_file_url: string | null
          cdf_notes: string | null
          cdf_number: string | null
          cdf_received_at: string | null
          cdf_status: string
          company_id: string
          created_at: string
          id: string
          issued_at: string
          mtr_file_name: string | null
          mtr_file_url: string | null
          mtr_number: string
          notes: string | null
          registered_by: string | null
          transporter: string | null
          updated_at: string
        }
        Insert: {
          alert_at: string
          cdf_deadline_at: string
          cdf_file_name?: string | null
          cdf_file_url?: string | null
          cdf_notes?: string | null
          cdf_number?: string | null
          cdf_received_at?: string | null
          cdf_status?: string
          company_id: string
          created_at?: string
          id?: string
          issued_at: string
          mtr_file_name?: string | null
          mtr_file_url?: string | null
          mtr_number: string
          notes?: string | null
          registered_by?: string | null
          transporter?: string | null
          updated_at?: string
        }
        Update: {
          alert_at?: string
          cdf_deadline_at?: string
          cdf_file_name?: string | null
          cdf_file_url?: string | null
          cdf_notes?: string | null
          cdf_number?: string | null
          cdf_received_at?: string | null
          cdf_status?: string
          company_id?: string
          created_at?: string
          id?: string
          issued_at?: string
          mtr_file_name?: string | null
          mtr_file_url?: string | null
          mtr_number?: string
          notes?: string | null
          registered_by?: string | null
          transporter?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mtrs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mtrs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mtrs_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      occurrence_attachments: {
        Row: {
          company_id: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          occurrence_id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          file_name: string
          file_type?: string
          file_url: string
          id?: string
          occurrence_id: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          occurrence_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "occurrence_attachments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_attachments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_attachments_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      occurrence_bowtie: {
        Row: {
          company_id: string
          created_at: string
          description: string
          hazard: string | null
          id: string
          linked_to: string | null
          node_type: string
          occurrence_id: string
          order_index: number
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          hazard?: string | null
          id?: string
          linked_to?: string | null
          node_type: string
          occurrence_id: string
          order_index?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          hazard?: string | null
          id?: string
          linked_to?: string | null
          node_type?: string
          occurrence_id?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "occurrence_bowtie_linked_to_fkey"
            columns: ["linked_to"]
            isOneToOne: false
            referencedRelation: "occurrence_bowtie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_bowtie_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "occurrences"
            referencedColumns: ["id"]
          },
        ]
      }
      occurrence_causes: {
        Row: {
          category_6m: string | null
          cause_type: string
          company_id: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          occurrence_id: string
          order_index: number
          parent_cause_id: string | null
          source_method: string | null
        }
        Insert: {
          category_6m?: string | null
          cause_type: string
          company_id: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          occurrence_id: string
          order_index?: number
          parent_cause_id?: string | null
          source_method?: string | null
        }
        Update: {
          category_6m?: string | null
          cause_type?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          occurrence_id?: string
          order_index?: number
          parent_cause_id?: string | null
          source_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "occurrence_causes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_causes_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_causes_parent_cause_id_fkey"
            columns: ["parent_cause_id"]
            isOneToOne: false
            referencedRelation: "occurrence_causes"
            referencedColumns: ["id"]
          },
        ]
      }
      occurrence_employees: {
        Row: {
          company_id: string
          employee_id: string | null
          employee_name: string
          id: string
          occurrence_id: string
        }
        Insert: {
          company_id: string
          employee_id?: string | null
          employee_name: string
          id?: string
          occurrence_id: string
        }
        Update: {
          company_id?: string
          employee_id?: string | null
          employee_name?: string
          id?: string
          occurrence_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "occurrence_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_employees_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "occurrences"
            referencedColumns: ["id"]
          },
        ]
      }
      occurrence_witnesses: {
        Row: {
          company_id: string
          created_at: string
          employee_id: string | null
          id: string
          occurrence_id: string
          statement: string | null
          witness_name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          employee_id?: string | null
          id?: string
          occurrence_id: string
          statement?: string | null
          witness_name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          employee_id?: string | null
          id?: string
          occurrence_id?: string
          statement?: string | null
          witness_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "occurrence_witnesses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_witnesses_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "occurrences"
            referencedColumns: ["id"]
          },
        ]
      }
      occurrences: {
        Row: {
          body_part_affected: string | null
          cat_issued_at: string | null
          cat_number: string | null
          cat_required: boolean
          cause_analysis: string | null
          company_id: string
          cost_estimated: number | null
          created_at: string
          description: string
          id: string
          investigation_method: string | null
          lesson_summary: string | null
          lesson_tags: string[] | null
          lesson_title: string | null
          location: string
          lost_days: number
          occurred_at: string
          published_as_lesson: boolean
          registered_by: string | null
          severity: string
          status: string
          type: string
          updated_at: string
          with_leave: boolean | null
        }
        Insert: {
          body_part_affected?: string | null
          cat_issued_at?: string | null
          cat_number?: string | null
          cat_required?: boolean
          cause_analysis?: string | null
          company_id: string
          cost_estimated?: number | null
          created_at?: string
          description: string
          id?: string
          investigation_method?: string | null
          lesson_summary?: string | null
          lesson_tags?: string[] | null
          lesson_title?: string | null
          location: string
          lost_days?: number
          occurred_at: string
          published_as_lesson?: boolean
          registered_by?: string | null
          severity: string
          status?: string
          type: string
          updated_at?: string
          with_leave?: boolean | null
        }
        Update: {
          body_part_affected?: string | null
          cat_issued_at?: string | null
          cat_number?: string | null
          cat_required?: boolean
          cause_analysis?: string | null
          company_id?: string
          cost_estimated?: number | null
          created_at?: string
          description?: string
          id?: string
          investigation_method?: string | null
          lesson_summary?: string | null
          lesson_tags?: string[] | null
          lesson_title?: string | null
          location?: string
          lost_days?: number
          occurred_at?: string
          published_as_lesson?: boolean
          registered_by?: string | null
          severity?: string
          status?: string
          type?: string
          updated_at?: string
          with_leave?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "occurrences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrences_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          amount: number
          billing_type: string | null
          company_id: string
          created_at: string
          currency: string
          id: string
          plan_key: string
          status: string
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount?: number
          billing_type?: string | null
          company_id: string
          created_at?: string
          currency?: string
          id?: string
          plan_key: string
          status?: string
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          billing_type?: string | null
          company_id?: string
          created_at?: string
          currency?: string
          id?: string
          plan_key?: string
          status?: string
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_intents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_intents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      periodic_services: {
        Row: {
          alert_days_before: number
          category_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          frequency_days: number | null
          frequency_preset: string | null
          frequency_type: string
          id: string
          last_done_at: string
          name: string
          next_due_at: string
          notes: string | null
          status: string
          supplier: string | null
          updated_at: string
        }
        Insert: {
          alert_days_before?: number
          category_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          frequency_days?: number | null
          frequency_preset?: string | null
          frequency_type?: string
          id?: string
          last_done_at: string
          name: string
          next_due_at: string
          notes?: string | null
          status?: string
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          alert_days_before?: number
          category_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          frequency_days?: number | null
          frequency_preset?: string | null
          frequency_type?: string
          id?: string
          last_done_at?: string
          name?: string
          next_due_at?: string
          notes?: string | null
          status?: string
          supplier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "periodic_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periodic_services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periodic_services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periodic_services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_change_history: {
        Row: {
          billing_type: string | null
          changed_at: string
          changed_by: string | null
          company_id: string
          from_plan: string
          id: string
          reason: string | null
          to_plan: string
        }
        Insert: {
          billing_type?: string | null
          changed_at?: string
          changed_by?: string | null
          company_id: string
          from_plan: string
          id?: string
          reason?: string | null
          to_plan: string
        }
        Update: {
          billing_type?: string | null
          changed_at?: string
          changed_by?: string | null
          company_id?: string
          from_plan?: string
          id?: string
          reason?: string | null
          to_plan?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_change_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_change_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_change_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_definitions: {
        Row: {
          max_users: number
          modules: string[]
          name: string
          plan_key: string
          price_annual: number
          price_monthly: number
          storage_gb: number
        }
        Insert: {
          max_users?: number
          modules?: string[]
          name: string
          plan_key: string
          price_annual?: number
          price_monthly?: number
          storage_gb?: number
        }
        Update: {
          max_users?: number
          modules?: string[]
          name?: string
          plan_key?: string
          price_annual?: number
          price_monthly?: number
          storage_gb?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string
          email: string
          full_name: string
          id: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sectors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sectors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      service_attachments: {
        Row: {
          company_id: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          reference_date: string | null
          service_id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          file_name: string
          file_type?: string
          file_url: string
          id?: string
          reference_date?: string | null
          service_id: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          reference_date?: string | null
          service_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_attachments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_attachments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_attachments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "periodic_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          color: string
          company_id: string
          created_at: string
          id: string
          is_default: boolean
          name: string
        }
        Insert: {
          color?: string
          company_id: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
        }
        Update: {
          color?: string
          company_id?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      service_history: {
        Row: {
          company_id: string
          created_at: string
          done_at: string
          failure_description: string | null
          id: string
          notes: string | null
          notes_edited_at: string | null
          notes_edited_by: string | null
          realization_type: string
          registered_by: string | null
          service_id: string
          supplier: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          done_at: string
          failure_description?: string | null
          id?: string
          notes?: string | null
          notes_edited_at?: string | null
          notes_edited_by?: string | null
          realization_type?: string
          registered_by?: string | null
          service_id: string
          supplier?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          done_at?: string
          failure_description?: string | null
          id?: string
          notes?: string | null
          notes_edited_at?: string | null
          notes_edited_by?: string | null
          realization_type?: string
          registered_by?: string | null
          service_id?: string
          supplier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_history_notes_edited_by_fkey"
            columns: ["notes_edited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_history_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_history_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "periodic_services"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_categories: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_documents: {
        Row: {
          company_id: string
          description: string
          file_name: string
          file_type: string
          file_url: string
          folder_id: string | null
          id: string
          reference_name: string | null
          supplier_id: string
          uploaded_at: string
          uploaded_by_supplier: boolean
        }
        Insert: {
          company_id: string
          description: string
          file_name: string
          file_type?: string
          file_url: string
          folder_id?: string | null
          id?: string
          reference_name?: string | null
          supplier_id: string
          uploaded_at?: string
          uploaded_by_supplier?: boolean
        }
        Update: {
          company_id?: string
          description?: string
          file_name?: string
          file_type?: string
          file_url?: string
          folder_id?: string | null
          id?: string
          reference_name?: string | null
          supplier_id?: string
          uploaded_at?: string
          uploaded_by_supplier?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "supplier_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "supplier_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_documents_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_documents_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_folders: {
        Row: {
          company_id: string
          created_at: string
          created_by_supplier: boolean
          id: string
          name: string
          parent_folder_id: string | null
          supplier_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by_supplier?: boolean
          id?: string
          name: string
          parent_folder_id?: string | null
          supplier_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by_supplier?: boolean
          id?: string
          name?: string
          parent_folder_id?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_folders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_folders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "supplier_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_folders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_folders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          category_id: string | null
          company_id: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          notes: string | null
          portal_enabled: boolean
          portal_token: string
          status: string
        }
        Insert: {
          category_id?: string | null
          company_id: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          notes?: string | null
          portal_enabled?: boolean
          portal_token?: string
          status?: string
        }
        Update: {
          category_id?: string | null
          company_id?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          notes?: string | null
          portal_enabled?: boolean
          portal_token?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "supplier_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_matrix: {
        Row: {
          company_id: string
          created_at: string
          id: string
          job_position_id: string
          training_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          job_position_id: string
          training_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          job_position_id?: string
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_matrix_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_matrix_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_matrix_job_position_id_fkey"
            columns: ["job_position_id"]
            isOneToOne: false
            referencedRelation: "job_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_matrix_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sector_rules: {
        Row: {
          company_id: string
          created_at: string
          id: string
          sector_id: string
          training_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          sector_id: string
          training_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          sector_id?: string
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sector_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sector_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sector_rules_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sector_rules_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          alert_days_before: number
          company_id: string
          created_at: string
          description: string | null
          has_expiry: boolean
          id: string
          name: string
          reference_document_id: string | null
          reference_standard: string | null
          validity_months: number | null
        }
        Insert: {
          alert_days_before?: number
          company_id: string
          created_at?: string
          description?: string | null
          has_expiry?: boolean
          id?: string
          name: string
          reference_document_id?: string | null
          reference_standard?: string | null
          validity_months?: number | null
        }
        Update: {
          alert_days_before?: number
          company_id?: string
          created_at?: string
          description?: string | null
          has_expiry?: boolean
          id?: string
          name?: string
          reference_document_id?: string | null
          reference_standard?: string | null
          validity_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trainings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainings_reference_document_id_fkey"
            columns: ["reference_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          company_id: string
          id: string
          module: string
          permission: string
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          id?: string
          module: string
          permission?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          id?: string
          module?: string
          permission?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_categories: {
        Row: {
          color: string
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          company_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "waste_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      calendar_due_items: {
        Row: {
          company_id: string | null
          deep_link: string | null
          due_date: string | null
          source_id: string | null
          source_module: string | null
          subtitle: string | null
          title: string | null
        }
        Relationships: []
      }
      companies_safe: {
        Row: {
          cnpj: string | null
          created_at: string | null
          id: string | null
          logo_url: string | null
          max_users: number | null
          name: string | null
          plan: string | null
          plan_billing: string | null
          plan_expires_at: string | null
          plan_started_at: string | null
          segment: string | null
          storage_gb: number | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          subscription_cancel_at: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          id?: string | null
          logo_url?: string | null
          max_users?: number | null
          name?: string | null
          plan?: string | null
          plan_billing?: string | null
          plan_expires_at?: string | null
          plan_started_at?: string | null
          segment?: string | null
          storage_gb?: number | null
          stripe_customer_id?: never
          stripe_price_id?: never
          stripe_subscription_id?: never
          subscription_cancel_at?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          id?: string | null
          logo_url?: string | null
          max_users?: number | null
          name?: string | null
          plan?: string | null
          plan_billing?: string | null
          plan_expires_at?: string | null
          plan_started_at?: string | null
          segment?: string | null
          storage_gb?: number | null
          stripe_customer_id?: never
          stripe_price_id?: never
          stripe_subscription_id?: never
          subscription_cancel_at?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
        }
        Relationships: []
      }
      suppliers_safe: {
        Row: {
          category_id: string | null
          company_id: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          id: string | null
          name: string | null
          notes: string | null
          portal_enabled: boolean | null
          portal_token: string | null
          status: string | null
        }
        Insert: {
          category_id?: string | null
          company_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          name?: string | null
          notes?: string | null
          portal_enabled?: boolean | null
          portal_token?: never
          status?: string | null
        }
        Update: {
          category_id?: string | null
          company_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          name?: string | null
          notes?: string | null
          portal_enabled?: boolean | null
          portal_token?: never
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "supplier_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_invitation_membership: {
        Args: { p_full_name?: string; p_token: string }
        Returns: Json
      }
      activate_plan_from_stripe: {
        Args: {
          p_billing: string
          p_company_id?: string
          p_plan_key: string
          p_stripe_customer_id: string
          p_stripe_price_id: string
          p_stripe_subscription_id: string
        }
        Returns: Json
      }
      cancel_plan_from_stripe: {
        Args: { p_stripe_subscription_id: string }
        Returns: Json
      }
      create_company_and_admin: {
        Args: {
          p_cnpj?: string
          p_company_name: string
          p_email?: string
          p_full_name?: string
          p_segment?: string
        }
        Returns: Json
      }
      create_supplier_folder_portal: {
        Args: { p_name: string; p_parent_folder_id?: string; p_token: string }
        Returns: Json
      }
      get_company_access_status: { Args: never; Returns: Json }
      get_pending_invitation_for_current_user: { Args: never; Returns: Json }
      get_supplier_portal_data: { Args: { p_token: string }; Returns: Json }
      get_user_company_id: { Args: never; Returns: string }
      get_user_permissions: { Args: { p_user_id: string }; Returns: Json }
      has_module_editor_permission: {
        Args: { p_module: string }
        Returns: boolean
      }
      has_pending_invitation: {
        Args: { p_company_id: string; p_email: string }
        Returns: boolean
      }
      remove_member: { Args: { p_member_id: string }; Returns: Json }
      renew_plan_from_stripe: {
        Args: { p_billing: string; p_stripe_subscription_id: string }
        Returns: Json
      }
      seed_default_aso_exam_types: {
        Args: { p_company_id: string }
        Returns: undefined
      }
      seed_default_categories: {
        Args: { p_company_id: string }
        Returns: undefined
      }
      seed_default_document_types: {
        Args: { p_company_id: string }
        Returns: undefined
      }
      set_user_permission: {
        Args: { p_module: string; p_permission: string; p_user_id: string }
        Returns: Json
      }
      update_company_safe_fields: {
        Args: {
          p_cnpj?: string
          p_logo_url?: string
          p_name: string
          p_segment?: string
        }
        Returns: Json
      }
      upload_supplier_document: {
        Args: {
          p_description?: string
          p_file_name?: string
          p_file_type?: string
          p_file_url?: string
          p_folder_id?: string
          p_reference_name?: string
          p_token: string
        }
        Returns: Json
      }
      validate_invitation_token: { Args: { p_token: string }; Returns: Json }
    }
    Enums: {
      calendar_area: "meio_ambiente" | "seguranca" | "saude" | "geral"
      calendar_category:
        | "evento"
        | "campanha"
        | "auditoria"
        | "reuniao"
        | "treinamento_interno"
        | "outro"
      calendar_event_status: "planejado" | "concluido" | "cancelado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      calendar_area: ["meio_ambiente", "seguranca", "saude", "geral"],
      calendar_category: [
        "evento",
        "campanha",
        "auditoria",
        "reuniao",
        "treinamento_interno",
        "outro",
      ],
      calendar_event_status: ["planejado", "concluido", "cancelado"],
    },
  },
} as const
