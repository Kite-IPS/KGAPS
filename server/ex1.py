import pandas as pd
import re
from sqlalchemy import create_engine, Column, Float, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Google Sheets URL
sheet_url = "https://docs.google.com/spreadsheets/d/1M4P0_yfXYOCRLqpYN4sBmaN2-9YehBBvfk37VQqae3A/edit?gid=0#gid=0"

# Extract Google Sheet ID
def get_google_sheet_id(url):
    pattern = r"https://docs\.google\.com/spreadsheets/d/([a-zA-Z0-9-_]+)"
    match = re.search(pattern, url)
    return match.group(1) if match else None

sheet_id = get_google_sheet_id(sheet_url)
csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"

# Read Google Sheets as CSV
df = pd.read_csv(csv_url, header=None, dtype=str)  # Read as string to avoid NaN issues
print(df.to_string())  # Print full CSV structure for debugging

# Search for "PASS PERCENTAGE" in the whole DataFrame
pass_percentage = None
for i in range(len(df)):
    row_str = " ".join(str(val).strip() for val in df.iloc[i] if pd.notna(val))  # Join non-empty values
    match = re.search(r"PASS PERCENTAGE\s*,*\s*(\d+(\.\d+)?)", row_str, re.IGNORECASE)  # Find numeric value
    if match:
        pass_percentage = float(match.group(1))
        break

if pass_percentage is None:
    raise ValueError("Pass Percentage not found or invalid!")

# Set up SQLite Database
DATABASE_URL = "sqlite:///pass_data.db"
engine = create_engine(DATABASE_URL, echo=True)
Base = declarative_base()

# Define Table Model
class PassData(Base):
    __tablename__ = "pass_percentage"
    id = Column(Integer, primary_key=True, autoincrement=True)
    percentage = Column(Float)

# Create Table
Base.metadata.create_all(engine)

# Insert Data into Database
Session = sessionmaker(bind=engine)
session = Session()

new_entry = PassData(percentage=pass_percentage)
session.add(new_entry)
session.commit()

print(f"Pass Percentage ({pass_percentage}%) stored successfully!")
