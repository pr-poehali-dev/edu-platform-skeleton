-- Создание таблицы пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы учебных групп
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    teacher_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы записи студентов в группы
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    UNIQUE(group_id, student_id)
);

-- Создание таблицы банка задач
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    topic VARCHAR(255),
    difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10),
    type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'file', 'code', 'paint', 'table')),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы домашних заданий (наборов задач)
CREATE TABLE homework_sets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы вариантов ДЗ для студентов
CREATE TABLE homework_variants (
    id SERIAL PRIMARY KEY,
    set_id INTEGER NOT NULL REFERENCES homework_sets(id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'checked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(set_id, student_id)
);

-- Создание таблицы конкретных задач в варианте
CREATE TABLE variant_items (
    id SERIAL PRIMARY KEY,
    variant_id INTEGER NOT NULL REFERENCES homework_variants(id),
    task_id INTEGER NOT NULL REFERENCES tasks(id)
);

-- Создание таблицы ответов студентов
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id),
    variant_item_id INTEGER NOT NULL REFERENCES variant_items(id),
    answer_text TEXT,
    answer_file_url VARCHAR(500),
    answer_code TEXT,
    answer_image_url VARCHAR(500),
    answer_table_json TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'checked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для ускорения поиска
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_groups_teacher ON groups(teacher_id);
CREATE INDEX idx_enrollments_group ON enrollments(group_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_homework_sets_created_by ON homework_sets(created_by);
CREATE INDEX idx_homework_variants_set ON homework_variants(set_id);
CREATE INDEX idx_homework_variants_student ON homework_variants(student_id);
CREATE INDEX idx_homework_variants_status ON homework_variants(status);
CREATE INDEX idx_variant_items_variant ON variant_items(variant_id);
CREATE INDEX idx_variant_items_task ON variant_items(task_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_variant_item ON submissions(variant_item_id);
CREATE INDEX idx_submissions_status ON submissions(status);