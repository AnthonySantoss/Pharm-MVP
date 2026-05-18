"""
Validação das regras vs casos conhecidos da literatura médica
"""
import os
import sys

# Simular a lógica das regras
def check_rules(drug1_norm, drug2_norm):
    combo = f"{drug1_norm} + {drug2_norm}"
    
    severe_interactions = [
        (r"sildenafil.*nitroglycerin|nitroglycerin.*sildenafil", "Grave"),
        (r"sildenafil.*isosorbide|isosorbide.*sildenafil", "Grave"),
        (r"simvastatin.*erythromycin|erythromycin.*simvastatin", "Grave"),
        (r"simvastatin.*clarithromycin|clarithromycin.*simvastatin", "Grave"),
        (r"simvastatin.*ketoconazole|ketoconazole.*simvastatin", "Grave"),
        (r"atorvastatin.*erythromycin|erythromycin.*atorvastatin", "Grave"),
        (r"digoxin.*amiodarone|amiodarone.*digoxin", "Grave"),
        (r"warfarin.*aspirin|aspirin.*warfarin", "Grave"),
        (r"amiodarone.*warfarin|warfarin.*amiodarone", "Grave"),
        (r"fluconazole.*warfarin|warfarin.*fluconazole", "Grave"),
        (r"digoxin.*furosemide|furosemide.*digoxin", "Grave"),
        (r"lithium.*ibuprofen|ibuprofen.*lithium", "Grave"),
        (r"lithium.*naproxen|naproxen.*lithium", "Grave"),
        (r"dipyrone.*warfarin|warfarin.*dipyrone", "Moderada"),
        (r"metformin.*contrast|contrast.*metformin", "Moderada"),
        (r"methotrexate.*nsaid|nsaid.*methotrexate", "Moderada"),
        (r"lisinopril.*ibuprofen|ibuprofen.*lisinopril", "Moderada"),
        (r"losartan.*ibuprofen|ibuprofen.*losartan", "Moderada"),
    ]
    
    import re
    for pattern, severity in severe_interactions:
        if re.search(pattern, combo, re.I):
            return severity
    return None

# Casos de teste da literatura (severidade EXPECTADA baseada em evidências médicas)
casos_teste = {
    # === GRAVE - literatura médica confirma ===
    ("sildenafil", "nitroglycerin"): "Grave",  # CONTRAINDICADO
    ("simvastatin", "erythromycin"): "Grave",   # Rabdomiólise
    ("digoxin", "amiodarone"): "Grave",        # Toxicidade digital
    ("warfarin", "aspirin"): "Grave",         # Sangramento
    ("digoxin", "furosemide"): "Grave",       # Arritmia por hipocalemia
    ("lithium", "ibuprofen"): "Grave",        # Toxicidade lítio
    ("simvastatin", "clarithromycin"): "Grave",  # Rabdomiólise
    ("fluconazole", "warfarin"): "Grave",    # Potencializa varfarina
    ("amiodarone", "warfarin"): "Grave",      # Potencializa varfarina
    
    # === MODERADA - requer monitoramento ===
    ("dipyrone", "warfarin"): "Moderada",    # Potencializa anticoagulação
    ("metformin", "contrast"): "Moderada",   # Acidose láctica
    ("lisinopril", "ibuprofen"): "Moderada", # Função renal
    ("losartan", "ibuprofen"): "Moderada", # Função renal
    ("methotrexate", "nsaid"): "Moderada", # Nefrotoxicidade
    
    # === LEVE - geralmente seguro ===
    ("omeprazole", "acetaminophen"): "Leve",  # Sem interação significativa
    ("atorvastatin", "metformin"): "Leve",  # Sem interação significativa
    ("azithromycin", "amoxicillin"): "Leve", # Mesmo mecanismo
}

print("="*70)
print("VALIDAÇÃO DAS REGRAS - CASOS DA LITERATURA MÉDICA")
print("="*70)
print(f"Total de casos: {len(casos_teste)}")
print()

acertos = 0
erros = 0
sem_regra = 0

for (drug1, drug2), esperado in casos_teste.items():
    resultado = check_rules(drug1, drug2)
    
    dcb_map = {
        "sildenafil": "Sildenafila", "nitroglycerin": "Nitroglicerina",
        "simvastatin": "Sinvastatina", "erythromycin": "Eritromicina",
        "digoxin": "Digoxina", "amiodarone": "Amiodarona",
        "warfarin": "Varfarina", "aspirin": "Aspirina",
        "furosemide": "Furosemida", "lithium": "Lítio",
        "ibuprofen": "Ibuprofeno", "clarithromycin": "Claritromicina",
        "fluconazole": "Fluconazol", "dipyrone": "Dipirona",
        "metformin": "Metformina", "lisinopril": "Lisinopril",
        "losartan": "Losartana", "methotrexate": "Metorexato",
        "omeprazole": "Omeprazol", "acetaminophen": "Paracetamol",
        "atorvastatin": "Atorvastatina", "azithromycin": "Azitromicina",
        "amoxicillin": "Amoxicilina", "nsaid": "AINEs",
    }
    
    dcb1 = dcb_map.get(drug1, drug1)
    dcb2 = dcb_map.get(drug2, drug2)
    
    if resultado is None:
        status = "⚠️ SEM REGRA"
        sem_regra += 1
    elif resultado == esperado:
        status = "✅ OK"
        acertos += 1
    else:
        status = f"❌ ERRO"
        erros += 1
    
    print(f"{status} {dcb1} + {dcb2}")
    print(f"   Esperado: {esperado:10} | Obtido: {resultado or 'ML'}")
    if resultado is None:
        print(f"   ⚠️ ATENÇÃO: Sem regra - ML retornará o que der!")
    print()

total = acertos + erros
print("="*70)
print(f"RESULTADO DA VALIDAÇÃO:")
print(f"  ✅ Acertos: {acertos}/{total} ({100*acertos/total:.1f}%)")
print(f"  ❌ Erros: {erros}")
print(f"  ⚠️ Sem regra (usa ML): {sem_regra}")
print("="*70)