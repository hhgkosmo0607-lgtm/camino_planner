// lib/supabase/types.ts — supabase/migrations/0001_community.sql과 1:1로 맞춘
// 수기 타입. 아직 실제 Supabase 프로젝트가 없어 `supabase gen types`로 생성하지
// 못했다 — 마이그레이션이 바뀌면 이 파일도 같이 고친다.
// ⚠️ 각 테이블에 `Relationships: []`가 반드시 있어야 한다 — @supabase/postgrest-js의
//   GenericTable이 이 필드를 요구해서, 없으면 타입 추론이 전부 `never`로 무너진다.

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nickname: string
          travel_mode: string | null
          start_date: string | null
          created_at: string
        }
        Insert: {
          id: string
          nickname: string
          travel_mode?: string | null
          start_date?: string | null
        }
        Update: {
          nickname?: string
          travel_mode?: string | null
          start_date?: string | null
        }
        Relationships: []
      }
      checkins: {
        Row: {
          id: string
          profile_id: string
          town_id: string
          checked_in_at: string
        }
        Insert: {
          profile_id: string
          town_id: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          profile_id: string
          title: string
          body: string
          created_at: string
        }
        Insert: {
          profile_id: string
          title: string
          body: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      replies: {
        Row: {
          id: string
          post_id: string
          profile_id: string
          body: string
          created_at: string
        }
        Insert: {
          post_id: string
          profile_id: string
          body: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_profile_id: string
          target_type: 'PROFILE' | 'POST' | 'REPLY'
          target_id: string
          reason: string
          created_at: string
        }
        Insert: {
          reporter_profile_id: string
          target_type: 'PROFILE' | 'POST' | 'REPLY'
          target_id: string
          reason: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      blocks: {
        Row: {
          id: string
          blocker_profile_id: string
          blocked_profile_id: string
          created_at: string
        }
        Insert: {
          blocker_profile_id: string
          blocked_profile_id: string
        }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
