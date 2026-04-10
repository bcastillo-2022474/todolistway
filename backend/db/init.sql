CREATE TABLE member (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    lastname    VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE club (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    schedule    VARCHAR(200),
    location    VARCHAR(200),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE club_member (
    id_member   INT NOT NULL,
    id_club     INT NOT NULL,
    date_assign DATE NOT NULL DEFAULT (CURRENT_DATE),
    PRIMARY KEY (id_member, id_club),
    FOREIGN KEY (id_member) REFERENCES member(id) ON DELETE CASCADE,
    FOREIGN KEY (id_club)   REFERENCES club(id)   ON DELETE CASCADE
);

CREATE TABLE admin (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    lastname    VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event (
    id                INT PRIMARY KEY AUTO_INCREMENT,
    id_club           INT NOT NULL,
    name              VARCHAR(150) NOT NULL,
    description       TEXT,
    datetime          DATETIME NOT NULL,
    location          VARCHAR(200),
    max_participants  INT DEFAULT 0,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_club) REFERENCES club(id) ON DELETE CASCADE
);