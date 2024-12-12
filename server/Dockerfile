FROM python:3.9-bullseye

RUN python3 -m pip install --upgrade pip

RUN python3 -m pip install --upgrade pillow

WORKDIR /server

COPY . /server

RUN python3 -m pip install -r requirements.txt

CMD [ "python", "app.py"]