#!/usr/bin/env python3
"""Offline adnotacja morfologiczna tekstu lekcji (kurs jezyka polskiego, etap E2).

Czyta tekst ze wszystkich szablonow w backtickach w podanym module .ts,
szuka form w zrzucie slownika SGJP (Morfeusz 2, TSV w gzipie) i zapisuje
tabele analiz jako modul TypeScript.

Uzycie:
    python3 scripts/polski-adnotuj.py <zrodlo.ts> [--out SCIEZKA]
        [--sgjp SCIEZKA] [--merge]

Domyslny zrzut SGJP: $POLSKI_SGJP albo ~/.cache/dociekai/sgjp-20260823.tab.gz
Do pobrania: https://download.sgjp.pl/morfeusz/20260823/sgjp-20260823.tab.gz

Tylko biblioteka standardowa (Python 3.9). Slownik czytany strumieniowo,
w jednym przejsciu; w pamieci trzymane sa tylko wiersze potrzebnych form.
"""

import argparse
import gzip
import os
import re
import sys

SGJP_URL = "https://download.sgjp.pl/morfeusz/20260823/sgjp-20260823.tab.gz"
SGJP_ENV_VAR = "POLSKI_SGJP"
SGJP_DEFAULT_NAME = "sgjp-20260823.tab.gz"
TYPES_FROM_REPO = os.path.join(
    "src", "app", "jezyk-polski", "klasa-4", "lib", "korpus", "types"
)

# Kolejnosc priorytetu klas (pierwszy czlon tagu). Reszta na koncu.
CLASS_ORDER = [
    "fin", "praet", "cond", "impt", "inf", "bedzie", "imps", "winien", "pred",
    "subst", "depr", "ger", "adj", "adja", "adjp", "adjc", "pact", "ppas",
    "adv", "ppron12", "ppron3", "siebie", "num", "numcol", "prep", "part",
    "conj", "comp", "interj",
]
CLASS_RANK = {name: i for i, name in enumerate(CLASS_ORDER)}
REST_RANK = len(CLASS_ORDER)

# Lemmaty, dla ktorych klasy conj/comp ida na sam poczatek.
EXC_LEMMAS = frozenset([
    "bo", "że", "żeby", "ale", "lecz", "oraz", "i", "a", "albo", "lub",
    "ani", "czyli", "więc", "ponieważ",
])

# Formy, dla ktorych wskazana klasa idzie na sam poczatek
# (jeszcze przed regula conj/comp z EXC_LEMMAS).
PREFERRED = {
    "nie": "part",
    "go": "ppron3", "mu": "ppron3", "jej": "ppron3", "ich": "ppron3",
    "im": "ppron3", "je": "ppron3",
    "razem": "adv", "jak": "adv",
    "tak": "part", "już": "part", "też": "part", "tylko": "part",
    "się": "siebie",
}

# Ruchome koncowki osobowe (aglutynant): przyrostek -> (liczba, osoba, z "by").
# Probowane od najdluzszych. Uwaga: przyrostki z ogonkami (ście, śmy, eś...),
# bo formy w tekscie i w SGJP je maja. Same "by" tylko w trybie awaryjnym
# (gdy brak analiz bezposrednich), bo "-by" na koncu to czesto zbieg
# okolicznosci (np. "slaby" to nie "sla"+"by").
PERSON_SUFFIXES = [
    ("byście", "pl", "sec", True),
    ("byśmy", "pl", "pri", True),
    ("ście", "pl", "sec", False),
    ("śmy", "pl", "pri", False),
    ("byś", "sg", "sec", True),
    ("bym", "sg", "pri", True),
    ("eś", "sg", "sec", False),
    ("em", "sg", "pri", False),
    ("ś", "sg", "sec", False),
    ("m", "sg", "pri", False),
]
BARE_BY = ("by", None, None, True)

WORD_RE = re.compile(r"[^\W\d_]+(?:[-'’][^\W\d_]+)*")
BACKTICK_RE = re.compile(r"`(.*?)`", re.DOTALL)
OPEN_RE = re.compile(r"\[\[[a-z0-9-]+ ")
OVERRIDE_RE = re.compile(r"\{[^}]*\}")


def capitalize_first(form):
    if not form:
        return form
    return form[0].upper() + form[1:]


def esc(text):
    return text.replace("\\", "\\\\").replace("'", "\\'")


def unesc(text):
    return text.replace("\\'", "'").replace("\\\\", "\\")


