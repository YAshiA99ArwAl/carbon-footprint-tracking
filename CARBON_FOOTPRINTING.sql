-- ============================================================
-- CARBON FOOTPRINT TRACKING SYSTEM
-- COMPLETE BACKEND IMPLEMENTATION
-- ============================================================
-- Submitted by: Palak, Shriya Sidana, Yashita Aggarwal
-- Lab Instructor: Ms. Gayatri Saxena
-- Academic Year: 2025-2026
-- ============================================================

-- ============================================================
-- 1. CLEANUP (DROP TABLE commands - DDL)
-- ============================================================
DROP TABLE EMISSION_RECORD CASCADE CONSTRAINTS;
DROP TABLE ACTIVITY CASCADE CONSTRAINTS;
DROP TABLE EMISSION_FACTOR CASCADE CONSTRAINTS;
DROP TABLE ACTIVITY_TYPE CASCADE CONSTRAINTS;
DROP TABLE USERS CASCADE CONSTRAINTS;
DROP SEQUENCE emission_seq;

-- ============================================================
-- 2. TABLE CREATION (DDL COMMANDS)
-- ============================================================

-- 2.1 USERS Table
CREATE TABLE USERS (
    user_id     NUMBER PRIMARY KEY,
    name        VARCHAR2(100) NOT NULL,
    email       VARCHAR2(100) UNIQUE NOT NULL,
    password    VARCHAR2(100) NOT NULL,
    role        VARCHAR2(20) CHECK (role IN ('User', 'Admin')),
    reg_date    DATE DEFAULT SYSDATE
);

-- 2.2 ACTIVITY_TYPE Table
CREATE TABLE ACTIVITY_TYPE (
    activity_type_id   NUMBER PRIMARY KEY,
    activity_name      VARCHAR2(100) NOT NULL,
    unit               VARCHAR2(50)
);

-- 2.3 EMISSION_FACTOR Table
CREATE TABLE EMISSION_FACTOR (
    activity_type_id   NUMBER PRIMARY KEY,
    emission_per_unit  NUMBER(10,2) NOT NULL,
    CONSTRAINT fk_ef_activity 
        FOREIGN KEY (activity_type_id) 
        REFERENCES ACTIVITY_TYPE(activity_type_id)
);

-- 2.4 ACTIVITY Table
CREATE TABLE ACTIVITY (
    activity_id        NUMBER PRIMARY KEY,
    user_id            NUMBER NOT NULL,
    activity_type_id   NUMBER NOT NULL,
    quantity           NUMBER(10,2) NOT NULL,
    activity_date      DATE DEFAULT SYSDATE,
    CONSTRAINT fk_activity_user 
        FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    CONSTRAINT fk_activity_type 
        FOREIGN KEY (activity_type_id) REFERENCES ACTIVITY_TYPE(activity_type_id)
);

-- 2.5 EMISSION_RECORD Table
CREATE TABLE EMISSION_RECORD (
    record_id      NUMBER PRIMARY KEY,
    activity_id    NUMBER UNIQUE NOT NULL,
    total_emission NUMBER(10,2) NOT NULL,
    calc_date      DATE DEFAULT SYSDATE,
    CONSTRAINT fk_record_activity 
        FOREIGN KEY (activity_id) REFERENCES ACTIVITY(activity_id) ON DELETE CASCADE
);

-- ============================================================
-- 2.6 ALTER TABLE Example (DDL - as required in synopsis)
-- ============================================================
-- Adding a new column 'phone' to USERS table
ALTER TABLE USERS ADD (phone VARCHAR2(15));

-- Modifying column size
ALTER TABLE USERS MODIFY (phone VARCHAR2(20));

-- Dropping the column (optional, kept for demonstration)
-- ALTER TABLE USERS DROP COLUMN phone;

-- ============================================================
-- 3. SEQUENCE FOR AUTO-GENERATED IDs
-- ============================================================
CREATE SEQUENCE emission_seq START WITH 1000;

-- ============================================================
-- 4. SAMPLE DATA (DML COMMANDS - INSERT)
-- ============================================================

-- 4.1 Insert Users
INSERT INTO USERS (user_id, name, email, password, role, reg_date, phone) 
VALUES (1, 'Shriya Sidana', 'shriya@email.com', 'shriya123', 'User', SYSDATE, '9876543210');
INSERT INTO USERS (user_id, name, email, password, role, reg_date, phone) 
VALUES (2, 'Palak', 'palak@email.com', 'palak123', 'Admin', SYSDATE, '9876543211');
INSERT INTO USERS (user_id, name, email, password, role, reg_date, phone) 
VALUES (3, 'Yashita Aggarwal', 'yashita@email.com', 'yashita123', 'User', SYSDATE, '9876543212');

-- 4.2 Insert Activity Types
INSERT INTO ACTIVITY_TYPE VALUES (1, 'Electricity Usage', 'kWh');
INSERT INTO ACTIVITY_TYPE VALUES (2, 'Fuel Consumption', 'liters');
INSERT INTO ACTIVITY_TYPE VALUES (3, 'Transportation', 'km');
INSERT INTO ACTIVITY_TYPE VALUES (4, 'Waste Generation', 'kg');

