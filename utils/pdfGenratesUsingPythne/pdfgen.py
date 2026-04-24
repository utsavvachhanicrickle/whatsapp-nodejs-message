from fpdf import FPDF

# Create PDF
pdf = FPDF()
pdf.add_page()

# Title
pdf.set_font("Arial", style="B", size=16)
pdf.cell(200, 10, "Contact List", ln=True, align="C")

pdf.ln(10)  # space

# Data
contacts = [
    ("Jay", "9876543210"),
    ("Tushar", "9123456780"),
    ("Amit", "9988776655"),
    ("Neha", "9090909090"),
    ("Ravi", "8888888888"),
    ("Pooja", "7777777777"),
    ("Karan", "6666666666"),
    ("Sneha", "5555555555"),
    ("Rahul", "4444444444"),
    ("Priya", "3333333333"),
]

# Content
pdf.set_font("Arial", size=12)

for i, (name, number) in enumerate(contacts, start=1):
    pdf.cell(200, 10, f"{i}. {name} - {number}", ln=True)

# Save PDF
pdf.output("contacts.pdf")

print("PDF created successfully!")