def repo_root():
    here = os.path.dirname(os.path.abspath(__file__))
    parent = os.path.dirname(here)
    if os.path.basename(here) == "scripts" and os.path.isdir(parent):
        return parent
    return os.getcwd()


def default_sgjp_path():
    env = os.environ.get(SGJP_ENV_VAR)
    if env:
        return env
    return os.path.join(
        os.path.expanduser("~"), ".cache", "dociekai", SGJP_DEFAULT_NAME)


def extract_forms(source_text):
    """Wyrazy ze wszystkich literatow w backtickach, po oczyszczeniu znacznikow."""
    chunks = BACKTICK_RE.findall(source_text)
    forms = []
    for chunk in chunks:
        chunk = OVERRIDE_RE.sub("", chunk)
        chunk = OPEN_RE.sub("", chunk)
        chunk = chunk.replace("]]", "")
        for match in WORD_RE.finditer(chunk):
            forms.append(match.group(0))
    return forms


def load_sgjp(path, needed):
    """Jedno przejscie po gzipie; zwraca {forma: [(lemma, tag), ...]}."""
    table = {}
    with gzip.open(path, "rt", encoding="utf-8") as handle:
        for line in handle:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 3:
                continue
            form, lemma_raw, tag = parts[0], parts[1], parts[2]
            if form not in needed:
                continue
            lemma = lemma_raw.split(":", 1)[0]
            table.setdefault(form, []).append((lemma, tag))
    return table


def direct_analyses(form, table):
    """Suma analiz dla formy: dokladnie, malymi, z wielkiej litery (bez duplikatow)."""
    variants = [form, form.lower(), capitalize_first(form)]
    seen = set()
    out = []
    for variant in variants:
        for pair in table.get(variant, []):
            if pair not in seen:
                seen.add(pair)
                out.append(pair)
    return out


def stem_praet_analyses(stem, table):
    """Analizy klasy praet dla rdzenia (warianty wielkosci liter)."""
    variants = [stem, capitalize_first(stem)]
    seen = set()
    out = []
    for variant in variants:
        for lemma, tag in table.get(variant, []):
            if tag.split(":", 1)[0] == "praet" and (lemma, tag) not in seen:
                seen.add((lemma, tag))
                out.append((lemma, tag))
    return out


def try_suffix(form_low, suffix_info, table):
    suffix, number, person, has_by = suffix_info
    if not form_low.endswith(suffix) or len(form_low) <= len(suffix):
        return []
    stem = form_low[: -len(suffix)]
    out = []
    for lemma, tag in stem_praet_analyses(stem, table):
        new_tag = tag + "+by" if has_by else tag
        if number is not None:
            new_tag += "+aglt:{}:{}".format(number, person)
        out.append((lemma, new_tag))
    return out


def sort_analyses(items, form_low, seen_lower):
    """Kolejnosc analiz: PREFEROWANE, wyjatki conj/comp, klasy wg priorytetu.

    Jezeli wyraz wystapil w tekscie choc raz mala litera, analizy z lematem
    od wielkiej litery (nazwy wlasne) ida na sam koniec. Sortowanie stabilne.
    """
    pref_cls = PREFERRED.get(form_low)

    def rank(item):
        lemma, tag = item
        cls = tag.split(":", 1)[0]
        if pref_cls is not None and cls == pref_cls:
            group = 0
        elif lemma in EXC_LEMMAS and cls in ("conj", "comp"):
            group = 1
        else:
            group = 2
        tail = 1 if (seen_lower and any(ch.isupper() for ch in lemma)) else 0
        return (tail, group, CLASS_RANK.get(cls, REST_RANK))

    return sorted(items, key=rank)


