-- Categories used by the client's design (Web Proposal PDF):
--   Lajme & Media filters: Të gjitha / Sportet / Akademia / Intervista
--   Shop tabs:             Fanella / Stërvitje / Aksesorë

CREATE TYPE news_category AS ENUM ('lajm', 'akademia', 'intervista', 'klubi', 'komuniteti');
ALTER TABLE news ADD COLUMN category news_category NOT NULL DEFAULT 'lajm';

CREATE TYPE product_category AS ENUM ('fanella', 'stervitje', 'aksesore');
ALTER TABLE products ADD COLUMN category product_category NOT NULL DEFAULT 'fanella';
