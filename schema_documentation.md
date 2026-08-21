# Fusion-Baukasten Database Schema & Flows
> Comprehensive technical documentation of relations, constraints, and architecture flows.

## 1. Entity Relationship Diagram (ERD)

This diagram visualizes the core PostgreSQL database schema distributed across the three domains: **Stammdaten** (Core Data), **Projekte** (Projects), and **Collab** (Collaboration/Tasks).

```mermaid
erDiagram
    %% DOMAIN 1: STAMMDATEN
    USER {
        uuid id PK
        string email UK
        string first_name
        string last_name
        string hashed_password
        enum system_role "project_manager, team_member, client"
        boolean is_guest
        string session_id "Guest Session identifier"
        datetime created_at
    }

    ORGANIZATION {
        uuid id PK
        string name
        enum org_type
    }

    MEMBERSHIP {
        uuid id PK
        uuid user_id FK
        uuid org_id FK
        string org_role "Uses SystemRole mapped strings"
        boolean is_active
    }

    INVITATION {
        uuid id PK
        string email
        uuid org_id FK
        uuid inviter_id FK
        string token UK
        string role "Authorized SystemRole"
        enum status "pending, accepted, expired"
        datetime expires_at
    }

    %% DOMAIN 2: PROJEKTE
    PROJECT {
        uuid id PK
        string name
        uuid owner_id FK
        uuid org_id FK
        string guest_session_id "Null if registered"
        enum status
        enum planning_mode
    }

    PROJECT_SNAPSHOT {
        uuid id PK
        uuid project_id FK
        uuid created_by FK
        jsonb snapshot_data
    }

    TEAM_MEMBER {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        enum team_role
    }

    %% DOMAIN 4: COLLAB
    TASK {
        uuid id PK
        uuid project_id FK
        uuid owner_id FK
        uuid depends_on_task_id FK
        string title
        enum priority
        enum status
        datetime current_deadline
    }

    MILESTONE {
        uuid id PK
        uuid project_id FK
        string title
        datetime due_date
        boolean is_completed
    }
    
    ACTIVITY_LOG {
        uuid id PK
        uuid project_id FK
        uuid actor_id FK
        string action_type
    }

    CONVERSATION {
        uuid id PK
        uuid project_id FK
        enum conversation_type "direct, group, project"
    }

    MESSAGE {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        text content
    }

    %% RELATIONSHIPS
    USER ||--o{ MEMBERSHIP : "belongs to"
    ORGANIZATION ||--o{ MEMBERSHIP : "has members"
    USER ||--o{ PROJECT : "owns"
    ORGANIZATION ||--o{ PROJECT : "hosts"
    USER ||--o{ INVITATION : "sends"
    ORGANIZATION ||--o{ INVITATION : "issues for"
    
    PROJECT ||--o{ TEAM_MEMBER : "has members"
    USER ||--o{ TEAM_MEMBER : "assigned to"
    
    PROJECT ||--o{ PROJECT_SNAPSHOT : "versioned as"
    PROJECT ||--o{ TASK : "contains"
    PROJECT ||--o{ MILESTONE : "tracks"
    PROJECT ||--o{ ACTIVITY_LOG : "audits"
    
    USER ||--o{ TASK : "owns task"
    TASK |o--o| TASK : "depends on"
    
    PROJECT |o--o{ CONVERSATION : "scopes"
    CONVERSATION ||--o{ MESSAGE : "contains"
    USER ||--o{ MESSAGE : "sends"
```

---

## 2. Authentication & Security Flows

### 2.1 Standard Registration vs. Invitation Acceptance Flow

This sequence highlights the security check introduced in the audit (C2 patch): when an invite token is provided, the backend forces the user's role to match the database invitation rather than trusting the frontend request.

