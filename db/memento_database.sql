-- ============================================================
-- MEMENTO Database Schema / Upgrade Script
-- Target: Microsoft SQL Server (SSMS)
-- Canonical SQL source for the current project.
--
-- This script is intentionally idempotent:
--   * creates the Memento database when it does not exist
--   * creates missing tables/columns/indexes/constraints
--   * preserves existing rows
--   * upgrades older single-memorial data to the new
--     one-family-account -> many deceased profiles model
-- ============================================================

IF DB_ID(N'Memento') IS NULL
BEGIN
    EXEC(N'CREATE DATABASE [Memento]');
END;
GO

USE [Memento];
GO

-- ============================================================
-- TABLE 7: USERS
-- One login/account owner (the grieving family/member).
-- ============================================================
IF OBJECT_ID(N'dbo.USERS', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.USERS (
        User_ID         INT IDENTITY(1,1) NOT NULL,
        email           VARCHAR(100)      NOT NULL,
        password        VARCHAR(255)      NOT NULL,
        first_name      VARCHAR(50)       NOT NULL,
        middle_name     VARCHAR(50)       NULL,
        last_name       VARCHAR(50)       NOT NULL,
        account_type    VARCHAR(20)       NULL,
        created_at      DATETIME2(0)      NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),

        CONSTRAINT PK_Users PRIMARY KEY (User_ID),
        CONSTRAINT UQ_Users_Email UNIQUE (email)
    );
END;
GO

-- Upgrade older password column sizes so scrypt hashes fit safely.
IF COL_LENGTH('dbo.USERS', 'password') IS NOT NULL
BEGIN
    ALTER TABLE dbo.USERS ALTER COLUMN password VARCHAR(255) NOT NULL;
END;
GO

-- ============================================================
-- NEW: DECEASED_PROFILES
-- A single Memento login can manage multiple deceased loved ones.
-- After login, the app shows a Netflix-style profile chooser.
-- ============================================================
IF OBJECT_ID(N'dbo.DECEASED_PROFILES', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DECEASED_PROFILES (
        Deceased_Profile_ID INT IDENTITY(1,1) NOT NULL,
        User_ID             INT               NOT NULL,
        display_name        VARCHAR(160)      NOT NULL,
        relationship        VARCHAR(80)       NULL,
        birth_date          DATE              NULL,
        death_date          DATE              NULL,
        profile_image_url   VARCHAR(500)      NULL,
        biography           VARCHAR(MAX)      NULL,
        created_at          DATETIME2(0)      NOT NULL CONSTRAINT DF_DeceasedProfiles_CreatedAt DEFAULT SYSUTCDATETIME(),
        updated_at          DATETIME2(0)      NOT NULL CONSTRAINT DF_DeceasedProfiles_UpdatedAt DEFAULT SYSUTCDATETIME(),

        CONSTRAINT PK_DeceasedProfiles PRIMARY KEY (Deceased_Profile_ID),
        CONSTRAINT FK_DeceasedProfiles_Users FOREIGN KEY (User_ID)
            REFERENCES dbo.USERS (User_ID)
            ON DELETE CASCADE,
        CONSTRAINT CK_DeceasedProfiles_Dates CHECK (
            birth_date IS NULL OR death_date IS NULL OR death_date >= birth_date
        )
    );
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.DECEASED_PROFILES')
      AND name = N'IX_DeceasedProfiles_User'
)
BEGIN
    CREATE INDEX IX_DeceasedProfiles_User
        ON dbo.DECEASED_PROFILES (User_ID, created_at);
END;
GO

