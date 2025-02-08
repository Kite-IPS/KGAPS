from flask import Flask, request, jsonify
import sqlalchemy
import os
import requests
import pandas as pd
import json
import atexit
from io import StringIO
from apscheduler.schedulers.background import BackgroundScheduler
import datetime
from collections import defaultdict
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
app.secret_key = "helloworld"
engine = sqlalchemy.create_engine(
    "postgresql://admin:admin@172.24.96.1/kgaps")
conn = engine.connect()

# helper functions
def progress_color(comp,total):
    try:
        value=comp/total
    except:
        return 'black'
    if value==1:
        return 'blue'
    elif value<1:
        return 'green'
    else:
        print(value)
        return 'red'

#
#   Cron job for updating progress of assignments
#
def update_table():
    try:
        print(f"Update started at: {datetime.datetime.now()}")
        print("Scheduler started with the API server.")
        q = sqlalchemy.text(f"select link,assignment_id from t_course_assignments;")
        r = conn.execute(q).fetchall()
        print(r)
        if r:
            data = [dict(i._mapping) for i in r]
            for i in data:
                if "gid=" in i['link']:
                    gid = i['link'].split("gid=")[1].split("#")[0]  # Extract GID
                    base_url = i['link'].split("/edit")[0]  # Base URL before /edit
                    csv_url = f"{base_url}/export?format=csv&gid={gid}"  # Build CSV export link
                else:
                    raise ValueError("Invalid Google Sheets URL. Make sure it includes a GID.")
                response = requests.get(csv_url)
                df = pd.read_csv(StringIO(response.text), skiprows=5)
                extracted_column = df['Completion']  # Extract the 'Completion' column

                # Count occurrences of "Y" and "y"
                yes_count = extracted_column.str.strip().str.lower().value_counts().get("y", 0)
                no_count = extracted_column.str.strip().str.lower().value_counts().get("n", 0)
                print(f"YES: {yes_count} | NO: {no_count} | Progress: {int((yes_count/(yes_count + no_count))*100)}")
                if no_count!=0:
                    q = sqlalchemy.text(f"update t_course_assignments set progress={int((yes_count/(yes_count + no_count))*100)} where assignment_id={i['assignment_id']};")
                    r = conn.execute(q)
                    conn.commit()
                    print("Table updated successfully!")
            return json.dumps({"response":"Table updated successfully!"})
        else:
            return json.dumps({"response":"no assignments added"})
            
    except Exception as e:
        print(f"Error occurred: {e}")

print("Scheduler created")
# Initialize the scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(update_table, 'cron', hour=0, minute=0)  # Run every night at 12 AM
scheduler.start()
print("Scheduler started")


#
#   GENERAL SECTION
#
    
