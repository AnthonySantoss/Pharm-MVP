"""Tradução de descrições de interações medicamentosas EN→PT-BR.

Dicionário curado das interações mais comuns + padrões de tradução.
Associa padrões de texto em inglês às suas traduções em português brasileiro.
"""
import re
from pathlib import Path
from typing import Optional
import json


def _load_drug_dictionary() -> dict:
    path = next((p for p in [
        Path(__file__).parent / "drug_dictionary.json",
        Path(__file__).parent.parent / "data" / "drug_dictionary.json",
        Path("/app/data/drug_dictionary.json"),
    ] if p.exists()), None)
    if path:
        with open(path) as f:
            return json.load(f)
    return {}


class PTBRTranslator:
    _instance: Optional["PTBRTranslator"] = None
    _drug_dict: dict = {}
    _description_patterns: dict = {}

    def __new__(cls) -> "PTBRTranslator":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init()
        return cls._instance

    def _init(self):
        self._drug_dict = _load_drug_dictionary()
        self._description_patterns = self._build_patterns()

    def _build_patterns(self) -> dict:
        return {
            # anticoagulantes / antiplatelet
            re.compile(r"may increase the anticoagulant activities?", re.I):
                "pode aumentar a atividade anticoagulante",
            re.compile(r"may increase the risk of bleeding", re.I):
                "pode aumentar o risco de sangramento",
            re.compile(r"may enhance the anticoagulant effect", re.I):
                "pode potencializar o efeito anticoagulante",
            re.compile(r"may increase the hypoprothrombinemic effect", re.I):
                "pode aumentar o efeito hipoprotrombina",

            # hipotensão / cardiovascular
            re.compile(r"may increase the hypotensive effect", re.I):
                "pode aumentar o efeito hipotensivo",
            re.compile(r"may enhance the hypotensive effect", re.I):
                "pode potencializar o efeito hipotensivo",
            re.compile(r"may cause additive hypotensive effects?", re.I):
                "pode causar efeitos hipotensivos aditivos",
            re.compile(r"may increase the vasodilatory effect", re.I):
                "pode aumentar o efeito vasodilatador",
            re.compile(r"may potentiate the vasodilatory effect", re.I):
                "pode potencializar o efeito vasodilatador",
            re.compile(r"may cause bradycardia", re.I):
                "pode causar bradicardia",
            re.compile(r"may cause QT prolongation", re.I):
                "pode causar prolongamento do intervalo QT",
            re.compile(r"may increase the risk of arrhythmia", re.I):
                "pode aumentar o risco de arritmia",
            re.compile(r"may increase the cardiotoxic effect", re.I):
                "pode aumentar o efeito cardiotóxico",

            # SNC / sedação
            re.compile(r"may increase CNS depression", re.I):
                "pode aumentar a depressão do sistema nervoso central",
            re.compile(r"may enhance CNS depression", re.I):
                "pode potencializar a depressão do sistema nervoso central",
            re.compile(r"may cause additive CNS depression", re.I):
                "pode causar depressão aditiva do sistema nervoso central",
            re.compile(r"may increase sedation", re.I):
                "pode aumentar a sedação",
            re.compile(r"may enhance the sedative effect", re.I):
                "pode potencializar o efeito sedativo",
            re.compile(r"may cause excessive sedation", re.I):
                "pode causar sedação excessiva",
            re.compile(r"may increase the risk of respiratory depression", re.I):
                "pode aumentar o risco de depressão respiratória",

            # concentração sérica / metabolização
            re.compile(r"may increase the serum concentration", re.I):
                "pode aumentar a concentração sérica",
            re.compile(r"may increase the plasma concentration", re.I):
                "pode aumentar a concentração plasmática",
            re.compile(r"may increase the blood concentration", re.I):
                "pode aumentar a concentração sanguínea",
            re.compile(r"may increase the bioavailability", re.I):
                "pode aumentar a biodisponibilidade",
            re.compile(r"may decrease the serum concentration", re.I):
                "pode diminuir a concentração sérica",
            re.compile(r"may decrease the plasma concentration", re.I):
                "pode diminuir a concentração plasmática",
            re.compile(r"may increase the half-life", re.I):
                "pode aumentar a meia-vida",
            re.compile(r"may inhibit the metabolism", re.I):
                "pode inibir o metabolismo",
            re.compile(r"may induce the metabolism", re.I):
                "pode induzir o metabolismo",
            re.compile(r"may interfere with the hepatic metabolism", re.I):
                "pode interferir no metabolismo hepático",
            re.compile(r"The metabolism of .+ may be decreased", re.I):
                "O metabolismo pode ser diminuído",
            re.compile(r"The metabolism of .+ may be increased", re.I):
                "O metabolismo pode ser aumentado",

            # efeito / eficácia
            re.compile(r"may decrease the effect of", re.I):
                "pode diminuir o efeito de",
            re.compile(r"may reduce the effect of", re.I):
                "pode reduzir o efeito de",
            re.compile(r"may diminish the effect of", re.I):
                "pode diminuir o efeito de",
            re.compile(r"may increase the effect of", re.I):
                "pode aumentar o efeito de",
            re.compile(r"may enhance the effect of", re.I):
                "pode potencializar o efeito de",
            re.compile(r"may potentiate the effect of", re.I):
                "pode potencializar o efeito de",
            re.compile(r"may antagonize the effect of", re.I):
                "pode antagonizar o efeito de",
            re.compile(r"may impair the efficacy", re.I):
                "pode prejudicar a eficácia",
            re.compile(r"may reduce the efficacy", re.I):
                "pode reduzir a eficácia",

            # risco / severidade
            re.compile(r"may increase the risk of", re.I):
                "pode aumentar o risco de",
            re.compile(r"may increase the severity of", re.I):
                "pode aumentar a gravidade de",
            re.compile(r"may cause additive (\\w+ )?effects?", re.I):
                "pode causar efeitos aditivos",
            re.compile(r"may result in additive (\\w+ )?effects?", re.I):
                "pode resultar em efeitos aditivos",

            #反面 / alertas
            re.compile(r"contraindicat", re.I):
                "contraindicado",
            re.compile(r"avoid use", re.I):
                "evitar uso",
            re.compile(r"do not use", re.I):
                "não utilizar",
            re.compile(r"discontinue", re.I):
                "interromper o uso",
            re.compile(r"boxed warning", re.I):
                "AVISO IMPORTANTE DE SEGURANÇA",
            re.compile(r"black box warning", re.I):
                "AVISO IMPORTANTE DE SEGURANÇA",
            re.compile(r"life.threat", re.I):
                "risco à vida",
            re.compile(r"fatal", re.I):
                "fatal",
            re.compile(r"death", re.I):
                "óbito",
            re.compile(r"hospitaliz", re.I):
                "pode requerer hospitalização",
            re.compile(r"severe", re.I):
                "grave",
            re.compile(r"anaphyl", re.I):
                "reação anafilática",
            re.compile(r"hepatotoxic", re.I):
                "hepatotóxico",
            re.compile(r"nephrotoxic", re.I):
                "nefrotoóxico",
            re.compile(r"ototoxic", re.I):
                "ototóxico",
            re.compile(r"bone marrow suppression", re.I):
                "supressão da medula óssea",
            re.compile(r"pancreatitis", re.I):
                "pancreatite",
            re.compile(r"seizure", re.I):
                "convulsão",
            re.compile(r"coma", re.I):
                "coma",

            # monitoramento
            re.compile(r"monitor closely", re.I):
                "monitorarclosamente",
            re.compile(r"monitor for", re.I):
                "monitorar",
            re.compile(r"monitor serum", re.I):
                "monitorar níveis séricos",
            re.compile(r"clinical monitoring", re.I):
                "monitoramento clínico",
            re.compile(r"caution is advised", re.I):
                "usar com cautela",
            re.compile(r"use with caution", re.I):
                "usar com cautela",
            re.compile(r"dose adjustment", re.I):
                "ajuste de dose",
            re.compile(r"may require dose adjustment", re.I):
                "pode requerer ajuste de dose",

            # Farmacodinâmica geral
            re.compile(r" may increase", re.I):
                " pode aumentar",
            re.compile(r" may decrease", re.I):
                " pode diminuir",
            re.compile(r" may potentiate", re.I):
                " pode potencializar",
            re.compile(r" may attenuate", re.I):
                " pode atenuar",
            re.compile(r" may antagonize", re.I):
                " pode antagonizar",
            re.compile(r" may synergize", re.I):
                " pode causar efeito sinérgico",
            re.compile(r"pharmacodynamic interaction", re.I):
                "interação farmacodinâmica",
            re.compile(r"pharmacokinetic interaction", re.I):
                "interação farmacocinética",
            re.compile(r"potential interaction", re.I):
                "interação potencial",
            re.compile(r"significant interaction", re.I):
                "interação significativa",
            re.compile(r"activities", re.I):
                "atividades",
            re.compile(r"activity", re.I):
                "atividade",

            # efeitos específicos
            re.compile(r"photosensitiz", re.I):
                "pode causar fotossensibilidade",
            re.compile(r"hyperkalemia", re.I):
                "pode causar hipercalemia",
            re.compile(r"hypokalemia", re.I):
                "pode causar hipocalemia",
            re.compile(r"hyponatremia", re.I):
                "pode causar hiponatremia",
            re.compile(r"hypoglycemia", re.I):
                "pode causar hipoglicemia",
            re.compile(r"hyperglycemia", re.I):
                "pode causar hiperglicemia",
            re.compile(r"QTc prolongation", re.I):
                "pode causar prolongamento do QTc",
            re.compile(r"bleeding", re.I):
                "pode causar sangramento",
            re.compile(r"thrombocytopenia", re.I):
                "pode causar trombocitopenia",
            re.compile(r"leukopenia", re.I):
                "pode causar leucopenia",
            re.compile(r"agranulocytosis", re.I):
                "pode causar agranulocitose",
            re.compile(r"neurotoxicity", re.I):
                "pode causar neurotoxicidade",
            re.compile(r"ototoxicity", re.I):
                "pode causar ototoxicidade",
            re.compile(r"nephrotoxicity", re.I):
                "pode causar nefrotoxicidade",
            re.compile(r"hepatotoxicity", re.I):
                "pode causar hepatotoxicidade",
            re.compile(r"cardiotoxicity", re.I):
                "pode causar cardiotoxicidade",
            re.compile(r"myotoxicity", re.I):
                "pode causar miotoxicidade",
            re.compile(r"rhabdomyolysis", re.I):
                "pode causar rabdomiólise",

            # Antibióticos / antifúngicos
            re.compile(r"may increase the nephrotoxic effect", re.I):
                "pode aumentar o efeito nefrotóxico",
            re.compile(r"may increase the ototoxic effect", re.I):
                "pode aumentar o efeito ototóxico",

            # Gastrointestinal
            re.compile(r"may increase the risk of GI bleeding", re.I):
                "pode aumentar o risco de sangramento gastrointestinal",
            re.compile(r"may increase the risk of peptic ulcer", re.I):
                "pode aumentar o risco de úlcera péptica",
            re.compile(r"may increase the risk of gastrointestinal ulceration", re.I):
                "pode aumentar o risco de ulceração gastrointestinal",

            # Renal
            re.compile(r"may impair renal function", re.I):
                "pode comprometer a função renal",
            re.compile(r"may increase serum creatinine", re.I):
                "pode aumentar a creatinina sérica",
            re.compile(r"may cause acute kidney injury", re.I):
                "pode causar lesão renal aguda",
            re.compile(r"renal failure", re.I):
                "pode causar insuficiência renal",
        }

    def translate_drug_name(self, inn_name: str) -> str:
        drug = inn_name.strip().lower()
        entry = self._drug_dict.get(drug)
        if entry:
            return entry.get("dcb", inn_name)
        return inn_name

    def get_drug_class(self, inn_name: str) -> Optional[str]:
        drug = inn_name.strip().lower()
        entry = self._drug_dict.get(drug)
        if entry:
            return entry.get("class")
        return None

    def inn_to_dcb(self, inn_name: str) -> str:
        return self.translate_drug_name(inn_name)

    def dcb_to_inn(self, dcb_name: str) -> Optional[str]:
        dcb_lower = dcb_name.strip().lower()
        for inn, entry in self._drug_dict.items():
            if entry.get("dcb", "").lower() == dcb_lower:
                return inn
            for alias in entry.get("aliases", []):
                if alias.lower() == dcb_lower:
                    return inn
        return None

    def translate_description(self, description_en: str, drug1: Optional[str] = None, drug2: Optional[str] = None) -> str:
        if not description_en:
            return "Descrição da interação não disponível."

        desc_clean = description_en.strip().rstrip(".").strip()
        desc_lower = desc_clean.lower()

        if desc_lower in [
            "interaction description not available",
            "interaction description not available.",
            "no description",
            "not available",
            "not available."
        ]:
            return "Descrição da interação não disponível."

        # Template 1: The risk or severity of adverse effects can be increased when [Drug 1] is combined with [Drug 2].
        match = re.search(r"The risk or severity of adverse effects can be increased when (.*?) is combined with (.*)", desc_clean, re.I)
        if match:
            d1_pt = self.translate_drug_name(match.group(1))
            d2_pt = self.translate_drug_name(match.group(2))
            return f"O risco ou a gravidade dos efeitos adversos pode ser aumentado quando {d1_pt} é combinado com {d2_pt}."

        # Template 2: The risk or severity of QTc prolongation can be increased when [Drug 1] is combined with [Drug 2].
        match = re.search(r"The risk or severity of QTc prolongation can be increased when (.*?) is combined with (.*)", desc_clean, re.I)
        if match:
            d1_pt = self.translate_drug_name(match.group(1))
            d2_pt = self.translate_drug_name(match.group(2))
            return f"O risco ou a gravidade do prolongamento do intervalo QTc pode ser aumentado quando {d1_pt} é combinado com {d2_pt}."

        # Template 3: The metabolism of [Drug 2] can be decreased/increased when combined with [Drug 1].
        match = re.search(r"The metabolism of (.*?) can be (decreased|increased) when combined with (.*)", desc_clean, re.I)
        if match:
            d1_pt = self.translate_drug_name(match.group(1))
            action = "diminuído" if match.group(2).lower() == "decreased" else "aumentado"
            d2_pt = self.translate_drug_name(match.group(3))
            return f"O metabolismo de {d1_pt} pode ser {action} quando combinado com {d2_pt}."

        # Template 4: The serum concentration of [Drug 2] can be increased/decreased when it is combined with [Drug 1].
        match = re.search(r"The serum concentration of (.*?) can be (increased|decreased) when it is combined with (.*)", desc_clean, re.I)
        if match:
            d1_pt = self.translate_drug_name(match.group(1))
            action = "aumentada" if match.group(2).lower() == "increased" else "diminuída"
            d2_pt = self.translate_drug_name(match.group(3))
            return f"A concentração sérica de {d1_pt} pode ser {action} quando combinada com {d2_pt}."

        # Template 5: The therapeutic efficacy of [Drug 2] can be decreased/increased when used in combination with [Drug 1].
        match = re.search(r"The therapeutic efficacy of (.*?) can be (decreased|increased) when used in combination with (.*)", desc_clean, re.I)
        if match:
            d1_pt = self.translate_drug_name(match.group(1))
            action = "diminuída" if match.group(2).lower() == "decreased" else "aumentada"
            d2_pt = self.translate_drug_name(match.group(3))
            return f"A eficácia terapêutica de {d1_pt} pode ser {action} quando usada em combinação com {d2_pt}."

        # Template 6: [Drug 1] may increase/decrease the [Activity] activities of [Drug 2].
        match = re.search(r"(.*?) may (increase|decrease) the (.*?) activities of (.*)", desc_clean, re.I)
        if match:
            d1_pt = self.translate_drug_name(match.group(1))
            action = "aumentar" if match.group(2).lower() == "increase" else "diminuir"
            activity_en = match.group(3).strip().lower()
            d2_pt = self.translate_drug_name(match.group(4))

            activities_map = {
                "photosensitizing": "os efeitos fotossensibilizantes",
                "cardiotoxic": "os efeitos cardiotóxicos",
                "hypotensive": "os efeitos hipotensores",
                "qtc-prolonging": "a capacidade de prolongamento do intervalo QTc",
                "anticoagulant": "os efeitos anticoagulantes",
                "antihypertensive": "os efeitos anti-hipertensivos",
                "hypoglycemic": "os efeitos hipoglicemiantes",
                "bradycardic": "os efeitos bradicárdicos",
                "hypokalemic": "os efeitos hipocalêmicos",
                "sedative": "os efeitos sedativos",
                "neuroexcitatory": "os efeitos neuroexcitadores",
                "serotonergic": "os efeitos serotoninérgicos",
                "atrioventricular blocking (av block)": "os efeitos de bloqueio atrioventricular (bloqueio AV)",
                "hypertensive": "os efeitos hipertensores",
                "nephrotoxic": "os efeitos nefrotóxicos (toxicidade renal)",
                "orthostatic hypotensive": "os efeitos hipotensores ortostáticos",
                "stimulatory": "os efeitos estimulantes",
                "myelosuppressive": "os efeitos mielossupressores",
                "neurotoxic": "os efeitos neurotóxicos",
                "ototoxic": "os efeitos ototóxicos",
                "hepatotoxic": "os efeitos hepatotóxicos",
                "anticholinergic": "os efeitos anticolinérgicos",
                "ulcerogenic": "os efeitos ulcerogênicos",
                "vasodilatory": "os efeitos vasodilatadores",
                "central nervous system depressant (cns depressant)": "os efeitos depressores do sistema nervoso central (SNC)",
                "cns depressant": "os efeitos depressores do sistema nervoso central (SNC)",
                "adverse neuromuscular": "os efeitos neuromusculares adversos",
                "hyperkalemic": "os efeitos hipercalêmicos",
                "anesthetic": "os efeitos anestésicos",
            }
            activity_pt = activities_map.get(activity_en)
            if not activity_pt:
                act_pt = activity_en.replace("ing", "").replace("toxic", "tóxicos").replace("ic", "icos").replace("ive", "ivos")
                activity_pt = f"as atividades {act_pt}"
            return f"{d1_pt} pode {action} {activity_pt} de {d2_pt}."

        # Template 7: [Drug 1] may decrease/increase the excretion rate of [Drug 2] which could result in a higher/lower serum level.
        match = re.search(r"(.*?) may (decrease|increase) the excretion rate of (.*?) which could result in a (higher|lower) serum level", desc_clean, re.I)
        if match:
            d1_pt = self.translate_drug_name(match.group(1))
            action = "diminuir" if match.group(2).lower() == "decrease" else "aumentar"
            d2_pt = self.translate_drug_name(match.group(3))
            level = "mais elevados" if match.group(4).lower() == "higher" else "mais baixos"
            return f"{d1_pt} pode {action} a taxa de excreção de {d2_pt}, o que pode resultar em níveis séricos {level}."

        # Template 8: [Drug 1] can cause a decrease/increase in the absorption of [Drug 2] resulting in a reduced/increased serum concentration and potentially a decrease/increase in efficacy.
        match = re.search(r"(.*?) can cause a (decrease|increase) in the absorption of (.*?) resulting in a (reduced|increased) serum concentration and potentially a (decrease|increase) in efficacy", desc_clean, re.I)
        if match:
            d1_pt = self.translate_drug_name(match.group(1))
            abs_action = "diminuição" if match.group(2).lower() == "decrease" else "aumento"
            d2_pt = self.translate_drug_name(match.group(3))
            conc_action = "reduzida" if match.group(4).lower() == "reduced" else "aumentada"
            eff_action = "diminuição" if match.group(5).lower() == "decrease" else "aumento"
            return f"{d1_pt} pode causar uma {abs_action} na absorção de {d2_pt}, resultando em uma concentração sérica {conc_action} e potencialmente em uma {eff_action} da eficácia."

        # Template 9: The serum concentration of the active metabolites of [Drug 2] can be increased when [Drug 2] is used in combination with [Drug 1].
        match = re.search(r"The serum concentration of the active metabolites of (.*?) can be increased when (.*?) is used in combination with (.*)", desc_clean, re.I)
        if match:
            d1_pt = self.translate_drug_name(match.group(1))
            d3_pt = self.translate_drug_name(match.group(3))
            return f"A concentração sérica dos metabólitos ativos de {d1_pt} pode ser aumentada quando usada em combinação com {d3_pt}."

        # Template 10: The bioavailability of [Drug 2] can be decreased/increased when combined with [Drug 1].
        match = re.search(r"The bioavailability of (.*?) can be (decreased|increased) when combined with (.*)", desc_clean, re.I)
        if match:
            d1_pt = self.translate_drug_name(match.group(1))
            action = "diminuída" if match.group(2).lower() == "decreased" else "aumentada"
            d2_pt = self.translate_drug_name(match.group(3))
            return f"A biodisponibilidade de {d1_pt} pode ser {action} quando combinada com {d2_pt}."

        # Existing dictionary / regex-based replacements fallback
        result = description_en
        for pattern, translation in self._description_patterns.items():
            result = pattern.sub(translation, result)

        # Limpeza final
        result = result.strip()
        if result.endswith("."):
            result = result[:-1]

        # Se nada mudou, tentar tradução simples
        if result == description_en:
            result = self._simple_translate(description_en)

        # Add period if missing for fallback result
        if result and not result.endswith("."):
            result += "."

        return result

    def _simple_translate(self, text: str) -> str:
        replacements = [
            ("The ", "O "),
            (" may ", " pode "),
            (" can ", " pode "),
            (" cause ", " causar "),
            (" increase ", " aumentar "),
            (" decrease ", " diminuir "),
            (" reduce ", " reduzir "),
            (" enhance ", " potencializar "),
            (" inhibit ", " inibir "),
            (" induce ", " induzir "),
            (" effect of ", " efeito de "),
            (" activities of ", " atividades de "),
            (" of ", " de "),
            (" risk ", " risco "),
            (" the ", " o "),
            (" and ", " e "),
            (" or ", " ou "),
            (" with ", " com "),
            (" in ", " em "),
            (" by ", " por "),
            (" this ", " esta "),
            (" drug ", " medicamento "),
            (" is ", " é "),
            (" not ", " não "),
            (" be ", " ser "),
        ]
        result = text
        for en, pt in replacements:
            result = result.replace(en, pt)
        return result.strip()

    def generate_fallback_description(self, drug1: str, drug2: str, severity: str) -> str:
        d1_pt = self.translate_drug_name(drug1)
        d2_pt = self.translate_drug_name(drug2)
        c1 = self.get_drug_class(drug1)
        c2 = self.get_drug_class(drug2)
        
        # Robust class normalization
        def categorize_class(class_name: Optional[str]) -> Optional[str]:
            if not class_name:
                return None
            c = class_name.lower().strip()
            if "anti-inflamatório" in c or "aine" in c:
                return "anti-inflamatório"
            if "ansiolítico" in c or "benzodiazepínico" in c:
                return "ansiolítico"
            if "antidepressivo tricíclico" in c:
                return "antidepressivo tricíclico"
            if "anticoagulante" in c:
                return "anticoagulante"
            if "estatina" in c:
                return "estatina"
            if "macrolídeo" in c or "macrolideo" in c:
                return "antibiótico macrolídeo"
            if "antihipertensivo" in c or "anti-hipertensivo" in c:
                return "antihipertensivo"
            if "diurético" in c or "diuretico" in c:
                return "diurético"
            if "analgésico" in c or "analgesico" in c:
                return "analgésico"
            if "cardiotônico" in c or "cardiotonico" in c:
                return "cardiotônico"
            if "antiarrítmico" in c or "antiarritmico" in c:
                return "antiarrítmico"
            if "antifúngico" in c or "antifungico" in c:
                return "antifúngico"
            return c

        c1_cat = categorize_class(c1)
        c2_cat = categorize_class(c2)
        
        # Human-friendly Portuguese class names
        class_translations = {
            "ansiolítico": "ansiolítico (benzodiazepínico)",
            "antidepressivo tricíclico": "antidepressivo tricíclico",
            "anti-inflamatório": "anti-inflamatório não esteroide (AINE)",
            "anticoagulante": "anticoagulante",
            "estatina": "estatina (redutor de colesterol)",
            "antibiótico macrolídeo": "antibiótico macrolídeo",
            "antihipertensivo": "anti-hipertensivo",
            "diurético": "diurético",
            "analgésico": "analgésico",
            "cardiotônico": "cardiotônico",
            "antiarrítmico": "antiarrítmico",
            "antifúngico": "antifúngico",
        }
        
        c1_pt = class_translations.get(c1_cat) if c1_cat else None
        c2_pt = class_translations.get(c2_cat) if c2_cat else None
        
        disclaimer = " [Nota: Esta orientação é baseada no perfil geral das classes farmacológicas. Sempre consulte um profissional de saúde.]"

        # Specific class combinations
        if c1_cat and c2_cat:
            pair_key = tuple(sorted([c1_cat, c2_cat]))
            
            # Ansiolítico + Antidepressivo tricíclico
            if "ansiolítico" in pair_key and "antidepressivo tricíclico" in pair_key:
                return f"O uso concomitante de {d1_pt} ({c1_pt}) e {d2_pt} ({c2_pt}) pode potencializar mutuamente a depressão do Sistema Nervoso Central (SNC). Isso pode resultar em aumento acentuado da sonolência, sedação, fadiga e risco de depressão respiratória. Recomenda-se monitoramento clínico rigoroso.{disclaimer}"
            
            # Anticoagulante + Anti-inflamatório (AINE)
            if "anticoagulante" in pair_key and "anti-inflamatório" in pair_key:
                return f"A administração conjunta de {d1_pt} ({c1_pt}) e {d2_pt} ({c2_pt}) aumenta significativamente o risco de sangramentos graves, especialmente hemorragias gastrointestinais, devido ao efeito antiplaquetário e à irritação da mucosa gástrica pelo AINE.{disclaimer}"
            
            # Anti-hipertensivo + Anti-inflamatório (AINE)
            if "anti-inflamatório" in pair_key and any(x in ["diurético", "antihipertensivo"] for x in pair_key):
                anti_hyp = d1_pt if "anti-inflamatório" != c1_cat else d2_pt
                class_anti_hyp = c1_pt if "anti-inflamatório" != c1_cat else c2_pt
                nsaid_name = d2_pt if "anti-inflamatório" != c1_cat else d1_pt
                return f"Anti-inflamatórios como o {nsaid_name} podem diminuir a eficácia terapêutica de agentes cardiovasculares como o {anti_hyp} ({class_anti_hyp}) ao promoverem a retenção de sódio e água, além de aumentar o risco de lesão renal aguda.{disclaimer}"
            
            # Estatina + Macrolídeo
            if "estatina" in pair_key and "antibiótico macrolídeo" in pair_key:
                statin_name = d1_pt if "estatina" == c1_cat else d2_pt
                macrolide_name = d2_pt if "estatina" == c1_cat else d1_pt
                return f"Antibióticos macrolídeos ({macrolide_name}) podem inibir o metabolismo hepático de estatinas ({statin_name}), aumentando consideravelmente seus níveis séricos e elevando o risco de toxicidade muscular (miopatia ou rabdomiólise).{disclaimer}"

        # Class level descriptions
        if c1_pt and c2_pt:
            return f"A combinação entre medicamentos da classe dos {c1_pt}s (como {d1_pt}) e da classe dos {c2_pt}s (como {d2_pt}) é clinicamente avaliada como de severidade {severity}. Recomenda-se atenção profissional e monitoramento dos sintomas do paciente.{disclaimer}"
        elif c1_pt or c2_pt:
            known_drug = d1_pt if c1_pt else d2_pt
            known_class = c1_pt if c1_pt else c2_pt
            other_drug = d2_pt if c1_pt else d1_pt
            return f"Interação de severidade {severity} entre {known_drug} (classe: {known_class}) e {other_drug}. Recomenda-se cautela no uso simultâneo, observando possíveis reações adversas.{disclaimer}"
            
        # Default fallback
        return f"Interação medicamentosa de severidade {severity} identificada entre os fármacos {d1_pt} e {d2_pt}. Recomenda-se que o uso concomitante seja supervisionado por um profissional de saúde (médico ou farmacêutico) para garantir a segurança da terapia."

    def get_all_dcb_names(self) -> list[str]:
        names = []
        for entry in self._drug_dict.values():
            if entry.get("dcb"):
                names.append(entry["dcb"])
            for alias in entry.get("aliases", []):
                if alias:
                    names.append(alias)
        return sorted(set(names))

    def get_all_inn_names(self) -> list[str]:
        return list(self._drug_dict.keys())

    def search_drugs(self, query: str, limit: int = 50) -> list[dict]:
        query_lower = query.lower()
        results = []
        for inn, entry in self._drug_dict.items():
            dcb = entry.get("dcb", "")
            aliases = entry.get("aliases", [])
            searchable = [inn, dcb] + aliases
            for name in searchable:
                if name and query_lower in name.lower():
                    results.append({
                        "dcb": dcb or inn,
                        "inn": inn,
                        "class": entry.get("class", ""),
                        "aliases": aliases,
                    })
                    break
        return results[:limit]


_translator: Optional[PTBRTranslator] = None


def get_translator() -> PTBRTranslator:
    global _translator
    if _translator is None:
        _translator = PTBRTranslator()
    return _translator