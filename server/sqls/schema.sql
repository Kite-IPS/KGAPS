-- Create the t_roles table 
CREATE TABLE t_roles(
  role_id INT PRIMARY KEY,  
  designation VARCHAR(24) NOT NULL
);
-- Create the t_departments table
CREATE TABLE t_departments(
  department_id INT PRIMARY KEY,
  department_name VARCHAR(24) NOT NULL
);

-- Create the t_domains table
CREATE TABLE t_domains(
  domain_id INT PRIMARY KEY,
  domain_name VARCHAR(48) NOT NULL
);

-- Create the t_course_details table
CREATE TABLE t_course_details (
  course_code VARCHAR(48) PRIMARY KEY,
  course_name VARCHAR(48) NOT NULL
);

-- Create the t_status table 
CREATE TABLE t_status (
  status_code INT PRIMARY KEY,
  status VARCHAR(24) NOT NULL
);

-- Create the t_users table
CREATE TABLE t_users (
  uid INT PRIMARY KEY,
  name VARCHAR(48) NOT NULL,
  password VARCHAR(48) NOT NULL,
  department_id INT NOT NULL, 
  FOREIGN KEY (department_id) REFERENCES t_departments(department_id)
);

-- Create the t_course_topics table 
CREATE TABLE t_course_topics (
  course_code VARCHAR(48) NOT NULL,
  outcome VARCHAR(4),
  topic VARCHAR(48) NOT NULL,
  topic_id INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  total_hours INT,
  FOREIGN KEY (course_code) REFERENCES t_course_details(course_code)
);

-- Create the l_role_user table
CREATE TABLE l_role_user (
  uid INT NOT NULL,  
  role_id INT NOT NULL,
  FOREIGN KEY (uid) REFERENCES t_users(uid),
  FOREIGN KEY (role_id) REFERENCES t_roles(role_id)
);

-- Create the l_course_departments table
CREATE TABLE l_course_departments (
  course_code VARCHAR(24) NOT NULL,
  department_id INT NOT NULL,
  FOREIGN KEY (course_code) REFERENCES  t_course_details(course_code),
  FOREIGN KEY (department_id) REFERENCES t_departments(department_id)
);

-- Create the l_course_domains table
CREATE TABLE l_course_domains (
  course_code VARCHAR(24) NOT NULL,
  domain_id INT NOT NULL,
  FOREIGN KEY (course_code) REFERENCES  t_course_details(course_code),
  FOREIGN KEY (domain_id) REFERENCES t_domains(domain_id)
);

-- Create the t_topic_links table 
CREATE TABLE t_topic_links (
  topic_id INT NOT NULL,
  handler_id INT NOT NULL,
  url VARCHAR(255),
  FOREIGN KEY (topic_id) REFERENCES t_course_topics(topic_id),
  FOREIGN KEY (handler_id) REFERENCES t_users(uid)
);

-- Create the t_topic_comments table 
CREATE TABLE t_topic_comments (
  topic_id INT NOT NULL,
  handler_id INT NOT NULL,
  comment VARCHAR(255),
  FOREIGN KEY (topic_id) REFERENCES t_course_topics(topic_id),
  FOREIGN KEY (handler_id) REFERENCES t_users(uid)
);

-- Create the t_class table 
CREATE TABLE t_class (
  id INT NOT NULL PRIMARY KEY
);

-- Create the l_class_course table
CREATE TABLE l_class_course (
  class_id INT NOT NULL,
  course_code VARCHAR(24) NOT NULL,
  handler_id INT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES t_class(id),
  FOREIGN KEY (course_code) REFERENCES t_course_details(course_code)
);

-- Create the t_hours_completed table
CREATE TABLE t_complete_status (
  hours_completed INT DEFAULT 0,  
  topic_id INT,  
  handler_id INT,
  course_code VARCHAR(24) NOT NULL,
  status_code INT DEFAULT 0,
  FOREIGN KEY (course_code) REFERENCES t_course_details(course_code),
  FOREIGN KEY (status_code) REFERENCES t_status(status_code), 
  FOREIGN KEY (topic_id) REFERENCES t_course_topics(topic_id),
  FOREIGN KEY (handler_id) REFERENCES t_users(uid)
);

