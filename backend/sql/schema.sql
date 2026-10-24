-- Schema matching frontend/src/data.ts Project and Report interfaces

DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    loc VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'jalan',
    status VARCHAR(20) NOT NULL,
    cek BOOLEAN NOT NULL DEFAULT FALSE,
    progress INT NOT NULL,
    elapsed INT NOT NULL,
    sisa INT NOT NULL,
    cost BIGINT NOT NULL,
    apbd INT NOT NULL,
    contractor VARCHAR(255) NOT NULL,
    start VARCHAR(50) NOT NULL,
    "end" VARCHAR(50) NOT NULL,
    x INT NOT NULL,
    y INT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    km NUMERIC(4, 1) NOT NULL,
    stats JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    verdict VARCHAR(20) NOT NULL,
    text TEXT NOT NULL,
    ago VARCHAR(50) NOT NULL,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_cek ON projects(cek);
CREATE INDEX idx_reports_project_id ON reports(project_id);
