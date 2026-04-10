CREATE TABLE IF NOT EXISTS member (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    lastname    VARCHAR(100) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS club (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    schedule    VARCHAR(200),
    location    VARCHAR(200),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS club_member (
    id_member   INT NOT NULL,
    id_club     INT NOT NULL,
    date_assign DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (id_member, id_club),
    CONSTRAINT fk_cm_member FOREIGN KEY (id_member) REFERENCES member(id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_club   FOREIGN KEY (id_club)   REFERENCES club(id)   ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    lastname    VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event (
    id                SERIAL PRIMARY KEY,
    id_club           INT NOT NULL,
    name              VARCHAR(150) NOT NULL,
    description       TEXT,
    datetime          TIMESTAMPTZ NOT NULL,
    location          VARCHAR(200),
    max_participants  INT NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_event_club FOREIGN KEY (id_club) REFERENCES club(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_participant (
    id_event  INT NOT NULL,
    id_member INT NOT NULL,
    PRIMARY KEY (id_event, id_member),
    CONSTRAINT fk_ep_event  FOREIGN KEY (id_event)  REFERENCES event(id)  ON DELETE CASCADE,
    CONSTRAINT fk_ep_member FOREIGN KEY (id_member) REFERENCES member(id) ON DELETE CASCADE
);