-- Create the l_mentor_courses table
CREATE TABLE l_mentor_courses (    
  mentor_id INT,
  course_code VARCHAR(24) NOT NULL,
  FOREIGN KEY (course_code) REFERENCES t_course_details(course_code),
  FOREIGN KEY (mentor_id) REFERENCES t_users(uid)
);

-- Create the l_faculty_courses table
CREATE TABLE l_faculty_courses (    
  faculty_id INT,
  course_code VARCHAR(24) NOT NULL,
  FOREIGN KEY (course_code) REFERENCES t_course_details(course_code),
  FOREIGN KEY (faculty_id) REFERENCES t_users(uid)
);

-- Create the l_domain_mentors table
CREATE TABLE l_domain_mentors (    
  mentor_id INT NOT NULL,
  domain_id INT NOT NULL,
  FOREIGN KEY (domain_id) REFERENCES t_domains(domain_id),
  FOREIGN KEY (mentor_id) REFERENCES t_users(uid)
);

--view to check user details

create view user_details_check as select u.uid,u.name,u.password,u.department_id,r.role_id from t_users u,l_role_user r where u.uid=r.uid;

--view for faculty table

create view faculty_table as select u.uid,c.course_code,d.course_name,t.topic,t.outcome,c.status_code,c.hours_completed,t.total_hours,c.topic_id,z.url,x.comment, CASE 
    WHEN z.topic_id IS NOT NULL AND z.handler_id = u.uid THEN 1
    ELSE 0
  END AS can_upload  from t_users u,t_complete_status c,t_course_details d,t_course_topics t,t_topic_links z,t_topic_comments x where z.topic_id=t.topic_id and x.topic_id=t.topic_id and z.topic_id=t.topic_id and x.topic_id=t.topic_id and u.uid=c.handler_id and c.course_code=d.course_code and t.topic_id=c.topic_id;

--view for domain mentor table

create view domain_mentor_table as select z.mentor_id,c.course_code,d.course_name,t.topic,t.outcome,CASE 
        WHEN c.status_code = 4 THEN 3
        ELSE c.status_code
    END AS status_code,l.url,y.comment,t.topic_id,q.domain_id  
    FROM l_course_domains q,t_topic_comments y,t_complete_status c,t_course_details d,t_course_topics t,t_topic_links l,l_mentor_courses z where q.course_code=d.course_code and c.course_code=d.course_code and t.topic_id=c.topic_id and l.handler_id=c.handler_id and l.topic_id=c.topic_id and z.course_code=c.course_code and l.handler_id=y.handler_id and l.topic_id=y.topic_id GROUP BY 
    z.mentor_id, 
    c.course_code, 
    d.course_name, 
    t.topic, 
    t.outcome, 
    c.status_code, 
    l.url, 
    y.comment, 
    t.topic_id,
	  q.domain_id;

-- initialize the roles
INSERT INTO t_roles (role_id, designation) VALUES (1, 'Faculty'), (2, 'Course Coordinator'), (3, 'Domain Mentor'),(4,'Head Of Department'),(5,'Supervisor'),(6,'IQAC');

-- initialize the statuses
INSERT INTO t_status (status_code, status) VALUES (0, 'Assigned'), (1, 'Uploaded'),(2,'Disapproved'), (3, 'Approved'),(4,'Awaiting Verification'),(5,'Verified');

-- initialize the departments
INSERT INTO t_departments (department_id, department_name) VALUES (1, 'CSE'), (2,'AI&DS'), (3, 'ECE'),(4,'CSBS'),(5,'IT'),(6,'S&H'),(7,'MECH'),(8,'CYS'),(9,'AI&ML');

-- initialize the domains
INSERT INTO t_domains (domain_id, domain_name) VALUES (1, 'PROGRAMMING'), (2, 'NETWORKS & OPERATING SYSTEMS'), (3, 'ALGORITHMS');

-- mapping  - 111 -first 1 refers to department, second 1 refers to year and next 1 represent A section
INSERT INTO t_class (id) 
VALUES 
(111), (112), (121), (122), (131), (132), (141), (142),
(211), (212), (221), (222), (231), (232), (241), (242),
(311), (312), (321), (322), (331), (332), (341), (342),
(411), (421), (431), (441), (511), (521), (531), (532),
(711), (721), (731), (741), (811), (821), (831), (841),
(911), (921), (931), (941);
-- 1 - cse,2 - ai&ds,3 - ece,4 - csbs,5 - it,6 - s&h,7 - mech,8 - cys,9 - ai&ml