-- ============================================================
-- TABLE 8: SUBSCRIPTIONS
-- Subscription belongs to the family account, not an individual
-- deceased profile.
-- ============================================================
IF OBJECT_ID(N'dbo.SUBSCRIPTIONS', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SUBSCRIPTIONS (
        Subscription_ID INT IDENTITY(1,1) NOT NULL,
        User_ID         INT               NOT NULL,
        plan_type       VARCHAR(50)       NULL,
        status          VARCHAR(50)       NULL,
        expiry_date     DATE              NULL,

        CONSTRAINT PK_Subscriptions PRIMARY KEY (Subscription_ID),
        CONSTRAINT FK_Subscriptions_Users FOREIGN KEY (User_ID)
            REFERENCES dbo.USERS (User_ID)
            ON DELETE CASCADE
    );
END;
GO

-- ============================================================
-- TABLE 9: VIDEO_TRIBUTES
-- Every tribute belongs to both the account owner and one selected
-- deceased profile. User_ID is retained for straightforward ownership
-- filtering; Deceased_Profile_ID provides memorial separation.
-- ============================================================
IF OBJECT_ID(N'dbo.VIDEO_TRIBUTES', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.VIDEO_TRIBUTES (
        Tribute_ID           INT IDENTITY(1,1) NOT NULL,
        User_ID              INT               NOT NULL,
        Deceased_Profile_ID  INT               NOT NULL,
        narrative_text       VARCHAR(MAX)      NULL,
        video_url            VARCHAR(500)      NULL,
        render_status        VARCHAR(50)       NULL,
        created_at           DATETIME2(0)      NOT NULL CONSTRAINT DF_VideoTributes_CreatedAt DEFAULT SYSUTCDATETIME(),

        CONSTRAINT PK_VideoTributes PRIMARY KEY (Tribute_ID),
        CONSTRAINT FK_VideoTributes_Users FOREIGN KEY (User_ID)
            REFERENCES dbo.USERS (User_ID)
            ON DELETE CASCADE,
        CONSTRAINT FK_VideoTributes_DeceasedProfiles FOREIGN KEY (Deceased_Profile_ID)
            REFERENCES dbo.DECEASED_PROFILES (Deceased_Profile_ID)
    );
END;
GO

-- Upgrade an older VIDEO_TRIBUTES table in place.
IF OBJECT_ID(N'dbo.VIDEO_TRIBUTES', N'U') IS NOT NULL
   AND COL_LENGTH('dbo.VIDEO_TRIBUTES', 'Deceased_Profile_ID') IS NULL
BEGIN
    ALTER TABLE dbo.VIDEO_TRIBUTES
        ADD Deceased_Profile_ID INT NULL;
END;
GO

-- Widen legacy columns when present.
IF COL_LENGTH('dbo.VIDEO_TRIBUTES', 'video_url') IS NOT NULL
BEGIN
    ALTER TABLE dbo.VIDEO_TRIBUTES ALTER COLUMN video_url VARCHAR(500) NULL;
END;
GO

-- For deployments upgraded from the old single-dashboard model, create one
-- editable placeholder profile per account that already has unassigned
-- tributes. This keeps historical content visible after the new chooser is
-- introduced. The user can rename this profile in the app.
IF OBJECT_ID(N'dbo.VIDEO_TRIBUTES', N'U') IS NOT NULL
   AND COL_LENGTH('dbo.VIDEO_TRIBUTES', 'Deceased_Profile_ID') IS NOT NULL
BEGIN
    INSERT INTO dbo.DECEASED_PROFILES (User_ID, display_name, relationship, biography)
    SELECT DISTINCT vt.User_ID,
           'Imported Memories',
           NULL,
           'Created automatically while upgrading existing Memento tributes to multi-profile support.'
    FROM dbo.VIDEO_TRIBUTES vt
    WHERE vt.Deceased_Profile_ID IS NULL
      AND NOT EXISTS (
          SELECT 1
          FROM dbo.DECEASED_PROFILES dp
          WHERE dp.User_ID = vt.User_ID
            AND dp.display_name = 'Imported Memories'
      );

    UPDATE vt
       SET vt.Deceased_Profile_ID = dp.Deceased_Profile_ID
    FROM dbo.VIDEO_TRIBUTES vt
    INNER JOIN dbo.DECEASED_PROFILES dp
        ON dp.User_ID = vt.User_ID
       AND dp.display_name = 'Imported Memories'
    WHERE vt.Deceased_Profile_ID IS NULL;
END;
GO

-- Add FK after the upgrade column exists. No cascade is used here so SQL
-- Server does not create multiple cascade paths through USERS.
IF OBJECT_ID(N'dbo.VIDEO_TRIBUTES', N'U') IS NOT NULL
   AND COL_LENGTH('dbo.VIDEO_TRIBUTES', 'Deceased_Profile_ID') IS NOT NULL
   AND NOT EXISTS (
       SELECT 1 FROM sys.foreign_keys
       WHERE parent_object_id = OBJECT_ID(N'dbo.VIDEO_TRIBUTES')
         AND name = N'FK_VideoTributes_DeceasedProfiles'
   )
BEGIN
    ALTER TABLE dbo.VIDEO_TRIBUTES WITH CHECK
        ADD CONSTRAINT FK_VideoTributes_DeceasedProfiles
        FOREIGN KEY (Deceased_Profile_ID)
        REFERENCES dbo.DECEASED_PROFILES (Deceased_Profile_ID);
END;
GO

-- Once legacy rows have been assigned, enforce profile ownership for all
-- future tributes.
IF OBJECT_ID(N'dbo.VIDEO_TRIBUTES', N'U') IS NOT NULL
   AND COL_LENGTH('dbo.VIDEO_TRIBUTES', 'Deceased_Profile_ID') IS NOT NULL
   AND NOT EXISTS (
       SELECT 1 FROM dbo.VIDEO_TRIBUTES WHERE Deceased_Profile_ID IS NULL
   )
BEGIN
    ALTER TABLE dbo.VIDEO_TRIBUTES
        ALTER COLUMN Deceased_Profile_ID INT NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.VIDEO_TRIBUTES')
      AND name = N'IX_VideoTributes_User_Profile'
)
BEGIN
    CREATE INDEX IX_VideoTributes_User_Profile
        ON dbo.VIDEO_TRIBUTES (User_ID, Deceased_Profile_ID, created_at DESC);
END;
GO

-- ============================================================
-- TABLE 10: SUPPLEMENTAL_IMAGES
-- ============================================================
IF OBJECT_ID(N'dbo.SUPPLEMENTAL_IMAGES', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SUPPLEMENTAL_IMAGES (
        Image_ID        INT IDENTITY(1,1) NOT NULL,
        Tribute_ID      INT               NOT NULL,
        image_url       VARCHAR(500)      NULL,
        uploaded_at     DATETIME2(0)      NOT NULL CONSTRAINT DF_SupplementalImages_UploadedAt DEFAULT SYSUTCDATETIME(),

        CONSTRAINT PK_SupplementalImages PRIMARY KEY (Image_ID),
        CONSTRAINT FK_SupplementalImages_Tributes FOREIGN KEY (Tribute_ID)
            REFERENCES dbo.VIDEO_TRIBUTES (Tribute_ID)
            ON DELETE CASCADE
    );
END;
GO

IF COL_LENGTH('dbo.SUPPLEMENTAL_IMAGES', 'image_url') IS NOT NULL
BEGIN
    ALTER TABLE dbo.SUPPLEMENTAL_IMAGES ALTER COLUMN image_url VARCHAR(500) NULL;
END;
GO

-- ============================================================
-- TABLE 11: QR_MATRICES
-- QR ownership is inherited through VIDEO_TRIBUTES -> DECEASED_PROFILES.
-- ============================================================
IF OBJECT_ID(N'dbo.QR_MATRICES', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.QR_MATRICES (
        QR_ID           INT IDENTITY(1,1) NOT NULL,
        Tribute_ID      INT               NOT NULL,
        QR_code_key     VARCHAR(50)       NOT NULL,
        download_count  INT               NOT NULL CONSTRAINT DF_QRMatrices_DownloadCount DEFAULT 0,
        viewer_count    INT               NOT NULL CONSTRAINT DF_QRMatrices_ViewerCount DEFAULT 0,
        created_at      DATETIME2(0)      NOT NULL CONSTRAINT DF_QRMatrices_CreatedAt DEFAULT SYSUTCDATETIME(),

        CONSTRAINT PK_QRMatrices PRIMARY KEY (QR_ID),
        CONSTRAINT FK_QRMatrices_Tributes FOREIGN KEY (Tribute_ID)
            REFERENCES dbo.VIDEO_TRIBUTES (Tribute_ID)
            ON DELETE CASCADE,
        CONSTRAINT UQ_QRMatrices_CodeKey UNIQUE (QR_code_key)
    );
END;
GO

PRINT 'Memento database schema is ready.';
PRINT 'Canonical model: one USERS login -> many DECEASED_PROFILES -> many VIDEO_TRIBUTES.';
GO