```mermaid
sequenceDiagram
    autonumber
    actor Invitee as New User
    participant Frontend as Next.js App
    participant Auth as FastAPI /auth
    participant DB as PostgreSQL (Invitation, User)

    Note over Invitee, DB: PM sends invitation via email (token generated)
    Invitee->>Frontend: Clicks Invite Link (/register?token=abc)
    Frontend->>Auth: GET /invitations/verify/abc
    Auth-->>Frontend: Valid: email, org, role (pre-fills form)
    
    Invitee->>Frontend: Enters password & submits
    Frontend->>Auth: POST /register {email, password, role: "client", invite_token: "abc"}
    
    Note over Auth: Backend ignores role: "client" payload!
    Auth->>DB: Fetch Invitation where token="abc"
    DB-->>Auth: role="team_member", org_id=123
    
    Auth->>DB: Create User {system_role: "team_member", is_verified: true}
    Auth->>DB: Create Membership {user_id, org_id: 123}
    Auth->>DB: Update Invitation {status: "accepted"}
    
    Auth-->>Frontend: 200 OK (Registration Successful)
    Frontend-->>Invitee: Redirects to /login
```

### 2.2 JWT Token Architecture Flow

To prevent Token Confusion (C3), three distinct types of JWTs are issued. Middleware guarantees tokens cannot be used interchangeably.

```mermaid
flowchart TD
    A[Token Generation] --> B{Action Type}
    
    B -->|User Login| C[token_type: "access"]
    B -->|Forgot Password| D[token_type: "reset"]
    B -->|Register (No Invite)| E[token_type: "verify"]
    
    C --> F((Valid for 7 Days))
    D --> G((Valid for 1 Hour))
    E --> F
    
    F --> H[deps.get_current_user]
    H -->|Requires 'access'| I[Dashboard APIs]
    
    G --> J[reset_password API]
    J -->|Requires 'reset'| K[Update Password]
    
    F --> L[verify_email API]
    L -->|Requires 'verify'| M[Mark User Verified]
    
    %% Error Paths
    G -.->|Attempt to use for Login| H
    H -.-X|401 Unauthorized\n(Token Type Mismatch)| O[Blocked]
    
    C -.->|Attempt to Reset Password| J
    J -.-X|400 Bad Request\n(Token Type Mismatch)| O
```

---

## 3. Core Business Logic & Deletions (Cascades)

Because projects contain significant relational data, deleting a project or user requires strict database constraints. If an entity is deleted, `ondelete="CASCADE"` and SQLAlchemy's `delete-orphan` guarantees the database remains clean.

```mermaid
flowchart LR
    subgraph Deletion Cascades
        direction TB
        User(User)
        Org(Organization)
        Proj(Project)
        
        User -.->|Deletes| Memb[Memberships]
        User -.->|Deletes| Task[Tasks Owned]
        User -.->|Deletes| Notif[Notifications]
        
        Org -.->|Deletes| Memb
        Org -.->|Deletes| Inv[Invitations]
        
        Proj -.->|Deletes| TMem[Team Members]
        Proj -.->|Deletes| PTask[Tasks]
        Proj -.->|Deletes| PMil[Milestones]
        Proj -.->|Deletes| PLog[Activity Logs]
        Proj -.->|Deletes| PSnap[Snapshots]
    end
    
    classDef danger fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#991b1b;
    class User,Org,Proj danger;
```

---

## 4. Platform Access Control Logic

The application relies heavily on `system_role` for authorization and routing.

| Role | Access Level | Data Scoping | Dashboard |
|---|---|---|---|
| **Project Manager** (`project_manager`) | Admin | Sees all projects in Organization, manages team members, sees all conversations, manages milestones. | Project Manager Dashboard |
| **Team Member** (`team_member`) | Contributor | Sees only Projects & Tasks explicitly assigned to them in `TeamMember`. Limited to project-scoped conversations. | Team Member Dashboard |
| **Client** (`client`) | Viewer / Approver | Sees only one single Project. View-only access unless specifically asked to comment/approve. | Client Dashboard |
