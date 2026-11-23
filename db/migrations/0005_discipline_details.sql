-- Extra discipline details the club is asked for in the data workbook
-- ("Kategoritë / grupmoshat", "Orari i stërvitjeve", "Ambienti / palestra", "Trofetë").

ALTER TABLE disciplines
  ADD COLUMN age_groups_sq    text,
  ADD COLUMN age_groups_en    text,
  ADD COLUMN schedule_sq      text,
  ADD COLUMN schedule_en      text,
  ADD COLUMN venue            text,
  ADD COLUMN achievements_sq  text,
  ADD COLUMN achievements_en  text;
