-- Создание таблицы связи homework_sets и tasks (многие-ко-многим)
CREATE TABLE homework_tasks (
    id SERIAL PRIMARY KEY,
    set_id INTEGER NOT NULL REFERENCES homework_sets(id),
    task_id INTEGER NOT NULL REFERENCES tasks(id),
    task_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(set_id, task_id)
);

CREATE INDEX idx_homework_tasks_set_id ON homework_tasks(set_id);
CREATE INDEX idx_homework_tasks_task_id ON homework_tasks(task_id);