-- 4.3 Insert Emission Factors (kg CO2 per unit)
INSERT INTO EMISSION_FACTOR VALUES (1, 0.82);   -- Electricity: 0.82 kg per kWh
INSERT INTO EMISSION_FACTOR VALUES (2, 2.31);   -- Fuel: 2.31 kg per liter
INSERT INTO EMISSION_FACTOR VALUES (3, 0.45);   -- Transport: 0.45 kg per km
INSERT INTO EMISSION_FACTOR VALUES (4, 1.15);   -- Waste: 1.15 kg per kg

COMMIT;

-- ============================================================
-- 5. FUNCTION – Calculate Emission
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_emission(
    p_quantity NUMBER,
    p_activity_type_id NUMBER
) RETURN NUMBER IS
    v_factor NUMBER;
BEGIN
    SELECT emission_per_unit INTO v_factor
    FROM EMISSION_FACTOR
    WHERE activity_type_id = p_activity_type_id;
    
    RETURN ROUND(p_quantity * v_factor, 2);
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
END;
/

-- ============================================================
-- 6. PROCEDURE – Add Activity
-- ============================================================
CREATE OR REPLACE PROCEDURE add_activity(
    p_activity_id   NUMBER,
    p_user_id       NUMBER,
    p_activity_type NUMBER,
    p_quantity      NUMBER
) IS
    v_emission NUMBER;
BEGIN
    INSERT INTO ACTIVITY (activity_id, user_id, activity_type_id, quantity, activity_date)
    VALUES (p_activity_id, p_user_id, p_activity_type, p_quantity, SYSDATE);
    
    v_emission := calculate_emission(p_quantity, p_activity_type);
    
    INSERT INTO EMISSION_RECORD (record_id, activity_id, total_emission, calc_date)
    VALUES (p_activity_id, p_activity_id, v_emission, SYSDATE);
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE(' Activity added. Emission: ' || v_emission || ' kg CO2');
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE(' Error: ' || SQLERRM);
END;
/

-- ============================================================
-- 7. PROCEDURE – Update Activity (DML - UPDATE)
-- ============================================================
CREATE OR REPLACE PROCEDURE update_activity(
    p_activity_id NUMBER,
    p_new_quantity NUMBER
) IS
    v_activity_type NUMBER;
    v_new_emission NUMBER;
BEGIN
    SELECT activity_type_id INTO v_activity_type
    FROM ACTIVITY WHERE activity_id = p_activity_id;
    
    UPDATE ACTIVITY 
    SET quantity = p_new_quantity 
    WHERE activity_id = p_activity_id;
    
    v_new_emission := calculate_emission(p_new_quantity, v_activity_type);
    
    UPDATE EMISSION_RECORD 
    SET total_emission = v_new_emission, calc_date = SYSDATE
    WHERE activity_id = p_activity_id;
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE(' Activity updated. New emission: ' || v_new_emission || ' kg CO2');
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE(' Error: ' || SQLERRM);
END;
/

-- ============================================================
-- 8. PROCEDURE – Delete Activity (DML - DELETE)
-- ============================================================
CREATE OR REPLACE PROCEDURE delete_activity(
    p_activity_id NUMBER
) IS
BEGIN
    DELETE FROM ACTIVITY WHERE activity_id = p_activity_id;
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Activity deleted successfully');
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE(' Error: ' || SQLERRM);
END;
/

-- ============================================================
-- 9. TRIGGER – Automatic Emission Calculation
-- ============================================================
CREATE OR REPLACE TRIGGER trg_auto_calculate_emission
    AFTER INSERT ON ACTIVITY
    FOR EACH ROW
DECLARE
    v_emission NUMBER;
BEGIN
    v_emission := calculate_emission(:NEW.quantity, :NEW.activity_type_id);
    
    INSERT INTO EMISSION_RECORD (record_id, activity_id, total_emission, calc_date)
    VALUES (emission_seq.NEXTVAL, :NEW.activity_id, v_emission, SYSDATE);
    
    DBMS_OUTPUT.PUT_LINE(' Trigger fired: ' || v_emission || ' kg CO2 recorded');
END;
/

-- ============================================================
-- 10. CURSOR – Generate Emission Report
-- ============================================================
CREATE OR REPLACE PROCEDURE generate_report IS
    CURSOR user_report_cursor IS
        SELECT u.name, SUM(er.total_emission) AS total_co2
        FROM USERS u
        LEFT JOIN ACTIVITY a ON u.user_id = a.user_id
        LEFT JOIN EMISSION_RECORD er ON a.activity_id = er.activity_id
        GROUP BY u.name
        ORDER BY total_co2 DESC;
    
    v_name USERS.name%TYPE;
    v_total NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('========================================');
    DBMS_OUTPUT.PUT_LINE('     CARBON FOOTPRINT REPORT');
    DBMS_OUTPUT.PUT_LINE('========================================');
    
    OPEN user_report_cursor;
    LOOP
        FETCH user_report_cursor INTO v_name, v_total;
        EXIT WHEN user_report_cursor%NOTFOUND;
        
        IF v_total IS NULL THEN
            DBMS_OUTPUT.PUT_LINE(v_name || ' : No activities recorded');
        ELSE
            DBMS_OUTPUT.PUT_LINE(v_name || ' : ' || v_total || ' kg CO2');
        END IF;
    END LOOP;
    CLOSE user_report_cursor;
    
    DBMS_OUTPUT.PUT_LINE('========================================');
