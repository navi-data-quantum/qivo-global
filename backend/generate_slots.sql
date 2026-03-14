CREATE OR REPLACE FUNCTION generate_provider_slots(p_provider_id INTEGER)
RETURNS VOID AS $$
DECLARE
    avail RECORD;
    service_rec RECORD;
    start_date DATE := CURRENT_DATE;
    end_date DATE := CURRENT_DATE + INTERVAL '30 days';
    slot_date DATE;
    day_start TIMESTAMP;
    day_end TIMESTAMP;
    slot_start TIMESTAMP;
    slot_end TIMESTAMP;
BEGIN
    FOR avail IN
        SELECT * FROM availability
        WHERE provider_id = p_provider_id
        AND is_active = TRUE
    LOOP
        FOR service_rec IN
            SELECT * FROM services
            WHERE provider_id = p_provider_id
        LOOP
            slot_date := start_date;

            WHILE slot_date <= end_date LOOP
                IF EXTRACT(DOW FROM slot_date) = avail.day_of_week THEN

                    IF NOT EXISTS (
                        SELECT 1 FROM provider_exceptions
                        WHERE provider_id = p_provider_id
                        AND exception_date = slot_date
                    ) THEN

                        day_start := slot_date::timestamp + avail.start_time;
                        day_end   := slot_date::timestamp + avail.end_time;

                        slot_start := day_start;

                        WHILE slot_start + (service_rec.duration_minutes || ' minutes')::INTERVAL <= day_end LOOP
                            slot_end := slot_start + (service_rec.duration_minutes || ' minutes')::INTERVAL;

                            INSERT INTO provider_slots (
                                provider_id,
                                service_id,
                                slot_start,
                                slot_end
                            )
                            VALUES (
                                p_provider_id,
                                service_rec.id,
                                slot_start,
                                slot_end
                            )
                            ON CONFLICT DO NOTHING;

                            slot_start := slot_end;
                        END LOOP;

                    END IF;
                END IF;

                slot_date := slot_date + INTERVAL '1 day';
            END LOOP;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;



