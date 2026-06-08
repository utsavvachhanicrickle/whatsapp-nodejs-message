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
    ("Utsav Vachhani", "9512655868"),
    ("Harshil Gajipara", "8320937722"),
    ("Shruti Kakadiya", "8530058300"),
    ("Suhani Padmani", "7802003105"),
    ("Ayush Vanani", "9979925276"),
    ("Krisha Keraliya", "7485989359"),
    ("Shiven Parmar", "9313948911"),
    ("Sanchi Savani", "6358107700"),
    ("Twisha Savani", "9723596171"),
    ("Kavya Bhalala", "7359967609"),
    ("Krushali Gohil", "9825368715"),
    ("Jay Ganjawala", "9016419325"),
    ("Megh Advani", "9825887805"),
    ("Nupur Athaviya", "8849337789"),
    ("Dhyan Chawda", "9727751311"),
    ("Tisha Sutariya", "9510655206"),
    ("Rudra Lakhani", "8780621487"),
    ("Neki Lakhani", "9909137331"),
    ("Sujal Thakkar", "9104262061"),
    ("Daksh Aghera", "8264724080"),
    ("Jil Rupani", "9016013336"),
    ("Sujalkumar Pandav", "8866006166"),
    ("Deep Patel", "8153076229"),
    ("Vishva Gohil", "7265977700"),
    ("Krishna Panchal", "9913590160"),
    ("Manan Chovatiya", "9825611276"),
    ("Rahul Soni", "9016397932"),
    ("Nency Khunt", "8401295762"),
    ("Neel Mandakana", "7016851461"),
    ("Manav Avaiya", "9106070799"),
    ("Rushabh Devani", "8980005030"),
    ("Aryan Pandey", "8780912463"),
    ("Siddharth Ghoghari", "8160392844"),
    ("Manav Tarsariya", "8160844231"),
    ("Pedduri Uday", "7487941346"),
    ("Dasari Tejas", "9023990513"),
    ("Pasikanti Adarsh", "8160796177"),
    ("Digaj Patel", "9898932411"),
    ("Snehal Rapolu", "7989844724"),
    ("Kush Patel", "7984136547"),
    ("Gediya Dwarkesh", "7779013444"),
    ("Jal Parekh", "8200860269"),
    ("Roshan Patel", "7096904810"),
    ("Priyanshi Modi", "9773291110"),
    ("Hetavi Ganatra", "9879457592"),
    ("Manal Parekh", "9925033816"),
    ("Dhruv Joraviya", "9377126979"),
    ("Karansinh Admar", "9714116817"),
    ("Darshan Patel", "9904471901"),
    ("Vishwa Jariwala", "9662594998"),
    ("Jemis Kevadiya", "7862936279"),
    ("Soham Patel", "9313342881"),
    ("Tanisha Agarwal", "8780700877"),
    ("Het Salmawala", "7984184329"),
    ("Vyoma Kapadiya", "7041885904"),
    ("Twisha Savani", "9723596171"),
    ("Dhruvit Kevadiya", "7863060529"),
    ("Krishna Shethna", "9662713322"),
    ("Sahil Sidhdhapara", "9727123384"),
    ("Vasu Navadiya", "6351534427"),
    ("Dhruvkumar Italiya", "8200609404"),
    ("Pranjal Hadiya", "8160314093"),
    ("Drishi Morkhia", "8511533762"),
    ("Khushi Gajrawala", "9316729484"),
    ("Manasvi Bhesania", "9925963630"),
    ("Rishika Jain", "8320043912"),
]


# Content
pdf.set_font("Arial", size=12)

for i, (name, number) in enumerate(contacts, start=1):
    pdf.cell(200, 10, f"{i}. {name} - {number}", ln=True)

# Save PDF
pdf.output("contacts.pdf")

print("PDF created successfully!")