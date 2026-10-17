# Memento - Current SQL Server Data Model

This file documents the implemented Microsoft SQL Server model in `memento_database.sql`.

## Purpose of the multi-profile update

A Memento **family account** may preserve more than one deceased loved one. The login therefore owns multiple `DECEASED_PROFILES`, and the user selects one profile after authentication before viewing that person's tributes and QR codes.

## Relationships

| Parent | Child | Cardinality | Foreign key | Delete behavior |
|---|---|---:|---|---|
| `USERS` | `DECEASED_PROFILES` | 1:N | `DECEASED_PROFILES.User_ID` | CASCADE |
| `USERS` | `SUBSCRIPTIONS` | 1:N | `SUBSCRIPTIONS.User_ID` | CASCADE |
| `USERS` | `VIDEO_TRIBUTES` | 1:N | `VIDEO_TRIBUTES.User_ID` | CASCADE |
| `DECEASED_PROFILES` | `VIDEO_TRIBUTES` | 1:N | `VIDEO_TRIBUTES.Deceased_Profile_ID` | RESTRICT / NO ACTION |
| `VIDEO_TRIBUTES` | `SUPPLEMENTAL_IMAGES` | 1:N | `SUPPLEMENTAL_IMAGES.Tribute_ID` | CASCADE |
| `VIDEO_TRIBUTES` | `QR_MATRICES` | 1:N | `QR_MATRICES.Tribute_ID` | CASCADE |

A deceased profile cannot be deleted while it still owns tributes. The API returns a conflict message instead of deleting memorial content accidentally.

## Mermaid ERD

```mermaid
erDiagram
    USERS ||--o{ DECEASED_PROFILES : "owns"
    USERS ||--o{ SUBSCRIPTIONS : "subscribes"
    USERS ||--o{ VIDEO_TRIBUTES : "owns"
    DECEASED_PROFILES ||--o{ VIDEO_TRIBUTES : "memorializes"
    VIDEO_TRIBUTES ||--o{ SUPPLEMENTAL_IMAGES : "contains"
    VIDEO_TRIBUTES ||--o{ QR_MATRICES : "links"

    USERS {
        INT User_ID PK
        VARCHAR email UK
        VARCHAR password
        VARCHAR first_name
        VARCHAR middle_name
        VARCHAR last_name
        VARCHAR account_type
        DATETIME2 created_at
    }

    DECEASED_PROFILES {
        INT Deceased_Profile_ID PK
        INT User_ID FK
        VARCHAR display_name
        VARCHAR relationship
        DATE birth_date
        DATE death_date
        VARCHAR profile_image_url
        VARCHAR biography
        DATETIME2 created_at
        DATETIME2 updated_at
    }

    SUBSCRIPTIONS {
        INT Subscription_ID PK
        INT User_ID FK
        VARCHAR plan_type
        VARCHAR status
        DATE expiry_date
    }

    VIDEO_TRIBUTES {
        INT Tribute_ID PK
        INT User_ID FK
        INT Deceased_Profile_ID FK
        VARCHAR_MAX narrative_text
        VARCHAR video_url
        VARCHAR render_status
        DATETIME2 created_at
    }

    SUPPLEMENTAL_IMAGES {
        INT Image_ID PK
        INT Tribute_ID FK
        VARCHAR image_url
        DATETIME2 uploaded_at
    }

    QR_MATRICES {
        INT QR_ID PK
        INT Tribute_ID FK
        VARCHAR QR_code_key UK
        INT download_count
        INT viewer_count
        DATETIME2 created_at
    }
```

## Manuscript synchronization note

The uploaded manuscript currently shows five entities and connects `USERS` directly to `VIDEO_TRIBUTES`. Because the requested application flow now supports multiple deceased loved ones per family login, the manuscript ERD/data dictionary/storyboard should be updated to include `DECEASED_PROFILES` and the post-login profile-selection state if exact implementation/documentation parity is required.
