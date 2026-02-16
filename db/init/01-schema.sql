CREATE DATABASE IF NOT EXISTS ai_debate_db DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_debate_db;
-- Initial schema derived from cahier-des-charges
CREATE TABLE IF NOT EXISTS debates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic VARCHAR(255) NOT NULL,
  position1 TEXT NULL,
  position2 TEXT NULL,
  duration_target INT DEFAULT 12,
  status ENUM('created','generating','audio','video','published','failed') DEFAULT 'created',
  n8n_execution_id VARCHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audio_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  debate_id INT NOT NULL,
  speaker VARCHAR(50),
  path VARCHAR(512),
  duration_seconds INT,
  status ENUM('pending','ready','failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audio_debate FOREIGN KEY (debate_id) REFERENCES debates(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  debate_id INT NOT NULL,
  format ENUM('long','short') DEFAULT 'long',
  path VARCHAR(512),
  duration_seconds INT,
  status ENUM('pending','ready','failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_video_debate FOREIGN KEY (debate_id) REFERENCES debates(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS publications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  video_id INT NOT NULL,
  platform ENUM('youtube','tiktok','instagram') NOT NULL,
  status ENUM('queued','published','failed') DEFAULT 'queued',
  url VARCHAR(512),
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pub_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS webhook_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(50),
  payload JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Indexes
CREATE INDEX idx_debates_status ON debates(status);
CREATE INDEX idx_debates_created ON debates(created_at);
CREATE INDEX idx_videos_debate_format ON videos(debate_id, format);
CREATE INDEX idx_publications_platform_published ON publications(platform, published_at);

