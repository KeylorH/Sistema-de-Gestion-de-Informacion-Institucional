-- =========================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS - SISTEMA DE GESTIÓN DOCUMENTAL (TEC)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. ROLES Y USUARIOS
CREATE TABLE IF NOT EXISTS roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(30) UNIQUE NOT NULL,
    description varchar(255)
);

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(150) NOT NULL,
    email varchar(255) UNIQUE NOT NULL,
    password_hash varchar(255) NOT NULL,
    position varchar(120),
    active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
    users_id uuid REFERENCES users(id) ON DELETE CASCADE,
    roles_id uuid REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY(users_id, roles_id)
);

-- 2. ÁRBOL DE CARPETAS / ARCHIVO CENTRAL (REQ-EST-001)
CREATE TABLE IF NOT EXISTS folders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(200) NOT NULL,
    code varchar(50) UNIQUE,             
    description text,
    level int NOT NULL DEFAULT 1,        
    color varchar(30) DEFAULT 'Default', 
    sort_order int NOT NULL DEFAULT 0,
    parent_id uuid REFERENCES folders(id) ON DELETE RESTRICT,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_code ON folders(code);

-- 3. CORRESPONDENCIA
CREATE TABLE IF NOT EXISTS correspondence (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(40) UNIQUE NOT NULL,
    subject varchar(250) NOT NULL,
    description text NOT NULL,
    type varchar(80) NOT NULL DEFAULT 'Solicitud',
    priority varchar(30) NOT NULL DEFAULT 'MEDIA',
    status varchar(30) NOT NULL DEFAULT 'PENDIENTE',
    sender_id uuid REFERENCES users(id),
    responsible_id uuid REFERENCES users(id),
    due_date timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- 4. DOCUMENTOS DEL REPOSITORIO
CREATE TABLE IF NOT EXISTS repository_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(250) NOT NULL,
    type varchar(80) NOT NULL,
    category varchar(80) NOT NULL,
    description text,
    version varchar(30),
    status varchar(30) NOT NULL DEFAULT 'ACTIVO',
    original_name varchar(255),
    stored_name varchar(255),
    folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
    responsible_id uuid REFERENCES users(id),
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- 5. TRÁMITES / PROCEDIMIENTOS
CREATE TABLE IF NOT EXISTS procedures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(50) UNIQUE NOT NULL,
    name varchar(250) NOT NULL,
    description text NOT NULL,
    category varchar(100) NOT NULL,
    status varchar(30) NOT NULL DEFAULT 'Activo',
    responsible_area varchar(150) NOT NULL,
    requirements text,
    links jsonb,
    related_forms jsonb,
    folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- 6. FORMULARIOS
CREATE TABLE IF NOT EXISTS forms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(250) NOT NULL,
    description text,
    category varchar(100) NOT NULL,
    format varchar(30) NOT NULL,
    original_name varchar(255),
    stored_name varchar(255),
    created_by_id uuid REFERENCES users(id),
    updated_by_id uuid REFERENCES users(id),
    downloads int NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- 7. ENLACES EXTERNOS
DO $$ BEGIN
    CREATE TYPE external_links_type_enum AS ENUM ('INTERNO', 'EXTERNO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS external_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(180) NOT NULL,
    url varchar NOT NULL,
    description text,
    category varchar(80) NOT NULL DEFAULT 'Institucional',
    type external_links_type_enum NOT NULL DEFAULT 'EXTERNO',
    requires_institutional_network boolean NOT NULL DEFAULT false,
    sort_order int NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    created_by_id uuid REFERENCES users(id),
    updated_by_id uuid REFERENCES users(id),
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- 8. NOTICIAS
CREATE TABLE IF NOT EXISTS news (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(250) NOT NULL,
    summary text NOT NULL,
    content text,
    category varchar(80) NOT NULL DEFAULT 'Campus',
    image_url text,
    author_id uuid REFERENCES users(id),
    published boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- 9. REGISTROS DE AUDITORÍA
CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id),
    action varchar(60) NOT NULL,
    entity varchar(80) NOT NULL,
    entity_id uuid,
    detail text,
    created_at timestamp NOT NULL DEFAULT now()
);