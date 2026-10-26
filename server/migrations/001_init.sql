BEGIN;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name        VARCHAR(120) NOT NULL CHECK (char_length(trim(full_name)) >= 2),
  email            VARCHAR(255) NOT NULL,
  password_hash    TEXT NOT NULL,
  target_role      VARCHAR(150),
  experience_level VARCHAR(20)
    CHECK (experience_level IN ('student','entry','junior','mid','senior','lead')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX users_email_lower_uq ON users (LOWER(email));
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE resumes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name      VARCHAR(255),
  file_url       TEXT,
  extracted_text TEXT NOT NULL CHECK (char_length(extracted_text) >= 50),
  skills         TEXT[] NOT NULL DEFAULT '{}',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX resumes_user_id_idx ON resumes (user_id);
CREATE UNIQUE INDEX resumes_one_active_per_user_uq ON resumes (user_id) WHERE is_active;

CREATE TABLE interviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id        UUID REFERENCES resumes(id) ON DELETE SET NULL,
  job_role         VARCHAR(150) NOT NULL,
  company_name     VARCHAR(150),
  job_description  TEXT,
  interview_type   VARCHAR(20) NOT NULL
    CHECK (interview_type IN ('hr','behavioral','technical','system_design','mixed')),
  difficulty_level VARCHAR(10) NOT NULL DEFAULT 'medium'
    CHECK (difficulty_level IN ('easy','medium','hard')),
  status           VARCHAR(20) NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress','completed','abandoned')),
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  CHECK (completed_at IS NULL OR completed_at >= started_at)
);
CREATE INDEX interviews_user_started_idx ON interviews (user_id, started_at DESC);
CREATE INDEX interviews_resume_id_idx ON interviews (resume_id);

CREATE TABLE questions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id      UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question_order    INT NOT NULL CHECK (question_order > 0),
  question_text     TEXT NOT NULL,
  question_type     VARCHAR(20) NOT NULL
    CHECK (question_type IN ('hr','behavioral','technical','system_design','follow_up')),
  expected_keywords TEXT[] NOT NULL DEFAULT '{}',
  model_name        VARCHAR(60),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (interview_id, question_order)
);

CREATE TABLE answers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id      UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  attempt_number   INT NOT NULL DEFAULT 1 CHECK (attempt_number > 0),
  answer_text      TEXT NOT NULL CHECK (char_length(trim(answer_text)) > 0),
  audio_url        TEXT,
  transcript_text  TEXT,
  duration_seconds INT CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  word_count       INT NOT NULL DEFAULT 0 CHECK (word_count >= 0),
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (question_id, attempt_number)
);

CREATE TABLE answer_feedback (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id               UUID NOT NULL UNIQUE REFERENCES answers(id) ON DELETE CASCADE,
  overall_score           NUMERIC(3,1) NOT NULL CHECK (overall_score BETWEEN 0 AND 10),
  relevance_score         NUMERIC(3,1) NOT NULL CHECK (relevance_score BETWEEN 0 AND 10),
  clarity_score           NUMERIC(3,1) NOT NULL CHECK (clarity_score BETWEEN 0 AND 10),
  structure_score         NUMERIC(3,1) NOT NULL CHECK (structure_score BETWEEN 0 AND 10),
  specificity_score       NUMERIC(3,1) NOT NULL CHECK (specificity_score BETWEEN 0 AND 10),
  confidence_score        NUMERIC(3,1) NOT NULL CHECK (confidence_score BETWEEN 0 AND 10),
  strengths               JSONB NOT NULL DEFAULT '[]',
  weaknesses              JSONB NOT NULL DEFAULT '[]',
  improvement_suggestions JSONB NOT NULL DEFAULT '[]',
  improved_answer         TEXT,
  star_analysis           JSONB,
  model_name              VARCHAR(60),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE interview_summary (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id        UUID NOT NULL UNIQUE REFERENCES interviews(id) ON DELETE CASCADE,
  overall_score       NUMERIC(3,1) NOT NULL CHECK (overall_score BETWEEN 0 AND 10),
  content_score       NUMERIC(3,1) CHECK (content_score BETWEEN 0 AND 10),
  structure_score     NUMERIC(3,1) CHECK (structure_score BETWEEN 0 AND 10),
  communication_score NUMERIC(3,1) CHECK (communication_score BETWEEN 0 AND 10),
  technical_score     NUMERIC(3,1) CHECK (technical_score BETWEEN 0 AND 10),
  total_questions     INT NOT NULL CHECK (total_questions >= 0),
  answered_questions  INT NOT NULL CHECK (answered_questions >= 0),
  strengths           JSONB NOT NULL DEFAULT '[]',
  weaknesses          JSONB NOT NULL DEFAULT '[]',
  recommended_actions JSONB NOT NULL DEFAULT '[]',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (answered_questions <= total_questions)
);

COMMIT;