def build_analyses(form, table, seen_lower=False):
    """Pelna lista analiz dla formy (klucz: forma malymi literami)."""
    form_low = form.lower()
    direct = direct_analyses(form, table)
    split = []
    # Rozklejanie tylko dla form, których słownik nie zna — SGJP ma większość
    # form z aglutynantem wprost (`praet:pl:m1:pri:perf`, `cond:…`).
    if not direct:
        for suffix_info in PERSON_SUFFIXES:
            split = try_suffix(form_low, suffix_info, table)
            if split:
                break
        if not split:
            split = try_suffix(form_low, BARE_BY, table)
    combined = []
    seen = set()
    for pair in split + direct:
        if pair not in seen:
            seen.add(pair)
            combined.append(pair)
    if not combined and "-" in form:
        # Wyraz z lacznikiem spoza slownika: analizuj OSTATNI czlon po
        # laczniku tak samo jak zwykly wyraz (z wariantami wielkosci liter),
        # a lemat dopisz z przedrostkiem. Czlonek bez lacznika, wiec brak
        # rekurencji. Czlonek tez nieznany -> pusta lista (NIEZNANE).
        prefix, _, segment = form.rpartition("-")
        # Człon pisany małą literą: nazwy własne członu („Czerwony”) na koniec.
        segment_lower = segment[:1].islower()
        seg = build_analyses(segment, table, segment_lower)
        if seg:
            remapped = [(prefix.lower() + "-" + lemma, tag) for lemma, tag in seg]
            return sort_analyses(remapped, form_low, seen_lower or segment_lower)
    return sort_analyses(combined, form_low, seen_lower)


def format_entry(key, analyses):
    if not analyses:
        return "  '{}': [], // NIEZNANE — uzupełnij ręcznie\n".format(esc(key))
    lines = ["  '{}': [\n".format(esc(key))]
    for lemma, tag in analyses:
        lines.append("    {{ lemma: '{}', tag: '{}' }},\n".format(
            esc(lemma), esc(tag)))
    lines.append("  ],\n")
    return "".join(lines)


def parse_merge_blocks(text):
    """Bloki istniejacych kluczy z pliku wyjsciowego (klucz -> blok doslownie)."""
    blocks = {}
    order = []
    lines = text.splitlines(keepends=True)
    i = 0
    single_re = re.compile(r"^  '((?:[^'\\]|\\.)*)': \[\],.*\n?$")
    open_re = re.compile(r"^  '((?:[^'\\]|\\.)*)': \[$\n?")
    close_re = re.compile(r"^  \],$\n?")
    while i < len(lines):
        single = single_re.match(lines[i])
        if single:
            key = unesc(single.group(1))
            if key not in blocks:
                order.append(key)
            blocks[key] = lines[i]
            i += 1
            continue
        opening = open_re.match(lines[i])
        if opening:
            key = unesc(opening.group(1))
            chunk = [lines[i]]
            i += 1
            while i < len(lines) and not close_re.match(lines[i]):
                chunk.append(lines[i])
                i += 1
            if i < len(lines):
                chunk.append(lines[i])
                i += 1
            if key not in blocks:
                order.append(key)
            blocks[key] = "".join(chunk)
            continue
        i += 1
    return blocks, order


