-- Добавление полей в таблицу tasks
ALTER TABLE tasks ADD COLUMN ege_number INTEGER CHECK (ege_number >= 1 AND ege_number <= 27);
ALTER TABLE tasks ADD COLUMN file_url VARCHAR(500);
ALTER TABLE tasks ADD COLUMN image_url VARCHAR(500);

-- Создание таблицы theory
CREATE TABLE theory (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    ege_number INTEGER NOT NULL CHECK (ege_number >= 1 AND ege_number <= 27),
    file_url VARCHAR(500),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавление поля theory_id в homework_sets
ALTER TABLE homework_sets ADD COLUMN theory_id INTEGER REFERENCES theory(id);

-- Добавление полей в homework_variants
ALTER TABLE homework_variants ADD COLUMN final_score INTEGER CHECK (final_score >= 0 AND final_score <= 100);
ALTER TABLE homework_variants ADD COLUMN is_debt BOOLEAN DEFAULT false;

-- Создание индексов для новых полей
CREATE INDEX idx_tasks_ege_number ON tasks(ege_number);
CREATE INDEX idx_theory_ege_number ON theory(ege_number);
CREATE INDEX idx_theory_created_by ON theory(created_by);
CREATE INDEX idx_homework_sets_theory ON homework_sets(theory_id);
CREATE INDEX idx_homework_variants_is_debt ON homework_variants(is_debt);