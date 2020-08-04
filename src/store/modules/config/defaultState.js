export default () => ({
    // is_open: false, 
    show_all_trees: true,
    shownfeatures: ["FORM", "UPOS", "LEMMA", "MISC.Gloss"],
    shownmeta: ["text_en"],
    annotationFeatures: {
        "META": [
            "sent_id", "text", "text_en", "text_ortho", "speaker_id", "sound_url"
        ],
        "UPOS": [
            "ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "VERB", "X"
        ],
        "XPOS": [],
        "FEATS": [
            { "name": "Abbr", "values": ["Yes"]},
            { "name": "Animacy", "values": ["Anim", "Hum ", "Inan ", "Nhum"]},
            { "name": "Aspect", "values": ["Hab", "Imp", "Iter", "Perf", "Prog", "Prosp"]},
            { "name": "Case", "values": ["Abs", "Acc", "Erg", "Nom", "Abe", "Ben", "Cau", "Cmp", "Com", "Dat", "Dis", "Equ", "Gen", "Ins", "Par", "Tem", "Tra", "Voc", "Abl", "Add", "Ade", "All", "Del", "Ela", "Ess", "Ill", "Ine", "Lat", "Loc", "Sub", "Sup", "Ter"]},
            { "name": "Definite", "values": ["Com", "Cons", "Def", "Ind", "Spec"]},
            { "name": "Degree", "values": ["Abs", "Cmp", "Equ", "Pos", "Sup"]},
            { "name": "Evident", "values": ["Fh", "Nfh"]},
            { "name": "Foreign", "values": ["Yes"]},
            { "name": "Gender", "values": ["Com", "Fem", "Masc", "Neut"]},
            { "name": "Mood", "values": ["Adm", "Cnd", "Des", "Imp", "Ind", "Jus", "Nec", "Opt", "Pot", "Prp", "Qot", "Sub"]},
            { "name": "NumType", "values": ["Card", "Dist", "Frac", "Mult", "Ord", "Range", "Sets"]},
            { "name": "Number", "values": ["Coll", "Count", "Dual", "Grpa", "Grpl", "Inv", "Pauc", "Plur", "Ptan", "Sing", "Tri"]},
            { "name": "Person", "values": ["0", "1", "2", "3", "4"]},
            { "name": "Polarity", "values": ["Neg", "Pos"]},
            { "name": "Polite", "values": ["Elev", "Form", "Humb", "Infm"]},
            { "name": "Poss", "values": ["Yes"]},
            { "name": "PronType", "values": ["Art", "Dem", "Emp", "Exc", "Ind", "Int", "Neg", "Prs", "Rcp", "Rel", "Tot"]},
            { "name": "Reflex", "values": ["Yes"]},
            { "name": "Tense", "values": ["Fut", "Imp", "Past", "Pqp", "Pres"]},
            { "name": "VerbForm", "values": ["Conv", "Fin", "Gdv", "Ger", "Inf", "Part", "Sup", "Vnoun"]},
            { "name": "Voice", "values": ["Act", "Antip", "Cau", "Dir", "Inv", "Mid", "Pass", "Rcp"]}
        ],
        "MISC": [
            { "name": "AlignBegin", "values": "Number" },
            { "name": "AlignEnd", "values": "Number" },
            { "name": "EXTPOS", "values": ["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "VERB", "X"] },
            { "name": "Gloss", "values": "String" }
        ],
        "DEPREL": [
            {"name": "rel", "values": ["cc","comp","compound","conj","det","discourse","dislocated","flat","goeswith","mod","parataxis","punct","root","subj","unk","vocative"], "join":""},
            {"name": "subrel", "values": ["","appos", "aux", "cleft", "comp", "conj", "coord", "dicto", "discourse", "dislocated", "emph", "expl", "fixed", "foreign", "insert", "num", "obj", "obl", "parenth", "periph", "poss", "pred", "prt", "redup", "relcl", "scrap", "svc"], "join":":"},
            {"name": "deep", "values": ["","agent", "expl", "fixed", "lvc", "m", "num", "relcl", "scrap", "x"], "join":"@"}
        ],
        "DEPS": [
            {"name": "deep", "values": ["comp", "mod", "subj"], "join":""}

        ]
    }
})