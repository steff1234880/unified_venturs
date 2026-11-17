export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string
          location: string
          category: string
          year: string
          area: string
          image: string
          featured: boolean
          description?: string | null
          images?: string[] | null
          published?: boolean | null
          order?: number | null
          before_image?: string | null
          after_image?: string | null
          is_transformation?: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          location: string
          category: string
          year?: string
          area?: string
          image: string
          featured?: boolean
          description?: string | null
          images?: string[] | null
          published?: boolean | null
          order?: number | null
          before_image?: string | null
          after_image?: string | null
          is_transformation?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          location?: string
          category?: string
          year?: string
          area?: string
          image?: string
          featured?: boolean
          description?: string | null
          images?: string[] | null
          published?: boolean | null
          order?: number | null
          before_image?: string | null
          after_image?: string | null
          is_transformation?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          id: string
          src: string
          alt: string
          collection: string
          tall: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          src: string
          alt: string
          collection?: string
          tall?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          src?: string
          alt?: string
          collection?: string
          tall?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          title: string
          tagline: string
          description: string
          image: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          tagline?: string
          description: string
          image: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          tagline?: string
          description?: string
          image?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          quote: string
          name: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quote: string
          name: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quote?: string
          name?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          project_type: string
          message: string
          read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string
          project_type?: string
          message: string
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          project_type?: string
          message?: string
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
