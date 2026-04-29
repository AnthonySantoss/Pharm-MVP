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
            re.compile(r" of ", re.I):
                " de ",
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

    def translate_description(self, description_en: str) -> str:
        if not description_en:
            return "Interação não especificada."

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