# verifies user details
@app.route('/api/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        role = request.json['role']
        uid = request.json['username']
        password = request.json['password']
        if uid.isalpha():
            print("error")
            return json.dumps({'Error': 'Incorrect details entered'})
        q = sqlalchemy.text(f"SELECT uid,name,role_id,department_id FROM user_details_check WHERE uid='{uid}' and password='{password}' and role_id={role};")
        r = conn.execute(q).fetchall()
        if r:
            data = [dict(i._mapping) for i in r]
            if data[0]['role_id']==3:
                print("here")
                q = sqlalchemy.text(f"SELECT domain_id from l_domain_mentors where mentor_id={uid};")
                if conn.execute(q).fetchone():
                    data[0]['domain_id']=conn.execute(q).fetchone()[0]
                else:
                    return json.dumps({'Error':'Mentor has no assigned Domain'})
            print(data)
            response = jsonify(data[0])
            return response
        else:
            print("error - incorrect details entered")
            return json.dumps({'Error': 'Incorrect details entered'})

# creates new user
@app.route('/api/register', methods=['POST', 'GET'])
def register():
    if request.method == 'POST':
        role = request.json['role']
        name = request.json['name']
        password = request.json['password']
        dept_id = request.json['department_id']
        id = request.json['id']
        p = sqlalchemy.text(
        f"SELECT * FROM t_users WHERE uid='{id}'")
        if not conn.execute(p).fetchall():
            q = sqlalchemy.text(f"INSERT INTO t_users VALUES({id},'{name}','{password}',{dept_id});")
            conn.execute(q)
        q = sqlalchemy.text(f"SELECT * FROM l_role_user WHERE uid='{id}' AND role_id={role};")
        if not conn.execute(q).fetchall():
                    q = sqlalchemy.text(f"INSERT INTO l_role_user VALUES ('{id}',{role});")
                    conn.execute(q)
        conn.commit()
        print("Successfully created new user - "+str(name)+" with role - "+str(role))
        return json.dumps({'data': 'Success'})


#
#   VIEW ALLOCATED COURSE SECTION
#

# CREATION PART FUNCTIONS

# gets the courses assigned to a particular faculty
@app.route('/api/faculty_courses', methods=['POST', 'GET'])
def faculty_courses():
    uid = request.json['uid']
    q = sqlalchemy.text(
        f"SELECT distinct l.course_code,t.course_name FROM l_class_course l,t_course_details t WHERE l.handler_id='{uid}' and l.course_code=t.course_code;")
    if conn.execute(q).fetchall() is not None:
        r = conn.execute(q).fetchall()
        if r:
            data = [dict(i._mapping) for i in r]
            print(data)
            return json.dumps(data)
    else:
        return json.dumps({"response":"no courses assigned"})

# gets the course assigned to a particular course coordinator
@app.route('/api/coordinator_courses', methods=['POST', 'GET'])
def coordinator_courses():
    uid = request.json['uid']
    q = sqlalchemy.text(
        f"SELECT l.course_code,t.course_name FROM l_mentor_courses l,t_course_details t WHERE l.mentor_id='{uid}' and l.course_code=t.course_code;")
    if conn.execute(q).fetchall():
        r = conn.execute(q).fetchall()
        if r:
            data = [dict(i._mapping) for i in r]
            print(data)
            return json.dumps(data)
    else:
        return json.dumps({"response":"no courses assigned"})

# gets the course under a particular domain mentor
@app.route('/api/domain_courses', methods=['POST', 'GET'])
def domain_courses():
    domain_id = request.json['domain_id']
    q = sqlalchemy.text(
        f"SELECT SUBSTRING(l.class_id::TEXT FROM 2 FOR 1)::INT AS year, ARRAY_AGG(DISTINCT JSONB_BUILD_OBJECT('course_code', l.course_code, 'course_name', t.course_name)) AS courses FROM l_class_course l JOIN t_course_details t ON l.course_code = t.course_code JOIN l_course_domains d ON l.course_code = d.course_code WHERE d.domain_id = '{domain_id}' GROUP BY year ORDER BY year;")
    if conn.execute(q).fetchall():
        r = conn.execute(q).fetchall()
        if r:
            data = [dict(i._mapping) for i in r]
            print(data)
            return json.dumps(data)
    else:
        return json.dumps({"response":"no courses assigned"})

# gets the course under a particular HOD
@app.route('/api/department_courses', methods=['POST', 'GET'])
def department_courses():
    department_id = request.json['department_id']
    q = sqlalchemy.text(
        f"SELECT SUBSTRING(l.class_id::TEXT FROM 2 FOR 1)::INT AS year, ARRAY_AGG(DISTINCT JSONB_BUILD_OBJECT('course_code', l.course_code, 'course_name', t.course_name)) AS courses FROM l_class_course l JOIN t_course_details t ON l.course_code = t.course_code JOIN l_course_departments d ON l.course_code = d.course_code WHERE d.department_id = '{department_id}' GROUP BY year ORDER BY year;")
    if conn.execute(q).fetchall():
        r = conn.execute(q).fetchall()
        if r:
            data = [dict(i._mapping) for i in r]
            print(data)
            return json.dumps(data)
    else:
        return json.dumps({"response":"no courses assigned"})

# gets the course under a particular Supervisor
@app.route('/api/supervisor_courses', methods=['POST', 'GET'])
def supervisor_courses():
    q = sqlalchemy.text("""
        SELECT 
            d.department_id, 
            d.department_name, 
            ARRAY_AGG(cd.course_code) AS course_codes, 
            ARRAY_AGG(cd.course_name) AS course_names 
        FROM 
            t_departments d
        JOIN 
            l_course_departments lcd ON d.department_id = lcd.department_id
        JOIN 
            t_course_details cd ON lcd.course_code = cd.course_code
        GROUP BY 
            d.department_id, d.department_name 
        ORDER BY 
            d.department_id;
    """)
    result = conn.execute(q).fetchall()
    if result:
        data = []
        for row in result:
            courses = [
                {"course_code": code, "course_name": name}
                for code, name in zip(row.course_codes, row.course_names)
            ]
            data.append({
                "department_id": row.department_id,
                "department_name": row.department_name,
                "courses": courses
            })
        print(data)
        return json.dumps(data), 200, {'Content-Type': 'application/json'}
    else:
        return json.dumps({"response": "no courses assigned"}), 404, {'Content-Type': 'application/json'}
    
# HANDLING PART FUNCTIONS

# gets the courses assigned to a particular faculty
@app.route('/api/handling_faculty_courses', methods=['POST', 'GET'])
def handling_faculty_courses():
    uid = request.json['uid']
    q = sqlalchemy.text(
        f"SELECT l.course_code,t.course_name,l.class_id FROM l_class_course l,t_course_details t WHERE l.handler_id='{uid}' and l.course_code=t.course_code;")
    if conn.execute(q).fetchall() is not None:
        r = conn.execute(q).fetchall()
        print(r)
        if r:
            data = [dict(i._mapping) for i in r]
            return json.dumps(data)
    else:
        return json.dumps({"response":"no courses assigned"})
    

# gets the course assigned to a particular course coordinator
@app.route('/api/handling_coordinator_courses', methods=['POST', 'GET'])
def handling_coordinator_courses():
    uid = request.json['uid']
    q = sqlalchemy.text(
        f"SELECT l.course_code,t.course_name,f.class_id FROM l_mentor_courses l,t_course_details t,l_class_course f WHERE l.mentor_id='{uid}' and l.course_code=t.course_code and f.course_code=l.course_code;")
    if conn.execute(q).fetchall():
        r = conn.execute(q).fetchall()
        if r:
            data = [dict(i._mapping) for i in r]
            print(data)
            return json.dumps(data)
    else:
        return json.dumps({"response":"no courses assigned"})

# gets the course under a particular domain mentor
@app.route('/api/handling_domain_courses', methods=['POST', 'GET'])
def handling_domain_courses():
    domain_id = request.json['domain_id']
    q = sqlalchemy.text(
        f"SELECT SUBSTRING(l.class_id::TEXT FROM 2 FOR 1)::INT AS year, ARRAY_AGG(DISTINCT JSONB_BUILD_OBJECT('course_code', l.course_code, 'course_name', t.course_name,'class_id', l.class_id)) AS courses FROM l_class_course l JOIN t_course_details t ON l.course_code = t.course_code JOIN l_course_domains d ON l.course_code = d.course_code WHERE d.domain_id = '{domain_id}' GROUP BY year ORDER BY year;")
    if conn.execute(q).fetchall():
        r = conn.execute(q).fetchall()
        if r:
            data = [dict(i._mapping) for i in r]
            print(data)
            return json.dumps(data)
    else:
        return json.dumps({"response":"no courses assigned"})

# gets the course under a particular HOD
@app.route('/api/handling_department_courses', methods=['POST', 'GET'])
def handling_department_courses():
    class_id = request.json['class_id']
    q = sqlalchemy.text(
        f"SELECT l.class_id, ARRAY_AGG(DISTINCT JSONB_BUILD_OBJECT('course_code', l.course_code, 'course_name', t.course_name,'handler_id',l.handler_id,'handler_name',u.name)) AS courses FROM l_class_course l JOIN t_course_details t ON l.course_code = t.course_code JOIN user_details_check u on l.handler_id=u.uid where l.class_id={class_id} group by l.class_id order by l.class_id;")
    if conn.execute(q).fetchall():
        r = conn.execute(q).fetchall()
        if r:
            data = [dict(i._mapping) for i in r]
            print(data)
            return json.dumps(data)
    else:
        return json.dumps({"response":"no courses assigned"})

# MISCELLANEOUS    

# gets the faculties assigned to a particular course
@app.route('/api/faculty_course_info', methods=['POST', 'GET'])
def faculty_course_info():
    course_code = request.json['course_code']
    q = sqlalchemy.text(f"select u.uid,u.name,l.class_id from l_class_course l,user_details_check u where l.handler_id=u.uid and u.role_id=1 and l.course_code='{course_code}';")  
    r = conn.execute(q).fetchall()
    data = [dict(i._mapping) for i in r]
    print(data)
    return json.dumps(data)

#
#  ASSIGNMENTS AND RESULTS SECTION
#

# adds assignments to a particular class   
@app.route('/api/add_assignment', methods=['POST', 'GET'])
def add_assignment():
    if request.method == 'POST':
        course_code = request.json['course_code']
        assignment = request.json['assignment']
        class_id = request.json['class_id']
        link = request.json['link']
        print(course_code,assignment,class_id,link)
        q = sqlalchemy.text(f"INSERT INTO t_course_assignments(course_code,assignment,class_id,link) VALUES('{course_code}','{assignment}',{class_id},'{link}');")
        conn.execute(q)
        conn.commit()  
        print("successfully added assignment "+str(assignment))
        if "gid=" in link:
                    gid = link.split("gid=")[1].split("#")[0]  # Extract GID
                    base_url = link.split("/edit")[0]  # Base URL before /edit
                    csv_url = f"{base_url}/export?format=csv&gid={gid}"  # Build CSV export link
        else:
            return json.dumps({"response":"Invalid Google Sheets URL. Make sure it includes a GID."})
        response = requests.get(csv_url)
        df = pd.read_csv(StringIO(response.text), skiprows=5)
        extracted_column = df['Completion']  # Extract the 'Completion' column

        # Count occurrences of "Y" and "y"
        yes_count = extracted_column.str.strip().str.lower().value_counts().get("y", 0)
        no_count = extracted_column.str.strip().str.lower().value_counts().get("n", 0)
        print(f"YES: {yes_count} | NO: {no_count} | Progress: {int((yes_count/(yes_count + no_count))*100)}")
        q = sqlalchemy.text(f"update t_course_assignments set progress={int((yes_count/(yes_count + no_count))*100)} where link='{link}';")
        r = conn.execute(q)
        conn.commit()
        print("Table updated successfully!")
        return json.dumps({'response': 'Success'})
    return json.dumps({'response': 'incorrect method'})

# adds results to a particular class   
@app.route('/api/add_result', methods=['POST', 'GET'])
def add_result():
    if request.method == 'POST':
        course_code = request.json['course_code']
        result = request.json['result']
        class_id = request.json['class_id']
        link = request.json['link']
        print(course_code,result,class_id,link)
        q = sqlalchemy.text(f"INSERT INTO t_course_results(course_code,result,class_id,link) VALUES('{course_code}','{result}',{class_id},'{link}');")
        conn.execute(q)
        conn.commit()  
        print("successfully added assignment "+str(result))
        if "gid=" in link:
                    gid = link.split("gid=")[1].split("#")[0]  # Extract GID
                    base_url = link.split("/edit")[0]  # Base URL before /edit
                    csv_url = f"{base_url}/export?format=csv&gid={gid}"  # Build CSV export link
        else:
            return json.dumps({"response":"Invalid Google Sheets URL. Make sure it includes a GID."})
        response = requests.get(csv_url)
        df = pd.read_csv(StringIO(response.text), skiprows=5)
        extracted_column = df['Completion']  # Extract the 'Completion' column

        # Count occurrences of "Y" and "y"
        yes_count = extracted_column.str.strip().str.lower().value_counts().get("y", 0)
        no_count = extracted_column.str.strip().str.lower().value_counts().get("n", 0)
        print(f"YES: {yes_count} | NO: {no_count} | Progress: {int((yes_count/(yes_count + no_count))*100)}")
        q = sqlalchemy.text(f"update t_course_results set progress={int((yes_count/(yes_count + no_count))*100)} where link='{link}';")
        r = conn.execute(q)
        conn.commit()
        print("Table updated successfully!")
        return json.dumps({'response': 'Success'})
    return json.dumps({'response': 'incorrect method'})

# gets classes for a particular topic to which no mentor is assigned 
@app.route('/api/course_classes_assignments', methods=['POST', 'GET'])
def course_classes_assignments():
    course_code = request.json['course_code']
    uid = request.json['uid']
    q = sqlalchemy.text(
        f"select * from l_class_course where course_code = '{course_code}' and handler_id={uid};")
    r = conn.execute(q).fetchall()
    data = [dict(i._mapping) for i in r]
    
    print(data)
    return json.dumps(data)

# view for faculty
@app.route('/api/handling_faculty_assignments', methods=['POST', 'GET'])
def handling_faculty_assignments():
    course_code=request.json['course_code']
    class_id = request.json['class_id']
    q = sqlalchemy.text(f"SELECT * FROM assignment_table_handling WHERE course_code='{course_code}' and class_id='{class_id}';")
    if (conn.execute(q).fetchall()):
        r = conn.execute(q).fetchall()
        data = [dict(i._mapping) for i in r]
        print(data)
        return json.dumps(data)
    return json.dumps({'response':'No topics assigned yet'})

# view for faculty
@app.route('/api/handling_faculty_results', methods=['POST', 'GET'])
def handling_faculty_results():
    course_code=request.json['course_code']
    class_id = request.json['class_id']
    q = sqlalchemy.text(f"SELECT * FROM assignment_table_handling WHERE course_code='{course_code}' and class_id='{class_id}';")
    if (conn.execute(q).fetchall()):
        r = conn.execute(q).fetchall()
        data = [dict(i._mapping) for i in r]
        print(data)
        return json.dumps(data)
    return json.dumps({'response':'No topics assigned yet'})

#
#   COURSE MANAGEMENT SECTION
#

# adds courses to the database
@app.route('/api/add_course', methods=['POST', 'GET'])
def add_course():
    if request.method == 'POST':
        course_code = request.json['course_code']
        course_name = request.json['course_name']
        dept_id = request.json['department_id']
        domain_id = request.json['domain_id']
        year = request.json['year']
        combined_id = str(dept_id)+str(year)
        if (conn.execute(sqlalchemy.text(f"select * from l_course_departments where course_code='{course_code}' and department_id='{dept_id}';")).first() != None):
            print("error-course exists")
            return json.dumps({'error': 'course already exists'})
        elif (conn.execute(sqlalchemy.text(f"select * from l_course_departments where course_code='{course_code}';")).first() != None):
            q = sqlalchemy.text(
                f"INSERT INTO l_course_departments VALUES('{course_code}',{dept_id});")
            conn.execute(q)
            q = sqlalchemy.text(f"INSERT INTO l_class_course(class_id,course_code,handler_id) SELECT id,'{course_code}',0 FROM t_class WHERE id::text LIKE '{combined_id}_';")
            conn.execute(q)
            print("ALREADY ASSIGNED COURSE course "+course_code+"-"+course_name+" is also added to department "+str(dept_id))        
        else:
            q = sqlalchemy.text(f"INSERT INTO t_course_details VALUES('{course_code}','{course_name}');")
            conn.execute(q)
            q = sqlalchemy.text(
                f"INSERT INTO l_course_departments VALUES('{course_code}',{dept_id});")
            conn.execute(q)
            q = sqlalchemy.text(f"INSERT INTO l_course_domains VALUES('{course_code}','{domain_id}');")
            conn.execute(q)
            q = sqlalchemy.text(f"INSERT INTO l_class_course(class_id,course_code,handler_id) SELECT id,'{course_code}',0 FROM t_class WHERE id::text LIKE '{combined_id}_';")
            conn.execute(q)
            print("course "+course_code+"-"+course_name+"added to department "+str(dept_id))
        conn.commit()
        return json.dumps({'data': 'Success'})

# assigns a course to a particular class   
@app.route('/api/assign_course', methods=['POST', 'GET'])
def assign_course():
    if request.method == 'POST':
        course_code = request.json['course_code']
        uid = request.json['uid']
        class_id = request.json['class_id']
        print(course_code,uid)
        if conn.execute(sqlalchemy.text(f"Select * from l_class_course where course_code='{course_code}' and handler_id={uid} and class_id='{class_id}';")).first() != None:
            return json.dumps({'response': 'mentor is already assigned that course for that class'})
        q = sqlalchemy.text(f"update l_class_course set handler_id='{uid}' where class_id={class_id} and course_code='{course_code}';")
        conn.execute(q)
        conn.commit()  
        print("successfully assigned to faculty "+str(uid))
        return json.dumps({'response': 'Success'})
    return json.dumps({'response': 'incorrect method'})

#
#   VIEW ALLOCATED TOPICS SECTION (TABLE CONTENT)
#

# CREATION PART FUNCTIONS

# view for faculty
@app.route('/api/faculty', methods=['POST', 'GET'])
def faculty():
    uid=request.json['uid']
    course_code=request.json['course_code']
    q = sqlalchemy.text(f"SELECT * FROM faculty_table WHERE uid={uid} and course_code='{course_code}';")
    if (conn.execute(q).fetchall()):
        r = conn.execute(q).fetchall()
        data = [dict(i._mapping) for i in r]
        print(data)
        return json.dumps(data)
    return json.dumps({'response':'No topics assigned yet'})


# view for course coordinator
@app.route('/api/course_mentor', methods=['POST', 'GET'])
def course_mentor():
    id = request.json['uid']
    q = sqlalchemy.text(f"SELECT * FROM domain_mentor_table where mentor_id={id};")
    if conn.execute(q).first():
        r=conn.execute(q).fetchall()
        if r:
            data = [dict(i._mapping) for i in r]
            print(data)
            return json.dumps(data)
    else:
        return json.dumps({'response':'No topics added'})


# view for domain mentor
@app.route('/api/domain_mentor', methods=['POST', 'GET'])
def domain_mentor():
    domain_id = request.json['domain_id']
    course_code = request.json['course_code']
    print(domain_id)
    q = sqlalchemy.text(f"SELECT * FROM domain_mentor_table where domain_id='{domain_id}' and course_code='{course_code}';")
    if conn.execute(q).first():
        r=conn.execute(q).fetchall()
        if r:
            data = [dict(i._mapping) for i in r]
            print(data)
            return json.dumps(data)
    else:
        return json.dumps({'response':'No topics added'})


# view for HOD (for creation part)
@app.route('/api/head_of_department', methods=['POST', 'GET'])
def head_of_department():
    course_code = request.json['course_code']
    q = sqlalchemy.text(f"SELECT DISTINCT course_code,course_name,topic,outcome,topic_id,CASE WHEN status_code > 3 THEN 3 ELSE status_code END AS status_code,url,comment FROM faculty_table where course_code='{course_code}';")
    if conn.execute(q).first():
        r=conn.execute(q).fetchall()
        if r:
            data = [dict(i._mapping) for i in r]
            print(data)
            return json.dumps(data)
    else:
        return json.dumps({'response':'No topics added'})

# HANDLING PART FUNCTIONS

# view for faculty
@app.route('/api/handling_faculty', methods=['POST', 'GET'])
def handling_faculty():
    course_code=request.json['course_code']
    class_id = request.json['class_id']
    q = sqlalchemy.text(f"SELECT * FROM faculty_table_handling WHERE course_code='{course_code}' and class_id='{class_id}';")
    if (conn.execute(q).fetchall()):
        r = conn.execute(q).fetchall()
        data = [dict(i._mapping) for i in r]
        print(data)
        return json.dumps(data)
    return json.dumps({'response':'No topics assigned yet'})


# view for hod and supervisor (for admin-entry part)
@app.route('/api/courses', methods=['POST', 'GET'])
def courses():
    dept_id = request.json['department_id']
    q = sqlalchemy.text(
        f"Select c.course_code,c.course_name from t_course_details c,l_course_departments l where c.course_code=l.course_code and l.department_id='{dept_id}';")
    r = conn.execute(q).fetchall()
    data = [dict(i._mapping) for i in r]
    print(data)
    return json.dumps(data)

#
#  TOPIC MANAGEMENT SECTION
#

# gets classes for a particular topic to which no mentor is assigned 
@app.route('/api/course_classes', methods=['POST', 'GET'])
def course_classes():
    course_code = request.json['course_code']
    q = sqlalchemy.text(
        f"select * from l_class_course where course_code = '{course_code}' and handler_id=0;")
    r = conn.execute(q).fetchall()
    data = [dict(i._mapping) for i in r]
    
    print(data)
    return json.dumps(data)

# view topics for a particular course
@app.route('/api/topics', methods=['POST', 'GET'])
def topics():
    course_code = request.json['course_code']
    q = sqlalchemy.text(
        f"Select c.topic_id,c.topic,c.outcome from t_course_topics c where c.course_code='{course_code}';")
    r = conn.execute(q).fetchall()
    data = [dict(i._mapping) for i in r]
    print(data)
    return json.dumps(data)

# add topics for a particular course
@app.route('/api/add_topic', methods=['POST', 'GET'])
def add_topic():
    if request.method == 'POST':
        course_code = request.json['course_code']
        topic = request.json['topic']
        outcome = request.json['outcome']
        total_hours = request.json['total_hours']
        uid= request.json['uid']
        if conn.execute(sqlalchemy.text(f"select topic_id from t_course_topics where course_code='{course_code}' and topic='{topic}';")).first() != None:
            print("error-topic exists")
            return json.dumps({'error': 'topic already exists in course'})
        q = sqlalchemy.text(f"INSERT INTO t_course_topics(course_code,outcome,topic,total_hours) VALUES('{course_code}','{outcome}','{topic}',{total_hours});")
        conn.execute(q)
        q = sqlalchemy.text(f"select topic_id from t_course_topics where course_code='{course_code}' and topic='{topic}';")
        topic_id=conn.execute(q).fetchone()[0]
        if conn.execute(sqlalchemy.text(f"""
                SELECT {topic_id}, handler_id, '{course_code}', 0,class_id
                FROM  l_class_course
                WHERE l_class_course.course_code = '{course_code}' and handler_id=0;""")).first() != None:
            return json.dumps({'error': 'not all classes have faculty assigned to course'})
        try:
            q = sqlalchemy.text(f"""
                INSERT INTO t_complete_status (topic_id, handler_id, course_code, status_code,uploader_id)
                SELECT {topic_id}, handler_id, '{course_code}', 0,{uid}
                FROM  l_class_course
                WHERE l_class_course.course_code = '{course_code}';
            """)
            conn.execute(q)
            q = sqlalchemy.text(f"""
                INSERT INTO t_handling_hours (topic_id, handler_id, course_code, status_code,class_id)
                SELECT {topic_id}, handler_id, '{course_code}', 0,class_id
                FROM  l_class_course
                WHERE l_class_course.course_code = '{course_code}';
            """)
            conn.execute(q)
        except Exception as e:
            print(e)
            return json.dumps({'error': 'not all classes have faculty assigned to course'})
            # logic to add a old topics to new staff but indirectly this case is handled as above query will throw error if each course code doesnt have an assigned staff
            # not tested
            # q=sqlalchemy.text(f"""
            #     INSERT INTO t_complete_status (topic_id, handler_id, course_code, status_code)
            #     SELECT  
            #         t.topic_id, 
            #         l.handler_id, 
            #         t.course_code, 
            #         0
            #     FROM 
            #         t_course_topics t
            #     CROSS JOIN 
            #         (SELECT DISTINCT handler_id, course_code FROM l_class_course) l
            #     LEFT JOIN 
            #         t_complete_status c 
            #     ON 
            #         t.topic_id = c.topic_id 
            #         AND l.handler_id = c.handler_id 
            #         AND t.course_code = c.course_code
            #     WHERE 
            #         t.course_code = '{course_code}' 
            #         AND c.topic_id IS NULL;
            # """)
            # conn.execute(q)
        conn.commit()
        return json.dumps({'data': 'Success'})

#
#   GETTING USER DETAILS FOR EACH ROLE
#

# gets the details of all the faculty in a department
@app.route('/api/faculty_info', methods=['POST', 'GET'])
def faculty_info():
    department_id = request.json['department_id']
    q = sqlalchemy.text(f"select uid,name from user_details_check where role_id=1 and department_id={department_id};")  
    r = conn.execute(q).fetchall()
    data = [dict(i._mapping) for i in r]
    print(data)
    return json.dumps(data)

# gets the details of all the course coordinators in a department
@app.route('/api/course_coordinator_info', methods=['POST', 'GET'])
def course_coordinator_info():
    department_id = request.json['department_id']
    q = sqlalchemy.text(f"select uid,name from user_details_check where role_id=2 and department_id={department_id};")  
    r = conn.execute(q).fetchall()
    data = [dict(i._mapping) for i in r]
    print(data)
    return json.dumps(data)

# used to get list of course coordinators along with their courses
@app.route('/api/mentor_list', methods=['POST', 'GET'])
def mentor_list():
    department_id = request.json['department_id']
    q = sqlalchemy.text(f"select b.uid,b.name,c.course_code from t_users b,l_mentor_courses c,l_course_departments d where b.uid=c.mentor_id and c.course_code=d.course_code and d.department_id={department_id};")
    r = conn.execute(q).fetchall()
    data = [dict(i._mapping) for i in r]
    print(data)
    return json.dumps(data)

# gets the details of all the domain mentors in a department
@app.route('/api/domain_mentor_info', methods=['POST', 'GET'])
def domain_mentor_info():
    department_id = request.json['department_id']
    q = sqlalchemy.text(f"select uid,name from user_details_check where role_id=3 and department_id={department_id};")  
    r = conn.execute(q).fetchall()
    data = [dict(i._mapping) for i in r]
    print(data)
    return json.dumps(data)

#
#   ASSIGNING MENTORS TO COURSES
#

# assigns course coordinator to a course
@app.route('/api/assign_mentor', methods=['POST', 'GET'])
def assign_mentor():
    course_code = request.json['course_code']
    uid = request.json['uid']
    if conn.execute(sqlalchemy.text(f"Select * from l_mentor_courses where mentor_id='{uid}';")).first() != None:
            print("error-already assigned")
            return json.dumps({'response': 'mentor is already assigned to a course'})
    q = sqlalchemy.text(f"insert into l_mentor_courses values({uid},'{course_code}');")
    conn.execute(q)
    conn.commit()
    return json.dumps({'response': 'Success'})

# assigns domain mentor to a course
@app.route('/api/assign_domain_mentor', methods=['POST', 'GET'])
def assign_domain_mentor():
    domain_id = request.json['domain_id']
    mentor_id = request.json['mentor_id']
    if conn.execute(sqlalchemy.text(f"Select * from l_domain_mentors where mentor_id={mentor_id};")).first() != None:
            print("error-already assigned")
            return json.dumps({'response': 'domain mentor is already assigned to a domain'})
    q = sqlalchemy.text(f"insert into l_domain_mentors values({mentor_id},{domain_id});")
    conn.execute(q)
    conn.commit()
    return json.dumps({'response': 'Success'})

#
#   CREATION PART - MANAGEMENT SECTION
#

# used to edit comment on a topic of a faculty for a class by domain mentor
@app.route('/api/editcomment/<int:approval>', methods=['POST', 'GET'])
def editcomment(approval):
    # approval can be true or false
    topic_id = request.json['topic_id']
    comment = request.json.get('comment', '') 
    q = sqlalchemy.text(f"update t_complete_status set status_code={3 if approval else 2},comment = '{comment}' where topic_id={topic_id};")
    conn.execute(q)
    if approval:
        q = sqlalchemy.text(f"update t_handling_hours set status_code=3 where topic_id={topic_id};")
        conn.execute(q)
    conn.commit()
    return json.dumps({'data': 'Success'})

# used to edit link on a topic of a faculty for a class by faculty/course coordinator
@app.route('/api/editlink', methods=['POST', 'GET'])
def editlink():
    topic_id = request.json['topic_id']
    link = request.json['url']
    q = sqlalchemy.text(f"update t_complete_status set status_code=1,url='{link}' where topic_id={topic_id};")
    conn.execute(q)
    conn.commit()
    return json.dumps({'data': 'Success'})

#
#   HANDLING PART - MANAGEMENT SECTION
#

# used to edit hours completed by a faculty
@app.route('/api/edithourscompleted', methods=['POST', 'GET'])
def edithourscompleted():
    topic_id = request.json['topic_id']
    hours_completed = request.json['hours_completed']
    class_id = request.json['class_id']
    q = sqlalchemy.text(f"update t_handling_hours set status_code=4,hours_completed={hours_completed} where class_id={class_id} and topic_id={topic_id};")
    conn.execute(q)
    conn.commit()
    return json.dumps({'data': 'Success'})

# used to verify hours completed by a faculty (hod does this)
@app.route('/api/verify_hours', methods=['POST', 'GET'])
def verifyhours():
    topic_id = request.json['topic_id']
    class_id = request.json['class_id']
    q = sqlalchemy.text(f"update t_handling_hours set status_code=5 where class_id={class_id} and topic_id={topic_id};")
    conn.execute(q)
    conn.commit()
    return json.dumps({'data': 'Success'})

#
#   PROGRESS SECTION (GENERATES DATA FOR GRAPHS)
# 

# used to generate data for progress of a faculty
@app.route('/api/faculty_progress', methods=['POST', 'GET'])
def facultyprogress():
    handler_id = request.json['uid']
    q = sqlalchemy.text(f"SELECT CASE WHEN status_code > 3 THEN 3 ELSE status_code END AS status_code, COUNT(*) AS count FROM faculty_table WHERE uid = {handler_id} GROUP BY CASE WHEN status_code > 3 THEN 3 ELSE status_code END;")
    r = conn.execute(q).fetchall()
    status = {0:"Not uploaded",1:"Uploaded",2:"Disapproved",3:"Approved"}
    color_status = {0:'lightgrey',1:'orange',2:'red',3:'green'}
    codes,mdata,mcolor = [status[i[0]] for i in r],[i[1] for i in r],[color_status[i[0]] for i in r]
    q = sqlalchemy.text(f"SELECT course_code,CASE WHEN status_code > 3 THEN 3 ELSE status_code END AS status_code, COUNT(*) AS count FROM faculty_table WHERE uid = {handler_id} GROUP BY course_code, CASE WHEN status_code > 3 THEN 3 ELSE status_code END;")
    r = conn.execute(q).fetchall()
    print(r)
    data = defaultdict(lambda: defaultdict(int))
    for course_id, status_code, count in r:
        data[course_id][status[status_code]] = count,color_status[status_code]
    json_output = json.dumps(data)
    q = sqlalchemy.text(f"""
        SELECT COALESCE(active_courses.hours_completed, 0) AS hours_completed, 
        COALESCE(active_courses.total_hours, 0) AS total_hours, all_courses.course_code,cd.course_name,all_courses.class_id 
        FROM (SELECT DISTINCT course_code,class_id FROM faculty_table_handling WHERE uid = '{handler_id}') AS all_courses 
        LEFT JOIN (SELECT course_code, SUM(hours_completed) AS hours_completed, SUM(total_hours) 
        AS total_hours,class_id FROM faculty_table_handling WHERE status_code = 5 AND uid = '{handler_id}' 
        GROUP BY course_code, uid,class_id) AS active_courses ON all_courses.course_code = active_courses.course_code 
		and all_courses.class_id=active_courses.class_id JOIN t_course_details cd 
        ON all_courses.course_code = cd.course_code order by class_id;
    """)
    r = conn.execute(q).fetchall()
    course_data_current = []
    for i in r:
        temp={'completed_hours':i[0],'total_hours':i[1],'bar_color':progress_color(i[0],i[1]),'course_code':i[2],'course_name':i[3],'class_id':i[4]}
        course_data_current.append(temp)
    q = sqlalchemy.text(f"""
        SELECT all_courses.course_code,cd.course_name,COALESCE(active_courses.active_course_count, 0) as total_count,all_courses.total_course_count AS active_course_count,all_courses.class_id 
	    FROM (SELECT course_code, COUNT(*) AS total_course_count,class_id FROM faculty_table_handling WHERE uid = '{handler_id}' 
	    GROUP BY course_code, uid,class_id) AS all_courses LEFT JOIN (SELECT course_code, COUNT(*) AS active_course_count,class_id 
	    FROM faculty_table_handling WHERE uid = '{handler_id}' AND status_code = 5 GROUP BY course_code, uid,class_id) AS active_courses 
	    ON all_courses.course_code = active_courses.course_code and all_courses.class_id=active_courses.class_id JOIN t_course_details cd ON all_courses.course_code = cd.course_code order by class_id;
    """)
    r = conn.execute(q).fetchall()
    course_data_overall = []
    for i in r:
        temp={'course_code':i[0],'course_name':i[1],'count':i[2],'total_count':i[3],'class_id':i[4]}
        course_data_overall.append(temp)
    q = sqlalchemy.text(f"""
        SELECT 
            a.class_id,
            c.course_code,
            d.course_name,
            COALESCE(SUM(c.progress), 0) / NULLIF(COUNT(c.assignment_id), 0) AS avg_progress
        FROM 
            l_class_course a
        JOIN 
            t_course_assignments c ON a.class_id = c.class_id 
        JOIN 
            t_course_details d ON c.course_code = d.course_code
        WHERE
            a.handler_id = '{handler_id}'
        GROUP BY 
            a.class_id, c.course_code, d.course_name, a.handler_id;""")
    assignment_data = []
    r = conn.execute(q).fetchall()
    for i in r:
        temp={'class_id':i[0],'course_code':i[1],'course_name':i[2],'avg_progress':i[3]}
        assignment_data.append(temp)
    print({'main':{'status_code':codes,'count': mdata,'color': mcolor},'other':json_output,'course_data_current':course_data_current,'course_data_overall':course_data_overall,'assignment_data':assignment_data})
    return json.dumps({'main':{'status_code':codes,'count': mdata,'color': mcolor},'other':json_output,'course_data_current':course_data_current,'course_data_overall':course_data_overall,'assignment_data':assignment_data}) 

# used to generate data for progress of a course
@app.route('/api/course_progress', methods=['POST', 'GET'])
def course_progress():
    course_code = request.json['course_code']
    q = sqlalchemy.text(f"SELECT CASE WHEN status_code > 3 THEN 3 ELSE status_code END AS status_code, COUNT(*) FROM domain_mentor_table WHERE course_code = '{course_code}' GROUP BY CASE WHEN status_code > 3 THEN 3 ELSE status_code END, course_code;")
    r = conn.execute(q).fetchall()
    status = {0:"Not uploaded",1:"Uploaded",2:"Disapproved",3:"Approved"}
    color_status = {0:'lightgrey',1:'orange',2:'red',3:'green'}
    codes,mdata,mcolor = [status[i[0]] for i in r],[i[1] for i in r],[color_status[i[0]] for i in r]
    q = sqlalchemy.text(f"""
        SELECT all_courses.uid, t.name, all_courses.course_code, COALESCE(active_courses.hours_completed, 0) AS hours_completed, COALESCE(active_courses.total_hours, 0) AS total_hours, cd.course_name,all_courses.class_id 
        FROM (SELECT DISTINCT course_code, uid,class_id FROM faculty_table_handling WHERE course_code = '{course_code}') AS all_courses 
        LEFT JOIN (SELECT course_code, uid, SUM(hours_completed) AS hours_completed, SUM(total_hours) AS total_hours,class_id 
        FROM faculty_table_handling WHERE status_code = 5 AND course_code = '{course_code}'  
        GROUP BY course_code, uid,class_id) AS active_courses ON all_courses.course_code = active_courses.course_code 
		AND all_courses.uid = active_courses.uid and all_courses.class_id=active_courses.class_id JOIN t_users t ON all_courses.uid = t.uid 
		JOIN t_course_details cd ON all_courses.course_code = cd.course_code order by class_id;
    """)
    r = conn.execute(q).fetchall()
    course_data_current = []
    for i in r:
        temp={'uid':i[0],'name':i[1],'course_code':i[2],'completed_hours':i[3],'total_hours':i[4],'bar_color':progress_color(i[3],i[4]),'course_name':i[5],'class_id':i[6]}
        course_data_current.append(temp)
    q = sqlalchemy.text(f"""
        SELECT f.uid, t.name, f.course_code, COUNT(*) AS total_topics_assigned, SUM(CASE WHEN f.status_code = 5 THEN 1 ELSE 0 END) AS topics_completed, cd.course_name,f.class_id 
        FROM faculty_table_handling f JOIN t_users t ON t.uid = f.uid JOIN t_course_details cd ON f.course_code = cd.course_code WHERE f.course_code = '{course_code}' 
        GROUP BY f.uid, f.course_code, t.name, cd.course_name,f.class_id order by class_id;
    """)
    r = conn.execute(q).fetchall()
    course_data_overall = []
    for i in r:
        temp={'uid':i[0],'name':i[1],'course_code':i[2],'count':i[4],'total_count':i[3],'course_name':i[5],'class_id':i[6]}
        course_data_overall.append(temp)
    q = sqlalchemy.text(f"""
        SELECT 
            a.class_id,
            c.course_code,
            d.course_name,
            a.handler_id,
            COALESCE(SUM(c.progress), 0) / NULLIF(COUNT(c.assignment_id), 0) AS avg_progress
        FROM 
            l_class_course a
        JOIN 
            t_course_assignments c ON a.class_id = c.class_id 
        JOIN 
            t_course_details d ON c.course_code = d.course_code
        WHERE
            c.course_code = '{course_code}'
        GROUP BY 
            a.class_id, c.course_code, d.course_name, a.handler_id;""")
    assignment_data = []
    r = conn.execute(q).fetchall()
    for i in r:
        temp={'class_id':i[0],'course_code':i[1],'course_name':i[2],'handler_id':i[3],'avg_progress':i[4]}
        assignment_data.append(temp)
    print({'course_data_overall':course_data_overall,'course_data_current':course_data_current,'assignment_data':assignment_data})
    return json.dumps({'main':{'status_code':codes,'count': mdata,'color': mcolor},'course_data_overall':course_data_overall,'course_data_current':course_data_current,'assignment_data':assignment_data})   

# used to generate data for progress of a course
@app.route('/api/class_progress', methods=['POST', 'GET'])
def class_progress():
    class_id = request.json['class_id']
    q = sqlalchemy.text(f"""
        SELECT all_courses.uid, t.name, all_courses.course_code, COALESCE(active_courses.hours_completed, 0) AS hours_completed, COALESCE(active_courses.total_hours, 0) AS total_hours, cd.course_name,all_courses.class_id 
        FROM (SELECT DISTINCT course_code, uid,class_id FROM faculty_table_handling WHERE class_id={class_id}) AS all_courses 
        LEFT JOIN (SELECT course_code, uid, SUM(hours_completed) AS hours_completed, SUM(total_hours) AS total_hours,class_id 
        FROM faculty_table_handling WHERE status_code = 5 AND class_id = {class_id} 
        GROUP BY course_code, uid,class_id) AS active_courses ON all_courses.course_code = active_courses.course_code 
		AND all_courses.uid = active_courses.uid and all_courses.class_id=active_courses.class_id JOIN t_users t ON all_courses.uid = t.uid 
		JOIN t_course_details cd ON all_courses.course_code = cd.course_code order by class_id;
    """)
    r = conn.execute(q).fetchall()
    course_data_current = []
    for i in r:
        temp={'uid':i[0],'name':i[1],'course_code':i[2],'completed_hours':i[3],'total_hours':i[4],'bar_color':progress_color(i[3],i[4]),'course_name':i[5],'class_id':i[6]}
        course_data_current.append(temp)
    q = sqlalchemy.text(f"""
        SELECT f.uid, t.name, f.course_code, COUNT(*) AS total_topics_assigned, SUM(CASE WHEN f.status_code = 5 THEN 1 ELSE 0 END) AS topics_completed, cd.course_name,f.class_id 
        FROM faculty_table_handling f JOIN t_users t ON t.uid = f.uid JOIN t_course_details cd ON f.course_code = cd.course_code WHERE f.class_id = '{class_id}' 
        GROUP BY f.uid, f.course_code, t.name, cd.course_name,f.class_id order by class_id;
    """)
    r = conn.execute(q).fetchall()
    course_data_overall = []
    for i in r:
        temp={'uid':i[0],'name':i[1],'course_code':i[2],'count':i[4],'total_count':i[3],'course_name':i[5],'class_id':i[6]}
        course_data_overall.append(temp)
    q = sqlalchemy.text(f"""
        SELECT 
            a.class_id,
            c.course_code,
            d.course_name,
            a.handler_id,
            COALESCE(SUM(c.progress), 0) / NULLIF(COUNT(c.assignment_id), 0) AS avg_progress
        FROM 
            l_class_course a
        JOIN 
            t_course_assignments c ON a.class_id = c.class_id 
        JOIN 
            t_course_details d ON c.course_code = d.course_code
        WHERE
            a.class_id = '{class_id}'
        GROUP BY 
            a.class_id, c.course_code, d.course_name, a.handler_id;""")
    assignment_data = []
    r = conn.execute(q).fetchall()
    for i in r:
        temp={'class_id':i[0],'course_code':i[1],'course_name':i[2],'handler_id':i[3],'avg_progress':i[4]}
        assignment_data.append(temp)
    print({'course_data_overall':course_data_overall,'course_data_current':course_data_current,'assignment_data':assignment_data})
    return json.dumps({'course_data_overall':course_data_overall,'course_data_current':course_data_current,'assignment_data':assignment_data})

# used to generate data for progress of a department
@app.route('/api/department_overall_progress', methods=['POST', 'GET'])
def department_overall_progress():
    department_id = request.json['department_id']
    q = sqlalchemy.text(f"""
        SELECT CASE WHEN f.status_code > 3 THEN 3 ELSE f.status_code END AS status_code, 
        COUNT(*) AS count FROM faculty_table f,l_course_departments l 
        WHERE f.course_code=l.course_code and department_id={department_id} 
        GROUP BY CASE WHEN status_code > 3 THEN 3 ELSE status_code END;
    """)
    r = conn.execute(q).fetchall()
    status = {0:"Not uploaded",1:"Uploaded",2:"Disapproved",3:"Approved"}
    color_status = {0:'lightgrey',1:'orange',2:'red',3:'green'}
    codes,mdata,mcolor = [status[i[0]] for i in r],[i[1] for i in r],[color_status[i[0]] for i in r]
    q = sqlalchemy.text(f"""
        SELECT 
        SUM(active_courses.hours_completed)::bigint AS hours_completed, 
        SUM(active_courses.total_hours)::bigint AS total_hours
        FROM (
        SELECT DISTINCT course_code, uid, class_id 
        FROM faculty_table_handling 
        WHERE class_id::TEXT SIMILAR TO '{department_id}%'
        ) AS all_courses
        LEFT JOIN (
        SELECT course_code, uid, SUM(hours_completed) AS hours_completed, SUM(total_hours) AS total_hours, class_id 
        FROM faculty_table_handling 
        WHERE status_code = 5 AND class_id::TEXT SIMILAR TO '{department_id}%'
        GROUP BY course_code, uid, class_id
        ) AS active_courses 
        ON all_courses.course_code = active_courses.course_code 
        AND all_courses.uid = active_courses.uid 
        AND all_courses.class_id = active_courses.class_id
        JOIN t_users t ON all_courses.uid = t.uid 
        JOIN t_course_details cd ON all_courses.course_code = cd.course_code;
    """)
    r = conn.execute(q).fetchall()
    course_data_current = []
    for i in r:
        temp={'department_id':department_id,'completed_hours':i[0],'total_hours':i[1],'bar_color':progress_color(i[0],i[1])}
        course_data_current.append(temp)
    q = sqlalchemy.text(f"""
        SELECT 
        SUM(total_topics_assigned)::bigint AS total_topics_assigned, 
        SUM(topics_completed)::bigint AS topics_completed
        FROM (
        SELECT 
            COUNT(*) AS total_topics_assigned, 
            SUM(CASE WHEN f.status_code = 5 THEN 1 ELSE 0 END) AS topics_completed
        FROM faculty_table_handling f
        JOIN t_users t ON t.uid = f.uid
        JOIN t_course_details cd ON f.course_code = cd.course_code
        WHERE f.class_id::TEXT SIMILAR TO '{department_id}%'
        GROUP BY f.uid, f.course_code, t.name, cd.course_name, f.class_id
        ) AS aggregated_data;
    """)
    r = conn.execute(q).fetchall()
    course_data_overall = []
    for i in r:
        temp={'department_id':department_id,'count':i[1],'total_count':i[0]}
        course_data_overall.append(temp)
    print({'department_overall':course_data_overall,'department_current':course_data_current})
    q = sqlalchemy.text(f"""
        SELECT 
            COALESCE(SUM(c.progress), 0) / NULLIF(COUNT(c.assignment_id), 0) AS avg_progress
        FROM 
            l_class_course a
        JOIN 
            t_course_assignments c ON a.class_id = c.class_id 
        JOIN 
            t_course_details d ON c.course_code = d.course_code
		JOIN 
			l_course_departments l ON a.course_code=l.course_code
		WHERE 
			l.department_id={department_id}""")
    assignment_data = []
    r = conn.execute(q).fetchall()
    for i in r:
        temp={'department_id':department_id,'avg_progress':i[0]}
        assignment_data.append(temp)
    print(assignment_data,codes,mdata,mcolor)
    return json.dumps({'department_id':department_id,'department_overall':course_data_overall,'department_current':course_data_current,'creation':{'status_code':codes,'count': mdata,'color': mcolor},'assignment_data':assignment_data})

# used to generate data for progress of all departments
@app.route('/api/all_department_overall_progress', methods=['POST', 'GET'])
def all_department_overall_progress():
    departments = [1,2,3,4,5,6,7,8,9]
    overall_progress=[]
    for department_id in departments:
        q = sqlalchemy.text(f"""
            SELECT CASE WHEN f.status_code > 3 THEN 3 ELSE f.status_code END AS status_code, 
            COUNT(*) AS count FROM faculty_table f,l_course_departments l 
            WHERE f.course_code=l.course_code and department_id={department_id} 
            GROUP BY CASE WHEN status_code > 3 THEN 3 ELSE status_code END;
        """)
        r = conn.execute(q).fetchall()
        status = {0:"Not uploaded",1:"Uploaded",2:"Disapproved",3:"Approved"}
        color_status = {0:'lightgrey',1:'orange',2:'red',3:'green'}
        codes,mdata,mcolor = [status[i[0]] for i in r],[i[1] for i in r],[color_status[i[0]] for i in r]
        q = sqlalchemy.text(f"""
            SELECT 
            SUM(active_courses.hours_completed)::bigint AS hours_completed, 
            SUM(active_courses.total_hours)::bigint AS total_hours
            FROM (
            SELECT DISTINCT course_code, uid, class_id 
            FROM faculty_table_handling 
            WHERE class_id::TEXT SIMILAR TO '{department_id}%'
            ) AS all_courses
            LEFT JOIN (
            SELECT course_code, uid, SUM(hours_completed) AS hours_completed, SUM(total_hours) AS total_hours, class_id 
            FROM faculty_table_handling 
            WHERE status_code = 5 AND class_id::TEXT SIMILAR TO '{department_id}%'
            GROUP BY course_code, uid, class_id
            ) AS active_courses 
            ON all_courses.course_code = active_courses.course_code 
            AND all_courses.uid = active_courses.uid 
            AND all_courses.class_id = active_courses.class_id
            JOIN t_users t ON all_courses.uid = t.uid 
            JOIN t_course_details cd ON all_courses.course_code = cd.course_code;
        """)
        r = conn.execute(q).fetchall()
        course_data_current = []
        for i in r:
            temp={'department_id':department_id,'completed_hours':i[0],'total_hours':i[1],'bar_color':progress_color(i[0],i[1])}
            course_data_current.append(temp)
        q = sqlalchemy.text(f"""
            SELECT 
            SUM(total_topics_assigned)::bigint AS total_topics_assigned, 
            SUM(topics_completed)::bigint AS topics_completed
            FROM (
            SELECT 
                COUNT(*) AS total_topics_assigned, 
                SUM(CASE WHEN f.status_code = 5 THEN 1 ELSE 0 END) AS topics_completed
            FROM faculty_table_handling f
            JOIN t_users t ON t.uid = f.uid
            JOIN t_course_details cd ON f.course_code = cd.course_code
            WHERE f.class_id::TEXT SIMILAR TO '{department_id}%'
            GROUP BY f.uid, f.course_code, t.name, cd.course_name, f.class_id
            ) AS aggregated_data;
        """)
        r = conn.execute(q).fetchall()
        course_data_overall = []
        for i in r:
            temp={'department_id':department_id,'count':i[1],'total_count':i[0]}
            course_data_overall.append(temp)
        q = sqlalchemy.text(f"""
            SELECT 
                COALESCE(SUM(c.progress), 0) / NULLIF(COUNT(c.assignment_id), 0) AS avg_progress
            FROM 
                l_class_course a
            JOIN 
                t_course_assignments c ON a.class_id = c.class_id 
            JOIN 
                t_course_details d ON c.course_code = d.course_code
            JOIN 
                l_course_departments l ON a.course_code=l.course_code
            WHERE 
                l.department_id={department_id}""")
        assignment_data = []
        r = conn.execute(q).fetchall()
        for i in r:
            temp={'department_id':department_id,'avg_progress':i[0]}
            assignment_data.append(temp)
        overall_progress.append({'department_id':department_id,'department_overall':course_data_overall,'assignment_data':assignment_data,'department_current':course_data_current,'creation':{'status_code':codes,'count': mdata,'color': mcolor}})
    print({'overall_progress':overall_progress})
    return json.dumps({'overall_progress':overall_progress})

# used to generate data for progress of a year for a department (not added yet)
@app.route('/api/department_year_progress', methods=['POST', 'GET'])
def department_year_progress():
    department_id = request.json['department_id']
    q = sqlalchemy.text(f"""
        SELECT 
        SUBSTRING(all_courses.class_id::TEXT FROM 1 FOR 2) AS department_year, -- Extract first two digits
        SUM(COALESCE(active_courses.hours_completed, 0)) AS total_hours_completed,
        SUM(COALESCE(active_courses.total_hours, 0)) AS total_hours
        FROM (
        SELECT DISTINCT course_code, uid, class_id 
        FROM faculty_table_handling 
        WHERE class_id::TEXT SIMILAR TO '{department_id}1%' OR class_id::TEXT SIMILAR TO '{department_id}2%' OR class_id::TEXT SIMILAR TO '{department_id}3%' OR class_id::TEXT SIMILAR TO '{department_id}4%'
        ) AS all_courses
        LEFT JOIN (
        SELECT 
            course_code, 
            uid, 
            SUM(hours_completed) AS hours_completed, 
            SUM(total_hours) AS total_hours, 
            class_id 
        FROM faculty_table_handling 
        WHERE status_code = 5 AND (class_id::TEXT SIMILAR TO '{department_id}1%' OR class_id::TEXT SIMILAR TO '{department_id}2%' OR class_id::TEXT SIMILAR TO '{department_id}3%' OR class_id::TEXT SIMILAR TO '{department_id}4%')
        GROUP BY course_code, uid, class_id
        ) AS active_courses 
        ON all_courses.course_code = active_courses.course_code 
        AND all_courses.uid = active_courses.uid 
        AND all_courses.class_id = active_courses.class_id
        JOIN t_users t ON all_courses.uid = t.uid
        JOIN t_course_details cd ON all_courses.course_code = cd.course_code
        GROUP BY SUBSTRING(all_courses.class_id::TEXT FROM 1 FOR 2)
        order by department_year;
    """)
    r = conn.execute(q).fetchall()
    course_data_current = []
    for i in r:
        temp={'year':str(i[0])[1],'completed_hours':i[1],'total_hours':i[2],'bar_color':progress_color(i[1],i[2])}
        course_data_current.append(temp)
    q = sqlalchemy.text(f"""
        SELECT  
        SUBSTRING(f.class_id::TEXT FROM 1 FOR 2) AS department_year,
        COUNT(*) AS total_topics_assigned, 
        SUM(CASE WHEN f.status_code = 5 THEN 1 ELSE 0 END) AS topics_completed
        FROM 
        faculty_table_handling f 
        JOIN 
        t_users t ON t.uid = f.uid 
        JOIN 
        t_course_details cd ON f.course_code = cd.course_code 
        WHERE 
        f.class_id::TEXT SIMILAR TO '{department_id}%'
        GROUP BY 
        SUBSTRING(f.class_id::TEXT FROM 1 FOR 2) order by department_year; 

    """)
    r = conn.execute(q).fetchall()
    course_data_overall = []
    for i in r:
        temp={'year':str(i[0])[1],'count':i[2],'total_count':i[1]}
        course_data_overall.append(temp)
    print({'course_data_overall':course_data_overall,'course_data_current':course_data_current})
    return json.dumps({'course_data_overall':course_data_overall,'course_data_current':course_data_current}) 

if __name__ == '__main__':
    try:
        app.run(debug=True, port=8000, host="0.0.0.0")
        #app.run(debug=True, use_reloader=False)  # use_reloader=False to avoid duplicate scheduler threads
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()  # Graceful shutdown of the scheduler
        print("Scheduler stopped.")
    
