import fitz
import json
import re

pdf_path = "Ementário Sistemas de Informação IFMG Ouro Branco.pdf"
doc = fitz.open(pdf_path)
full_text = ""
for page in doc:
    full_text += page.get_text("text") + "\n"

lines = full_text.split('\n')
lines = [l.strip() for l in lines] # clean up

disciplines = []
current_period = "Unknown"
is_optativa = False

i = 0
while i < len(lines):
    line = lines[i]
    
    if re.search(r'(\d+)º\s*período', line, re.IGNORECASE):
        current_period = re.search(r'(\d+)º\s*período', line, re.IGNORECASE).group(1)
        
    if re.search(r'Disciplinas Optativas', line, re.IGNORECASE):
        current_period = "Optativa"
        is_optativa = True

    if line.startswith("Código:"):
        code = lines[i+1]
        
        name = ""
        total_hours = 0
        theory_hours = 0
        practice_hours = 0
        nature = "Optativa" if is_optativa else "Obrigatória"
        description = ""
        objectives = ""
        
        # We look forward to find exactly these headers
        j = i + 1
        while j < i + 30 and j < len(lines):
            if lines[j].startswith("Nome da disciplina:"):
                name = lines[j+1]
            if lines[j].startswith("Carga horária total:"):
                hours_str = lines[j+1].split()[0]
                if hours_str.isdigit():
                    total_hours = int(hours_str)
            if lines[j].startswith("Natureza:"):
                nature = lines[j+1]
            if lines[j].startswith("CH teórica:"):
                # Usually: CH teórica: 32 \n CH prática: 32
                t_match = re.search(r'CH teórica:\s*(\d+)', lines[j])
                if t_match: theory_hours = int(t_match.group(1))
            if lines[j].startswith("CH prática:"):
                p_match = re.search(r'CH prática:\s*(\d+)', lines[j])
                if p_match: practice_hours = int(p_match.group(1))
            
            # Alternative format where they are on the same line:
            if "CH teórica:" in lines[j] and "CH prática:" in lines[j]:
                t_match = re.search(r'CH teórica:\s*(\d+)', lines[j])
                p_match = re.search(r'CH prática:\s*(\d+)', lines[j])
                if t_match: theory_hours = int(t_match.group(1))
                if p_match: practice_hours = int(p_match.group(1))
            j += 1
            
        # For Ementa and Objetivo, they are multiline
        ementa_start = -1
        objetivo_start = -1
        biblio_start = -1
        
        j = i
        while j < i + 100 and j < len(lines):
            if lines[j] == "Ementa:":
                ementa_start = j + 1
            elif lines[j] == "Objetivo(s):":
                objetivo_start = j + 1
            elif lines[j] == "Bibliografia básica:":
                biblio_start = j
                break
            j += 1
            
        if ementa_start != -1 and objetivo_start != -1:
            description = " ".join(lines[ementa_start:objetivo_start-1])
            objectives = " ".join(lines[objetivo_start:biblio_start]) if biblio_start != -1 else " ".join(lines[objetivo_start:objetivo_start+5])
        
        # Only add valid disciplines
        if code.startswith("OBBG"):
            disciplines.append({
                "id": code,
                "name": name,
                "semester": int(current_period) if str(current_period).isdigit() else current_period,
                "total_hours": total_hours,
                "theory_hours": theory_hours,
                "practice_hours": practice_hours,
                "nature": nature,
                "description": description,
                "objectives": objectives
            })
        
        i += 10 # skip ahead slightly
    else:
        i += 1

with open("disciplines.json", "w", encoding="utf-8") as f:
    json.dump(disciplines, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(disciplines)} disciplines.")
