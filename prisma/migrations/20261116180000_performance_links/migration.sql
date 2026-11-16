BEGIN;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '15s';

ALTER TABLE "public"."performances"
    ADD COLUMN "link_url" VARCHAR(2048),
    ADD COLUMN "link_title" VARCHAR(80),
    ADD CONSTRAINT "performances_link_pair_check"
        CHECK (("link_url" IS NULL) = ("link_title" IS NULL));

COMMIT;
