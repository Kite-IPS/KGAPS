import requests

def send_post_requests(base_url, routes, data):
    """
    Sends POST requests to multiple API routes with the provided data.

    :param base_url: The base URL of the server.
    :param routes: List of route paths to send POST requests to.
    :param data: Dictionary of data to include in the POST request.
    """
    for i,route in enumerate(routes):
        url = f"{base_url}/{route}"
        try:
            if i == 0:
                print("register")
                for i in data:
                    response = requests.post(url, json=i)
                    print(f"POST to {url} | Status Code: {response.status_code}")
            if i == 1:
                print("course add")
                data = [
                    {"course_code": "cs1",
                    "course_name": "Python",
                    "department_id": 1,
                    "domain_id": 1,
                    "year":1},
                    {"course_code": "cs2",
                    "course_name": "C prog.",
                    "department_id": 1,
                    "domain_id": 1,
                    "year":1,},
                    {"course_code": "cs3",
                    "course_name": "Java",
                    "department_id": 1,
                    "domain_id": 1,
                    "year":2},
                    {"course_code": "cs4",
                    "course_name": "C++",
                    "department_id": 1,
                    "domain_id": 1,
                    "year":2,}
                ]
                for i in data:
                    response = requests.post(url, json=i)
                    print(f"POST to {url} | Status Code: {response.status_code}")
            if i==2:
                data = [
                    {"course_code": "cs1",
                     "class_id":111,
                    "uid": 101},
                    {"course_code": "cs1",
                     "class_id":112,
                    "uid": 102},
                    {"course_code": "cs2",
                     "class_id":111,
                    "uid": 101},
                    {"course_code": "cs2",
                     "class_id":112,
                    "uid": 102},
                     {"course_code": "cs3",
                     "class_id":121,
                    "uid": 101},
                    {"course_code": "cs3",
                     "class_id":122,
                    "uid": 102},
                    {"course_code": "cs4",
                     "class_id":121,
                    "uid": 101},
                    {"course_code": "cs4",
                     "class_id":122,
                    "uid": 102},
                ]
                for i in data:
                    response = requests.post(url, json=i)
                    print(f"POST to {url} | Status Code: {response.status_code}")
                data = [
                    {"course_code": "cs1",
                    "uid": 103},
                   {"course_code": "cs2",
                    "uid": 107},
                   {"course_code": "cs3",
                    "uid": 108},
                   {"course_code": "cs4",
                    "uid": 109},
                ]  
                for i in data:
                    response = requests.post(f"{base_url}/assign_mentor", json=i)
                    print(f"POST to {url} | Status Code: {response.status_code}")

                data = [{
                    "domain_id":1,
                    "mentor_id": 104}]
                for i in data:
                    response = requests.post(f"{base_url}/assign_domain_mentor", json=i)
                    print(f"POST to {url} | Status Code: {response.status_code}")
            if i==3:
                data = [{
                    "course_code": "cs1",
                    "topic": "python 1",
                    "outcome": "co1",
                    "total_hours": 5,
                    "uid": 101,
                },{"course_code": "cs1",
                    "topic": "python 2",
                    "outcome": "co1",
                    "total_hours": 5,
                    "uid": 101,
                },
                {"course_code": "cs2",
                    "topic": "c 1",
                    "outcome": "co1",
                    "total_hours": 5,
                    "uid": 101,
                },{"course_code": "cs2",
                    "topic": "c 2",
                    "outcome": "co1",
                    "total_hours": 5,
                    "uid": 101,
                },
                {"course_code": "cs3",
                    "topic": "java 1",
                    "outcome": "co1",
                    "total_hours": 5,
                    "uid": 101,
                },{"course_code": "cs3",
                    "topic": "java 2",
                    "outcome": "co1",
                    "total_hours": 5,
                    "uid": 101,
                },
                {"course_code": "cs4",
                    "topic": "c++ 1",
                    "outcome": "co1",
                    "total_hours": 5,
                    "uid": 101,
                },{"course_code": "cs4",
                    "topic": "c++ 2",
                    "outcome": "co1",
                    "total_hours": 5,
                    "uid": 101,
                }
                ]
                for i in data:
                    response = requests.post(url, json=i)
                    print(f"POST to {url} | Status Code: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"Failed to send POST to {url}: {e}\n")

if __name__ == "__main__":
    # Base URL of the API server
    base_url = "http://127.0.0.1:8000/api"

    # List of routes to send POST requests to
    routes = [
        "register",
        "add_course",
        "assign_course",
        "add_topic",
    ]

    # Data to send in the POST request
    userdata = [
        {"role": 1,
        "name": "Adithya",
        "password": "1",
        "department_id": 1,
        "id": 101},
        {"role": 1,
        "name": "Mitun",
        "password": "1",
        "department_id": 1,
        "id": 102},
        {"role": 2,
        "name": "RajaRajan",
        "password": "1",
        "department_id": 1,
        "id": 103},
        {"role": 2,
        "name": "Manoj",
        "password": "1",
        "department_id": 1,
        "id": 107},
        {"role": 2,
        "name": "Subash",
        "password": "1",
        "department_id": 1,
        "id": 108},
        {"role": 2,
        "name": "Monish",
        "password": "1",
        "department_id": 1,
        "id": 109},
        {"role": 3,
        "name": "Kabilan",
        "password": "1",
        "department_id": 1,
        "id": 104},
        {"role": 4,
        "name": "Nishanth",
        "password": "1",
        "department_id": 1,
        "id": 105},
        {"role": 5,
        "name": "Marudhu",
        "password": "1",
        "department_id": 1,
        "id": 106},
        ]

    # Send POST requests
    send_post_requests(base_url, routes, userdata)
