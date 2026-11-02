#!/usr/bin/env python3
"""Lista hasel "grubego slownika" L10: lematy SGJP wyrazow z tekstow Czytelni.

Uzycie: python3 scripts/polski-slownik-lematy.py [--sgjp SCIEZKA] [--must a,b,c]
        [--min 2400] [--out SCIEZKA]
Zrzut SGJP: $POLSKI_SGJP albo ~/.cache/dociekai/sgjp-20260823.tab.gz.
Tylko biblioteka standardowa (Python 3.9); zrzut czytany strumieniowo (2 przejscia).
Odrzuca lematy, ktorych homonim (cytowana forma lematu) ma kwalifikator
wulgarny/obrazliwy/pogardliwy/przestarzaly/archaiczny.
"""
import argparse
import glob
import gzip
import os
import re
import sys

DEFAULT_MUST = ("kot,kret,krowa,kreda,kredka,kredens,krem,kreska,kretowisko,zamek,"
                "klucz,pióro,sowa,słownik,kasza,kawa,kura,kurtka,drzwi,piwnica,"
                "wzgórze,nuta,gęś,pies,mapa")
CLASSES = {"subst", "adj", "adv", "inf", "fin", "praet", "impt", "bedzie"}
BAD_PREFIXES = ("wulg", "obraź", "obr", "pogard", "obsc", "obsc", "daw", "przest", "arch")
ALPHABET = "aąbcćdeęfghijklłmnńoóprsśtuvwxyzźż"
ALPHABET = "aąbcćdeęfghijklłmnńoópqrsśtuvwxyzźż"
ORDER = {ch: i for i, ch in enumerate(ALPHABET)}
LEMMA_RE = re.compile(r"^[a-ząćęłńóśźż]{3,12}$")
WORD_RE = re.compile(r"[^\W\d_]+")
BACKTICK_RE = re.compile(r"`(.*?)`", re.DOTALL)
OPEN_RE = re.compile(r"\[\[[a-z0-9-]+ ")
OVERRIDE_RE = re.compile(r"\{[^}]*\}")


def root():
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.dirname(here)


def sort_key(w):
    return [ORDER.get(c, 100 + ord(c)) for c in w]


def words_of(path):
    with open(path, encoding="utf-8") as fh:
        src = fh.read()
    out = []
    for chunk in BACKTICK_RE.findall(src):
        chunk = OVERRIDE_RE.sub("", chunk)
        chunk = OPEN_RE.sub("", chunk).replace("]]", "")
        out.extend(w.lower() for w in WORD_RE.findall(chunk))
    return out


def bad_qual(q):
    for part in re.split(r"[|,]", q):
        p = part.strip().lower()
        if p.startswith(BAD_PREFIXES):
            return p
    return None


def analyse(sgjp, forms):
    """Zwraca (kandydaci: lemat->set(id), ids: id->lemat, info) po dwoch przejsciach."""
    cand = {}  # form -> list of (lemma_id, lemma)
    ids = {}
    with gzip.open(sgjp, "rt", encoding="utf-8") as fh:
        for line in fh:
            if line[0] == "#":
                continue
            p = line.rstrip("\n").split("\t")
            if len(p) < 4 or p[0] not in forms:
                continue
            if p[2].split(":")[0] not in CLASSES or p[3] not in ("", "nazwa_pospolita"):
                continue
            lemma = p[1].split(":")[0]
            if lemma != lemma.lower() or not LEMMA_RE.match(lemma):
                continue
            ids[p[1]] = lemma
            cand.setdefault(p[0], []).append(p[1])
    bad = {}  # lemma_id -> kwalifikator
    with gzip.open(sgjp, "rt", encoding="utf-8") as fh:
        for line in fh:
            if line[0] == "#":
                continue
            p = line.rstrip("\n").split("\t")
            if len(p) < 5 or p[1] not in ids or not p[4]:
                continue
            if p[0] != ids[p[1]]:
                continue
            q = bad_qual(p[4])
            if q:
                bad[p[1]] = p[4]
    return cand, ids, bad


def lemmas_from(sgjp, forms):
    cand, ids, bad = analyse(sgjp, forms)
    ok, rejected = set(), {}
    by_lemma = {}
    for f, lst in cand.items():
        for i in lst:
            by_lemma.setdefault(ids[i], set()).add(i)
    for lemma, idset in by_lemma.items():
        good = [i for i in idset if i not in bad]
        if good:
            ok.add(lemma)
        else:
            rejected[lemma] = bad[next(iter(idset))]
    return ok, rejected


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sgjp", default=os.environ.get("POLSKI_SGJP") or os.path.join(
        os.path.expanduser("~"), ".cache", "dociekai", "sgjp-20260823.tab.gz"))
    ap.add_argument("--must", default=DEFAULT_MUST)
    ap.add_argument("--min", type=int, default=2400)
    ap.add_argument("--out", default=os.path.join(
        root(), "src", "app", "jezyk-polski", "klasa-4", "data", "slownik", "lematy.ts"))
    a = ap.parse_args()
    base = os.path.join(root(), "src", "app", "jezyk-polski", "klasa-4")
    czyt = sorted(glob.glob(os.path.join(base, "data", "czytelnia", "*", "odc-*.ts")))
    forms = set()
    for f in czyt:
        forms.update(words_of(f))
    ok, rejected = lemmas_from(a.sgjp, forms)
    n_czyt = len(ok)
    n_other = 0
    if len(ok) < a.min:
        cz = set(czyt)
        other = set()
        for dp, _, fs in os.walk(base):
            for fn in fs:
                p = os.path.join(dp, fn)
                if fn.endswith(".ts") and p not in cz:
                    other.update(words_of(p))
        other -= forms
        ok2, rej2 = lemmas_from(a.sgjp, other)
        new = ok2 - ok
        n_other = len(new)
        ok |= new
        for k, v in rej2.items():
            if k not in ok:
                rejected.setdefault(k, v)
    must = [m.strip() for m in a.must.split(",") if m.strip()]
    missing = [m for m in must if m not in ok]
    ok.update(must)
    res = sorted(ok, key=sort_key)
    lines = []
    for i in range(0, len(res), 10):
        lines.append("  " + " ".join("'%s'," % w for w in res[i:i + 10]))
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, "w", encoding="utf-8") as fh:
        fh.write("/** Wygenerowane: python3 scripts/polski-slownik-lematy.py — nie edytować ręcznie.\n"
                 " *  Hasła „grubego słownika” L10: lematy SGJP wyrazów z tekstów Czytelni, polska kolejność. */\n"
                 "export const LEMATY: readonly string[] = [\n" + "\n".join(lines) + "\n];\n")
    print("Lematow: %d (z Czytelni: %d, z pozostalych .ts: %d, dodane z --must: %d)" % (
        len(res), n_czyt, n_other, len(res) - n_czyt - n_other))
    cnt = {}
    for w in res:
        cnt[w[0]] = cnt.get(w[0], 0) + 1
    print("Na litere:", " ".join("%s=%d" % (k, cnt[k]) for k in sorted(cnt, key=lambda c: ORDER.get(c, 99))))
    print("Na 'kr':", sum(1 for w in res if w.startswith("kr")))
    rj = sorted(rejected.items())
    print("Odrzucone kwalifikatorem (%d):" % len(rj))
    print("  " + ", ".join("%s [%s]" % kv for kv in rj))
    print("Brakujace z --must w SGJP/tekstach (dodane):", ", ".join(missing) or "brak")


if __name__ == "__main__":
    sys.exit(main())
