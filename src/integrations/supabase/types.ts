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
      companies: {
        Row: {
          cnpj: string | null
          created_at: string
          id: string
          logo_url: string | null
          max_users: number
          name: string
          plan: string
          segment: string | null
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
          segment?: string | null
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
          segment?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
        }
        Relationships: []
      }
      corrective_actions: {
        Row: {
          company_id: string
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          created_at: string
          created_by: string | null
          description: string
          evidence_name: string | null
          evidence_url: string | null
          id: string
          occurrence_id: string
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
          evidence_name?: string | null
          evidence_url?: string | null
          id?: string
          occurrence_id: string
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
          evidence_name?: string | null
          evidence_url?: string | null
          id?: string
          occurrence_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "corrective_actions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
          id: string
          responsible: string | null
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
          id?: string
          responsible?: string | null
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
          id?: string
          responsible?: string | null
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
      occurrences: {
        Row: {
          body_part_affected: string | null
          cause_analysis: string | null
          company_id: string
          created_at: string
          description: string
          id: string
          location: string
          occurred_at: string
          registered_by: string | null
          severity: string
          status: string
          type: string
          updated_at: string
          with_leave: boolean | null
        }
        Insert: {
          body_part_affected?: string | null
          cause_analysis?: string | null
          company_id: string
          created_at?: string
          description: string
          id?: string
          location: string
          occurred_at: string
          registered_by?: string | null
          severity: string
          status?: string
          type: string
          updated_at?: string
          with_leave?: boolean | null
        }
        Update: {
          body_part_affected?: string | null
          cause_analysis?: string | null
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          location?: string
          occurred_at?: string
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
            foreignKeyName: "occurrences_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "periodic_services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "service_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
        ]
      }
    }
    Views: {
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
      get_supplier_portal_data: { Args: { p_token: string }; Returns: Json }
      get_user_company_id: { Args: never; Returns: string }
      remove_member: { Args: { p_member_id: string }; Returns: Json }
      seed_default_categories: {
        Args: { p_company_id: string }
        Returns: undefined
      }
      seed_default_document_types: {
        Args: { p_company_id: string }
        Returns: undefined
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
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