def make_header(source_rel):
    return (
        "// Wygenerowane: scripts/polski-adnotuj.py z {} "
        "(SGJP 20260823, licencja BSD 2-klauzulowa).\n"
        "// Pierwsza analiza jest domyślna — poprawiaj kolejność ręcznie; "
        "--merge zachowuje ręcznie zmienione wpisy.\n"
    ).format(source_rel)


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Adnotacja morfologiczna tekstu lekcji (SGJP, offline).")
    parser.add_argument("source", help="plik źródłowy .ts z tekstem lekcji")
    parser.add_argument("--out", default=None, help="plik wyjściowy .morph.ts")
    parser.add_argument("--sgjp", default=None, help="zrzut SGJP (.tab.gz)")
    parser.add_argument("--merge", action="store_true",
                        help="zachowaj ręcznie poprawione wpisy w istniejącym pliku")
    args = parser.parse_args(argv)

    sgjp_path = args.sgjp or default_sgjp_path()
    if not os.path.isfile(sgjp_path):
        print("Brak pliku słownika SGJP: {}".format(sgjp_path), file=sys.stderr)
        print("Pobierz zrzut (licencja BSD 2-klauzulowa):", file=sys.stderr)
        print("  {}".format(SGJP_URL), file=sys.stderr)
        print("i wskaż go przez --sgjp ŚCIEŻKA albo zmienną środowiskową {}.".format(
            SGJP_ENV_VAR), file=sys.stderr)
        return 2

    try:
        with open(args.source, "r", encoding="utf-8") as handle:
            source_text = handle.read()
    except OSError as exc:
        print("Nie mogę odczytać pliku źródłowego {}: {}".format(
            args.source, exc), file=sys.stderr)
        return 1

    root = repo_root()
    source_abs = os.path.abspath(args.source)
    try:
        source_rel = os.path.relpath(source_abs, root)
    except ValueError:
        source_rel = source_abs

    if args.out:
        out_path = args.out
    elif args.source.endswith(".ts"):
        out_path = args.source[: -len(".ts")] + ".morph.ts"
    else:
        out_path = args.source + ".morph.ts"
    out_abs = os.path.abspath(out_path)
    out_dir = os.path.dirname(out_abs) or os.getcwd()

    forms = extract_forms(source_text)
    distinct = {}
    seen_lower = set()
    for form in forms:
        key = form.lower()
        distinct.setdefault(key, form)
        if form[:1].islower():
            seen_lower.add(key)

    needed = set()
    for form in forms:
        needed.add(form)
        needed.add(form.lower())
        needed.add(capitalize_first(form))
        if "-" in form:
            segment = form.rpartition("-")[2]
            needed.add(segment)
            needed.add(segment.lower())
            needed.add(capitalize_first(segment))
        # Rdzenie po odcieciu ruchomej koncowki (aglutynant) tez musza byc
        # w slowniku podrecznym, inaczej rozklejanie nie znajdzie wierszy.
        form_low = form.lower()
        for suffix_info in PERSON_SUFFIXES + [BARE_BY]:
            suffix = suffix_info[0]
            if len(form_low) > len(suffix) and form_low.endswith(suffix):
                stem = form_low[: -len(suffix)]
                needed.add(stem)
                needed.add(capitalize_first(stem))
    try:
        table = load_sgjp(sgjp_path, needed)
    except OSError as exc:
        print("Nie mogę odczytać słownika {}: {}".format(sgjp_path, exc),
              file=sys.stderr)
        return 1

    morph = {}
    for key in distinct:
        morph[key] = build_analyses(distinct[key], table, key in seen_lower)

    types_abs = os.path.join(root, TYPES_FROM_REPO)
    import_path = os.path.relpath(types_abs, out_dir).replace(os.sep, "/")
    if not import_path.startswith("."):
        import_path = "./" + import_path

    header = make_header(source_rel)
    import_line = "import type {{ MorphTable }} from '{}';\n".format(import_path)

    unused = []
    if args.merge and os.path.isfile(out_path):
        try:
            with open(out_path, "r", encoding="utf-8") as handle:
                old_text = handle.read()
        except OSError as exc:
            print("Nie mogę odczytać pliku wyjściowego {}: {}".format(
                out_path, exc), file=sys.stderr)
            return 1
        old_blocks, old_order = parse_merge_blocks(old_text)
        parts = [header, import_line, "\n",
                 "export const MORPH: MorphTable = {\n"]
        for key in old_order:
            parts.append(old_blocks[key])
            if key not in morph:
                unused.append(key)
        for key in sorted(morph):
            if key not in old_blocks:
                parts.append(format_entry(key, morph[key]))
        parts.append("};\n")
        output = "".join(parts)
    else:
        parts = [header, import_line, "\n",
                 "export const MORPH: MorphTable = {\n"]
        for key in sorted(morph):
            parts.append(format_entry(key, morph[key]))
        parts.append("};\n")
        output = "".join(parts)

    try:
        with open(out_path, "w", encoding="utf-8") as handle:
            handle.write(output)
    except OSError as exc:
        print("Nie mogę zapisać pliku wyjściowego {}: {}".format(
            out_path, exc), file=sys.stderr)
        return 1

    unknown = sorted([key for key, items in morph.items() if not items])
    ambiguous = []
    for key in sorted(morph):
        classes = []
        for _lemma, tag in morph[key]:
            cls = tag.split(":", 1)[0]
            if cls not in classes:
                classes.append(cls)
        if len(classes) > 1:
            ambiguous.append((key, classes))

    print("Plik źródłowy: {}".format(source_rel))
    print("Zapisano: {}".format(out_path))
    print("Form: {}".format(len(morph)))
    if unknown:
        print("NIEZNANE ({}): {}".format(len(unknown), ", ".join(unknown)))
    else:
        print("NIEZNANE (0): brak")
    if ambiguous:
        print("Wieloznaczne między klasami ({}):".format(len(ambiguous)))
        for key, classes in ambiguous:
            print("  {}: {}".format(key, ", ".join(classes)))
    else:
        print("Wieloznaczne między klasami (0): brak")
    if args.merge:
        if unused:
            print("Nieużywane, zachowane w pliku ({}): {}".format(
                len(unused), ", ".join(sorted(unused))))
        else:
            print("Nieużywane, zachowane w pliku (0): brak")
    return 0


if __name__ == "__main__":
    sys.exit(main())