END;
/

-- ============================================================
-- 11. VIEWS – Summary Reports
-- ============================================================

-- View 1: User Emission Summary
CREATE OR REPLACE VIEW emission_summary AS
SELECT 
    u.user_id,
    u.name,
    COUNT(a.activity_id) AS total_activities,
    NVL(SUM(er.total_emission), 0) AS total_emission_kg
FROM USERS u
LEFT JOIN ACTIVITY a ON u.user_id = a.user_id
LEFT JOIN EMISSION_RECORD er ON a.activity_id = er.activity_id
GROUP BY u.user_id, u.name;

-- View 2: Activity-wise Breakdown
CREATE OR REPLACE VIEW activity_breakdown AS
SELECT 
    at.activity_name,
    COUNT(a.activity_id) AS times_done,
    SUM(er.total_emission) AS total_co2
FROM ACTIVITY_TYPE at
JOIN ACTIVITY a ON at.activity_type_id = a.activity_type_id
JOIN EMISSION_RECORD er ON a.activity_id = er.activity_id
GROUP BY at.activity_name
ORDER BY total_co2 DESC;

-- ============================================================
-- 12. EXCEPTION HANDLING EXAMPLES
-- ============================================================

-- Example 1: Handle duplicate email error
BEGIN
    INSERT INTO USERS (user_id, name, email, password, role, reg_date, phone) 
    VALUES (4, 'Test', 'duplicate@email.com', 'pass', 'User', SYSDATE, '9999999999');
    INSERT INTO USERS (user_id, name, email, password, role, reg_date, phone) 
    VALUES (5, 'Test2', 'duplicate@email.com', 'pass2', 'User', SYSDATE, '9999999998');
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: Duplicate email address!');
        ROLLBACK;
END;
/

-- Example 2: Handle invalid activity type in function
DECLARE
    v_result NUMBER;
BEGIN
    v_result := calculate_emission(100, 99);
    IF v_result IS NULL THEN
        DBMS_OUTPUT.PUT_LINE(' ERROR: Activity type not found!');
    END IF;
END;
/

-- ============================================================
-- 13. TRANSACTION MANAGEMENT (COMMIT, ROLLBACK, SAVEPOINT)
-- ============================================================
DECLARE
    v_activity_id NUMBER := 500;
BEGIN
    SAVEPOINT start_point;
    
    INSERT INTO ACTIVITY VALUES (v_activity_id, 1, 1, 100, SYSDATE);
    
    -- Example condition (change to 1=1 to test rollback)
    IF 1 = 0 THEN
        ROLLBACK TO start_point;
        DBMS_OUTPUT.PUT_LINE('Transaction rolled back');
    ELSE
        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Transaction committed successfully');
    END IF;
END;
/

-- ============================================================
-- 14. SAMPLE QUERIES (JOIN, Subquery)
-- ============================================================

-- Query 1: JOIN Query – Total emission per user
SELECT 
    u.name,
    SUM(er.total_emission) AS total_emission_kg
FROM USERS u
JOIN ACTIVITY a ON u.user_id = a.user_id
JOIN EMISSION_RECORD er ON a.activity_id = er.activity_id
GROUP BY u.name;

-- Query 2: Subquery – Users with high activity (quantity > 100)
SELECT name
FROM USERS
WHERE user_id IN (
    SELECT DISTINCT user_id
    FROM ACTIVITY
    WHERE quantity > 100
);

-- Query 3: Most polluting activity type
SELECT at.activity_name, SUM(er.total_emission) AS total_co2
FROM ACTIVITY_TYPE at
JOIN ACTIVITY a ON at.activity_type_id = a.activity_type_id
JOIN EMISSION_RECORD er ON a.activity_id = er.activity_id
GROUP BY at.activity_name
ORDER BY total_co2 DESC
FETCH FIRST 1 ROW ONLY;

-- ============================================================
-- 15. TESTING COMMANDS (Run these to verify everything works)
-- ============================================================

-- Test 1: Add an activity (Trigger will auto-calculate)
INSERT INTO ACTIVITY VALUES (201, 1, 1, 100, SYSDATE);

-- Test 2: Generate report
EXEC generate_report;

-- Test 3: Update an activity
EXEC update_activity(201, 150);

-- Test 4: Delete an activity
EXEC delete_activity(201);

-- Test 5: Query the views
SELECT * FROM emission_summary;
SELECT * FROM activity_breakdown;

-- ============================================================
-- END OF SCRIPT
-- ============================================================