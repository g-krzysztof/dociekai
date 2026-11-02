#!/usr/bin/env python3
"""Paradygmaty odmiany dla zamknietej palety slow (kurs jezyka polskiego).

Dla listy lematow (form slownikowych) zebranych ze wszystkich wystapien
`lemmas: [ ... ]` w podanym module .ts generuje WSZYSTKIE formy odmiany
ze zrzutu slownika SGJP (Morfeusz 2, TSV w gzipie) i zapisuje je jako
modul TypeScript (tabela FORMS: lemat -> posortowane formy).

Uzycie:
    python3 scripts/polski-paradygmaty.py <zrodlo.ts> [--out SCIEZKA]
        [--sgjp SCIEZKA] [--exclude-classes ger,ppas] [--keep-neg]

Domyslny zrzut SGJP: $POLSKI_SGJP albo ~/.cache/dociekai/sgjp-20260823.tab.gz
Do pobrania: https://download.sgjp.pl/morfeusz/20260823/sgjp-20260823.tab.gz

Tylko biblioteka standardowa (Python 3.9). Slownik czytany strumieniowo,
w jednym przejsciu; w pamieci trzymane sa tylko formy szukanych lematow.
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
    "src", "app", "jezyk-polski", "klasa-4", "lib", "pisarnia", "types"
)

LEMMAS_RE = re.compile(r"lemmas\s*:\s*\[([^\]]*)\]")
LITERAL_RE = re.compile(r"'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\"")


def esc(text):
    return text.replace("\\", "\\\\").replace("'", "\\'")


def unesc(text):
    return text.replace("\\'", "'").replace('\\"', '"').replace("\\\\", "\\")


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


def extract_lemmas(source_text):
    """Lematy ze wszystkich `lemmas: [...]`; unikalne, w kolejnosci wystapien."""
    lemmas = []
    seen = set()
    for block in LEMMAS_RE.findall(source_text):
        for single, double in LITERAL_RE.findall(block):
            raw = single if single or not double else double
            lemma = unesc(raw)
            if lemma not in seen:
                seen.add(lemma)
                lemmas.append(lemma)
    return lemmas


def tag_has_neg(tag):
    return "neg" in re.split(r"[:.]", tag)


def load_sgjp(path, lemmas, exclude_classes, keep_neg):
    """Jedno przejscie po gzipie; zwraca {lemat: {formy malymi}}.

    Lemat slownika porownywany po czesci przed pierwszym ':'; dokladnie,
    a dla lematow z listy pisanych malymi literami takze po .lower().
    """
    exact = set(lemmas)
    lower = set(lemma for lemma in lemmas if lemma == lemma.lower())
    forms = {lemma: set() for lemma in lemmas}
    with gzip.open(path, "rt", encoding="utf-8") as handle:
        for line in handle:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 3:
                continue
            form, lemma_raw, tag = parts[0], parts[1], parts[2]
            lemma = lemma_raw.split(":", 1)[0]
            hit = None
            if lemma in exact:
                hit = lemma
            elif lemma.lower() in lower:
                hit = lemma.lower()
            if hit is None:
                continue
            cls = tag.split(":", 1)[0]
            if cls in exclude_classes:
                continue
            if not keep_neg and tag_has_neg(tag):
                continue
            forms[hit].add(form.lower())
    return forms


def make_header(source_rel):
    return (
        "// Wygenerowane przez scripts/polski-paradygmaty.py z {} "
        "\u2014 nie edytuj r\u0119cznie.\n"
    ).format(source_rel)


def format_entry(lemma, items):
    quoted = ", ".join("'{}'".format(esc(item)) for item in items)
    return "  '{}': [{}],\n".format(esc(lemma), quoted)


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Paradygmaty odmiany z SGJP dla palety lematow (offline).")
    parser.add_argument("source", help="plik zrodlowy .ts z listami lemmas")
    parser.add_argument("--out", default=None, help="plik wyjsciowy .forms.ts")
    parser.add_argument("--sgjp", default=None, help="zrzut SGJP (.tab.gz)")
    parser.add_argument("--exclude-classes", default="",
                        help="klasy do pominiecia, po przecinku (np. ger,ppas)")
    parser.add_argument("--keep-neg", action="store_true",
                        help="zachowaj formy z czlonem neg w tagu")
    args = parser.parse_args(argv)

    exclude_classes = set(
        cls.strip()
        for cls in args.exclude_classes.split(",")
        if cls.strip()
    )

    sgjp_path = args.sgjp or default_sgjp_path()
    if not os.path.isfile(sgjp_path):
        print("Brak pliku slownika SGJP: {}".format(sgjp_path), file=sys.stderr)
        print("Pobierz zrzut (licencja BSD 2-klauzulowa):", file=sys.stderr)
        print("  {}".format(SGJP_URL), file=sys.stderr)
        print("i wskaz go przez --sgjp SCIEZKA albo zmienna srodowiskowa {}.".format(
            SGJP_ENV_VAR), file=sys.stderr)
        return 2

    try:
        with open(args.source, "r", encoding="utf-8") as handle:
            source_text = handle.read()
    except OSError as exc:
        print("Nie moge odczytac pliku zrodlowego {}: {}".format(
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
        out_path = args.source[: -len(".ts")] + ".forms.ts"
    else:
        out_path = args.source + ".forms.ts"
    out_abs = os.path.abspath(out_path)
    out_dir = os.path.dirname(out_abs) or os.getcwd()

    lemmas = extract_lemmas(source_text)

    try:
        forms = load_sgjp(sgjp_path, lemmas, exclude_classes, args.keep_neg)
    except OSError as exc:
        print("Nie moge odczytac slownika {}: {}".format(sgjp_path, exc),
              file=sys.stderr)
        return 1

    missing = []
    table = {}
    for lemma in lemmas:
        found = sorted(forms[lemma])
        if not found:
            missing.append(lemma)
            print("BRAK: {}".format(lemma), file=sys.stderr)
        lemma_low = lemma.lower()
        if lemma_low not in forms[lemma]:
            found = sorted(forms[lemma] | {lemma_low})
        table[lemma] = found

    types_abs = os.path.join(root, TYPES_FROM_REPO)
    import_path = os.path.relpath(types_abs, out_dir).replace(os.sep, "/")
    if not import_path.startswith("."):
        import_path = "./" + import_path

    parts = [make_header(source_rel)]
    parts.append("import type {{ FormsTable }} from '{}';\n".format(import_path))
    parts.append("\nexport const FORMS: FormsTable = {\n")
    for lemma in lemmas:
        parts.append(format_entry(lemma, table[lemma]))
    parts.append("};\n")
    output = "".join(parts)

    try:
        with open(out_path, "w", encoding="utf-8") as handle:
            handle.write(output)
    except OSError as exc:
        print("Nie moge zapisac pliku wyjsciowego {}: {}".format(
            out_path, exc), file=sys.stderr)
        return 1

    total = sum(len(items) for items in table.values())
    print("Lematy: {}, formy: {}, braki: {}".format(
        len(lemmas), total, len(missing)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
