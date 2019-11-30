<template>
    <q-card style=" max-width: 100vw;">
        <q-bar class="bg-primary text-white">
            <q-space />
            <div class="text-weight-bold">RelationTables</div>
            <q-space />
            <q-btn flat dense icon="close" v-close-popup/>
        </q-bar>
        <q-card-section >
            <div class="row q-gutter-lg">
                <div class="col-2">
                    <q-toolbar class="  text-center">
                        <q-toolbar-title>
                        <span class="text-primary text-bold">Select an edge</span>
                        </q-toolbar-title>
                    </q-toolbar>
                    <q-scroll-area
                    visible 
                    style="height: 80vh;"
                    >
                    <q-list separator>
                        <q-item v-for="e in edgesList" :key="e" clickable v-ripple :active="e == currentEdge" active-class="bg-grey-4 text-primary text-bold">
                            <q-item-section @click="select(e)" >{{e}}</q-item-section>
                        </q-item>
                    </q-list>
                    </q-scroll-area>
                </div>
                <div class="col-9">
                    <q-toolbar class="  text-center">
                        <q-toolbar-title>
                        <span v-show="currentEdge.length > 0" class="text-primary text-bold">{{'Relation Table for ' + currentEdge}}</span>
                        </q-toolbar-title>
                    </q-toolbar>
                    <q-table
                        v-show="currentEdge.length > 0"
                        ref="relationTable"
                        class="rounded-borders"
                        :data="table.rows"
                        :columns="table.columns"
                        :pagination.sync="table.pagination"
                        row-key="gov"
                    >

                        <template v-slot:body-cell="props">
                            <q-td :props="props">
                                <span v-if="isString(props.value)"> <span class="text-grey text-bold"> {{props.value}} </span> </span>
                                <span v-else-if="Object.keys(props.value).length < 1" >  </span>
                                <q-btn v-else color="primary" :label="Object.keys(props.value).length" @click="showTrees(props.value)" />
                            </q-td>
                        </template>
                    </q-table>
                </div>
            </div>
            
        </q-card-section>
        <q-dialog v-model="visuTreeDial" maximized transition-show="fade" transition-hide="fade" >
            <result-view :searchresults="selectedResults" :projectname="projectname"></result-view>
        </q-dialog>
    </q-card>
</template>

<script>
import ResultView from '../components/ResultView.vue';

export default {
    components: {ResultView},
    props: ['edges', 'projectname'],
    data(){
        return {
            currentEdge: '',
            visuTreeDial: false,
            selectedResults: {},
            edgesList: Object.keys(this.edges),
            table:{
                rows: [],
                columns: [],
                pagination: {
                    sortBy: 'name',
                    descending: false,
                    page: 2,
                    rowsPerPage: 50,
                    rowsNumber: 0
                }
            }
        }
    },
    methods: {
        createTable(edge){
            var keyset = new Set();
            for( let gov of Object.keys(this.edges[edge])){ keyset.add(gov); for( let dep of Object.keys(this.edges[edge][gov]) ) keyset.add(dep); }
            // construct fields
            let fields = [{ name: 'gov', label: row => 'Governor: ' + row.gov, 'field': row => row.gov}];
            for ( let key of keyset ){ fields.push( { name: key, align: 'center', label: key, field: key} ); }
            this.table.columns = fields;
            // construct rows
            let rows = [];
            for ( let gov of keyset) {
                let row = { gov: gov };
                for (let dep of keyset){
                    if(!this.edges[edge].hasOwnProperty(gov)) { row[dep] = {}; continue; }
                    if(!this.edges[edge][gov].hasOwnProperty(dep) )  { row[dep] = {}; continue; }
                    row[dep] = this.edges[edge][gov][dep]; // A REMETTRE APREs
                    // row[dep] = {'hi':'hi', 'ho': 'hi'}; // DUMMY RESULT
                }
                rows.push(row);
            }
            this.table.rows = rows;
            this.table.pagination.rowsNumber = rows.length;
        },
        select(edge){
            this.createTable(edge);
            this.currentEdge = edge;
        },
        showTrees(props) {
            this.selectedResults = props;
            this.visuTreeDial = true;
        },
        isString: function(s) {
            return typeof s === 'string' || s instanceof String;
        }
    }, 
    mounted(){
        this.edges = {
    "vocative": {
        "VERB": {
            "PROPN": {}
        },
        "PUNCT": {
            "PUNCT": {
                "P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20": {
                    "sentence": "# # we Naija rapper Eva Eva Allordiah // // //",
                    "conlls": {
                        "gael.guibon": "# user_id = Marine\n# elan_id = P_WAZK_07_42 P_WAZK_07_43\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20\n# sent_translation = # our Nigerians rapper, Eva Alocha,\n# text = # we Naija rapper Eva Allordiah //\n# timestamp = 1573131380.750532\n1\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n2\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n3\twe\t_\tPRON\t_\tCase=Nom|endali=170010|Number=Plur|Person=1|PronType=Prs|startali=169837\t4\tdep\t_\t_\n4\tNaija\t_\tPROPN\t_\tendali=170438|startali=170010\t5\tdep\t_\t_\n5\trapper\t_\tNOUN\t_\tendali=170870|startali=170438\t0\troot\t_\t_\n6\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n7\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n8\tAllordiah\t_\tPROPN\t_\tendali=171770|startali=171290\t6\tflat:caus\t_\t_\n9\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct\t_\t_\n10\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct:caus\t_\t_\n11\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t10\tvocative\t_\t_\n"
                    },
                    "matches": {
                        "gael.guibon": {
                            "edges": {
                                "e": {
                                    "source": "10",
                                    "label": "vocative",
                                    "target": "11"
                                }
                            },
                            "nodes": {
                                "GOV": "10",
                                "DEP": "11"
                            }
                        }
                    }
                }
            }
        },
        "NOUN": {
            "NOUN": {}
        },
        "AUX": {
            "PROPN": {},
            "NOUN": {},
            "ADP": {}
        }
    },
    "unk": {
        "ADP": {
            "DET": {}
        }
    },
    "subj:expl": {
        "VERB": {
            "PRON": {}
        },
        "AUX": {
            "PRON": {}
        }
    },
    "subj": {
        "X": {
            "PRON": {}
        },
        "VERB": {
            "VERB": {},
            "PROPN": {},
            "PRON": {},
            "NOUN": {}
        },
        "PROPN": {
            "DET": {}
        },
        "PART": {
            "PROPN": {},
            "PRON": {},
            "NOUN": {}
        },
        "NOUN": {
            "PRON": {}
        },
        "AUX": {
            "VERB": {},
            "PROPN": {},
            "PRON": {},
            "NOUN": {},
            "DET": {},
            "ADJ": {}
        },
        "ADP": {
            "NOUN": {}
        },
        "ADJ": {
            "NOUN": {}
        }
    },
    "root": {
        "_none_": {
            "X": {},
            "VERB": {},
            "PROPN": {},
            "PRON": {},
            "PART": {},
            "NOUN": {
                "P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20": {
                    "sentence": "# # we Naija rapper Eva Eva Allordiah // // //",
                    "conlls": {
                        "gael.guibon": "# user_id = Marine\n# elan_id = P_WAZK_07_42 P_WAZK_07_43\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20\n# sent_translation = # our Nigerians rapper, Eva Alocha,\n# text = # we Naija rapper Eva Allordiah //\n# timestamp = 1573131380.750532\n1\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n2\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n3\twe\t_\tPRON\t_\tCase=Nom|endali=170010|Number=Plur|Person=1|PronType=Prs|startali=169837\t4\tdep\t_\t_\n4\tNaija\t_\tPROPN\t_\tendali=170438|startali=170010\t5\tdep\t_\t_\n5\trapper\t_\tNOUN\t_\tendali=170870|startali=170438\t0\troot\t_\t_\n6\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n7\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n8\tAllordiah\t_\tPROPN\t_\tendali=171770|startali=171290\t6\tflat:caus\t_\t_\n9\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct\t_\t_\n10\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct:caus\t_\t_\n11\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t10\tvocative\t_\t_\n"
                    },
                    "matches": {
                        "gael.guibon": {
                            "edges": {
                                "e": {
                                    "source": "ROOT",
                                    "label": "root",
                                    "target": "5"
                                }
                            },
                            "nodes": {
                                "GOV": "ROOT",
                                "DEP": "5"
                            }
                        }
                    }
                }
            },
            "INTJ": {},
            "AUX": {},
            "ADV": {},
            "ADP": {}
        }
    },
    "punct:caus": {
        "NOUN": {
            "PUNCT": {
                "P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20": {
                    "sentence": "# # we Naija rapper Eva Eva Allordiah // // //",
                    "conlls": {
                        "gael.guibon": "# user_id = Marine\n# elan_id = P_WAZK_07_42 P_WAZK_07_43\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20\n# sent_translation = # our Nigerians rapper, Eva Alocha,\n# text = # we Naija rapper Eva Allordiah //\n# timestamp = 1573131380.750532\n1\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n2\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n3\twe\t_\tPRON\t_\tCase=Nom|endali=170010|Number=Plur|Person=1|PronType=Prs|startali=169837\t4\tdep\t_\t_\n4\tNaija\t_\tPROPN\t_\tendali=170438|startali=170010\t5\tdep\t_\t_\n5\trapper\t_\tNOUN\t_\tendali=170870|startali=170438\t0\troot\t_\t_\n6\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n7\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n8\tAllordiah\t_\tPROPN\t_\tendali=171770|startali=171290\t6\tflat:caus\t_\t_\n9\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct\t_\t_\n10\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct:caus\t_\t_\n11\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t10\tvocative\t_\t_\n"
                    },
                    "matches": {
                        "gael.guibon": {
                            "edges": {
                                "e": {
                                    "source": "5",
                                    "label": "punct:caus",
                                    "target": "10"
                                }
                            },
                            "nodes": {
                                "GOV": "5",
                                "DEP": "10"
                            }
                        }
                    }
                }
            }
        },
        "_none_": {
            "PUNCT": {
                "P_WAZK_07_As-e-dey-Hot-News-Read_PRO_19": {
                    "sentence": "# for jolijoli //",
                    "conlls": {
                        "gael.guibon": "# user_id = Marine\n# elan_id = P_WAZK_07_40 P_WAZK_07_41\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_19\n# sent_translation = # For Jolly jolly,\n# text = # for jolijoli //\n# timestamp = 1573131380.750527\n1\t#\t_\tPUNCT\t_\tendali=168740|startali=167560\t0\tpunct:caus\t_\t_\n2\tfor\t_\tADP\t_\tendali=168990|startali=168740\t4\tpunct:appos\t_\t_\n3\tjolijoli\t_\tNOUN\t_\tendali=169642|startali=168990\t0\tcomp:cleft\t_\t_\n4\t//\t_\tPART\t_\tendali=169672|startali=169642\t2\tpunct\t_\t_\n"
                    },
                    "matches": {
                        "gael.guibon": {
                            "edges": {
                                "e": {
                                    "source": "ROOT",
                                    "label": "punct:caus",
                                    "target": "1"
                                }
                            },
                            "nodes": {
                                "GOV": "ROOT",
                                "DEP": "1"
                            }
                        }
                    }
                }
            }
        }
    },
    "punct:aux": {
        "PUNCT": {
            "PUNCT": {}
        },
        "NOUN": {
            "PUNCT": {}
        }
    },
    "punct:appos": {
        "PART": {
            "ADP": {
                "P_WAZK_07_As-e-dey-Hot-News-Read_PRO_19": {
                    "sentence": "# for jolijoli //",
                    "conlls": {
                        "gael.guibon": "# user_id = Marine\n# elan_id = P_WAZK_07_40 P_WAZK_07_41\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_19\n# sent_translation = # For Jolly jolly,\n# text = # for jolijoli //\n# timestamp = 1573131380.750527\n1\t#\t_\tPUNCT\t_\tendali=168740|startali=167560\t0\tpunct:caus\t_\t_\n2\tfor\t_\tADP\t_\tendali=168990|startali=168740\t4\tpunct:appos\t_\t_\n3\tjolijoli\t_\tNOUN\t_\tendali=169642|startali=168990\t0\tcomp:cleft\t_\t_\n4\t//\t_\tPART\t_\tendali=169672|startali=169642\t2\tpunct\t_\t_\n"
                    },
                    "matches": {
                        "gael.guibon": {
                            "edges": {
                                "e": {
                                    "source": "4",
                                    "label": "punct:appos",
                                    "target": "2"
                                }
                            },
                            "nodes": {
                                "GOV": "4",
                                "DEP": "2"
                            }
                        }
                    }
                }
            }
        }
    },
    "punct": {
        "XX": {
            "PUNCT": {}
        },
        "X": {
            "PUNCT": {}
        },
        "VERB": {
            "PUNCT": {},
            "NOUN": {}
        },
        "SCONJ": {
            "PUNCT": {}
        },
        "PUNCT": {
            "PUNCT": {},
            "ADV": {}
        },
        "PROPN": {
            "PUNCT": {
                "P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20": {
                    "sentence": "# # we Naija rapper Eva Eva Allordiah // // //",
                    "conlls": {
                        "gael.guibon": "# user_id = Marine\n# elan_id = P_WAZK_07_42 P_WAZK_07_43\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20\n# sent_translation = # our Nigerians rapper, Eva Alocha,\n# text = # we Naija rapper Eva Allordiah //\n# timestamp = 1573131380.750532\n1\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n2\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n3\twe\t_\tPRON\t_\tCase=Nom|endali=170010|Number=Plur|Person=1|PronType=Prs|startali=169837\t4\tdep\t_\t_\n4\tNaija\t_\tPROPN\t_\tendali=170438|startali=170010\t5\tdep\t_\t_\n5\trapper\t_\tNOUN\t_\tendali=170870|startali=170438\t0\troot\t_\t_\n6\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n7\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n8\tAllordiah\t_\tPROPN\t_\tendali=171770|startali=171290\t6\tflat:caus\t_\t_\n9\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct\t_\t_\n10\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct:caus\t_\t_\n11\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t10\tvocative\t_\t_\n",
                        "user_id": "# user_id = Marine\n# elan_id = P_WAZK_07_42 P_WAZK_07_43\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20\n# sent_translation = # our Nigerians rapper, Eva Alocha,\n# text = # we Naija rapper Eva Allordiah //\n# timestamp = 1573131380.750532\n1\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n2\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n3\twe\t_\tPRON\t_\tCase=Nom|endali=170010|Number=Plur|Person=1|PronType=Prs|startali=169837\t4\tdep\t_\t_\n4\tNaija\t_\tPROPN\t_\tendali=170438|startali=170010\t5\tdep\t_\t_\n5\trapper\t_\tNOUN\t_\tendali=170870|startali=170438\t0\troot\t_\t_\n6\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n7\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n8\tAllordiah\t_\tPROPN\t_\tendali=171770|startali=171290\t6\tflat:caus\t_\t_\n9\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct\t_\t_\n10\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct:caus\t_\t_\n11\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t10\tvocative\t_\t_\n"
                    },
                    "matches": {
                        "gael.guibon": {
                            "edges": {
                                "e": {
                                    "source": "6",
                                    "label": "punct",
                                    "target": "1"
                                }
                            },
                            "nodes": {
                                "GOV": "6",
                                "DEP": "1"
                            }
                        },
                        "user_id": {
                            "edges": {
                                "e": {
                                    "source": "6",
                                    "label": "punct",
                                    "target": "2"
                                }
                            },
                            "nodes": {
                                "GOV": "6",
                                "DEP": "2"
                            }
                        }
                    }
                }
            },
            "PROPN": {}
        },
        "PRON": {
            "PUNCT": {}
        },
        "PART": {
            "PUNCT": {}
        },
        "NUM": {
            "PUNCT": {}
        },
        "NOUN": {
            "PUNCT": {
                "P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20": {
                    "sentence": "# # we Naija rapper Eva Eva Allordiah // // //",
                    "conlls": {
                        "gael.guibon": "# user_id = Marine\n# elan_id = P_WAZK_07_42 P_WAZK_07_43\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20\n# sent_translation = # our Nigerians rapper, Eva Alocha,\n# text = # we Naija rapper Eva Allordiah //\n# timestamp = 1573131380.750532\n1\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n2\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n3\twe\t_\tPRON\t_\tCase=Nom|endali=170010|Number=Plur|Person=1|PronType=Prs|startali=169837\t4\tdep\t_\t_\n4\tNaija\t_\tPROPN\t_\tendali=170438|startali=170010\t5\tdep\t_\t_\n5\trapper\t_\tNOUN\t_\tendali=170870|startali=170438\t0\troot\t_\t_\n6\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n7\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n8\tAllordiah\t_\tPROPN\t_\tendali=171770|startali=171290\t6\tflat:caus\t_\t_\n9\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct\t_\t_\n10\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct:caus\t_\t_\n11\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t10\tvocative\t_\t_\n"
                    },
                    "matches": {
                        "gael.guibon": {
                            "edges": {
                                "e": {
                                    "source": "5",
                                    "label": "punct",
                                    "target": "9"
                                }
                            },
                            "nodes": {
                                "GOV": "5",
                                "DEP": "9"
                            }
                        }
                    }
                }
            },
            "ADP": {}
        },
        "INTJ": {
            "PUNCT": {}
        },
        "DET": {
            "PUNCT": {},
            "DET": {}
        },
        "CCONJ": {
            "PUNCT": {}
        },
        "AUX": {
            "PUNCT": {},
            "PRON": {}
        },
        "ADV": {
            "PUNCT": {}
        },
        "ADP": {
            "PUNCT": {},
            "PART": {
                "P_WAZK_07_As-e-dey-Hot-News-Read_PRO_19": {
                    "sentence": "# for jolijoli //",
                    "conlls": {
                        "gael.guibon": "# user_id = Marine\n# elan_id = P_WAZK_07_40 P_WAZK_07_41\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_19\n# sent_translation = # For Jolly jolly,\n# text = # for jolijoli //\n# timestamp = 1573131380.750527\n1\t#\t_\tPUNCT\t_\tendali=168740|startali=167560\t0\tpunct:caus\t_\t_\n2\tfor\t_\tADP\t_\tendali=168990|startali=168740\t4\tpunct:appos\t_\t_\n3\tjolijoli\t_\tNOUN\t_\tendali=169642|startali=168990\t0\tcomp:cleft\t_\t_\n4\t//\t_\tPART\t_\tendali=169672|startali=169642\t2\tpunct\t_\t_\n"
                    },
                    "matches": {
                        "gael.guibon": {
                            "edges": {
                                "e": {
                                    "source": "2",
                                    "label": "punct",
                                    "target": "4"
                                }
                            },
                            "nodes": {
                                "GOV": "2",
                                "DEP": "4"
                            }
                        }
                    }
                }
            }
        },
        "ADJ": {
            "PUNCT": {}
        }
    },
    "parataxis:obj": {
        "VERB": {
            "VERB": {},
            "INTJ": {},
            "AUX": {},
            "ADV": {}
        },
        "SCONJ": {
            "ADP": {}
        }
    },
    "parataxis:discourse": {
        "AUX": {
            "VERB": {}
        }
    },
    "parataxis:conj": {
        "VERB": {
            "VERB": {},
            "PART": {},
            "AUX": {}
        },
        "AUX": {
            "AUX": {}
        }
    },
    "orphan": {
        "VERB": {
            "DET": {}
        },
        "PUNCT": {
            "PROPN": {}
        },
        "DET": {
            "ADP": {}
        },
        "ADP": {
            "DET": {}
        }
    },
    "mod:periph": {
        "X": {
            "ADP": {}
        },
        "VERB": {
            "VERB": {},
            "SCONJ": {},
            "ADP": {}
        },
        "PROPN": {
            "ADP": {}
        },
        "PRON": {
            "ADV": {}
        },
        "PART": {
            "VERB": {},
            "PART": {},
            "ADP": {}
        },
        "INTJ": {
            "ADP": {}
        },
        "AUX": {
            "SCONJ": {},
            "ADV": {},
            "ADP": {}
        }
    },
    "mod:emph": {
        "PRON": {
            "PART": {}
        },
        "PART": {
            "PART": {}
        },
        "NOUN": {
            "PART": {},
            "ADV": {}
        },
        "AUX": {
            "ADV": {}
        }
    },
    "mod": {
        "VERB": {
            "VERB": {},
            "SCONJ": {},
            "PUNCT": {},
            "PART": {},
            "NOUN": {},
            "AUX": {},
            "ADV": {},
            "ADP": {},
            "ADJ": {}
        },
        "PROPN": {
            "ADV": {}
        },
        "PRON": {
            "PART": {},
            "ADP": {}
        },
        "NOUN": {
            "PART": {},
            "NOUN": {},
            "ADV": {},
            "ADP": {}
        },
        "DET": {
            "ADV": {}
        },
        "AUX": {
            "PART": {},
            "ADV": {},
            "ADP": {}
        },
        "ADV": {
            "ADV": {}
        },
        "ADP": {
            "ADV": {}
        },
        "ADJ": {
            "PART": {},
            "ADV": {},
            "ADP": {}
        }
    },
    "flat:foreign": {
        "X": {
            "X": {}
        },
        "NOUN": {
            "PART": {}
        }
    },
    "flat:caus": {
        "PROPN": {
            "PROPN": {
                "P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20": {
                    "sentence": "# # we Naija rapper Eva Eva Allordiah // // //",
                    "conlls": {
                        "gael.guibon": "# user_id = Marine\n# elan_id = P_WAZK_07_42 P_WAZK_07_43\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20\n# sent_translation = # our Nigerians rapper, Eva Alocha,\n# text = # we Naija rapper Eva Allordiah //\n# timestamp = 1573131380.750532\n1\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n2\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n3\twe\t_\tPRON\t_\tCase=Nom|endali=170010|Number=Plur|Person=1|PronType=Prs|startali=169837\t4\tdep\t_\t_\n4\tNaija\t_\tPROPN\t_\tendali=170438|startali=170010\t5\tdep\t_\t_\n5\trapper\t_\tNOUN\t_\tendali=170870|startali=170438\t0\troot\t_\t_\n6\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n7\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n8\tAllordiah\t_\tPROPN\t_\tendali=171770|startali=171290\t6\tflat:caus\t_\t_\n9\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct\t_\t_\n10\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct:caus\t_\t_\n11\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t10\tvocative\t_\t_\n"
                    },
                    "matches": {
                        "gael.guibon": {
                            "edges": {
                                "e": {
                                    "source": "6",
                                    "label": "flat:caus",
                                    "target": "8"
                                }
                            },
                            "nodes": {
                                "GOV": "6",
                                "DEP": "8"
                            }
                        }
                    }
                }
            }
        }
    },
    "flat": {
        "VERB": {
            "PROPN": {}
        },
        "PROPN": {
            "PROPN": {},
            "NUM": {},
            "NOUN": {},
            "ADP": {},
            "ADJ": {}
        },
        "NUM": {
            "NUM": {},
            "NOUN": {}
        },
        "NOUN": {
            "XX": {},
            "VERB": {},
            "PROPN": {},
            "NUM": {},
            "NOUN": {}
        },
        "ADP": {
            "PROPN": {}
        },
        "ADJ": {
            "NOUN": {},
            "ADJ": {}
        }
    },
    "fixed": {
        "VERB": {
            "ADP": {}
        },
        "SCONJ": {
            "PRON": {},
            "ADP": {}
        },
        "NOUN": {
            "ADP": {}
        },
        "ADP": {
            "VERB": {},
            "NOUN": {},
            "DET": {},
            "ADP": {}
        }
    },
    "dislocated": {
        "VERB": {
            "NOUN": {}
        },
        "PART": {
            "PROPN": {},
            "NOUN": {}
        },
        "AUX": {
            "PROPN": {},
            "PRON": {},
            "NOUN": {},
            "ADV": {}
        }
    },
    "discourse": {
        "VERB": {
            "PROPN": {},
            "PART": {},
            "INTJ": {},
            "ADV": {}
        },
        "PROPN": {
            "INTJ": {}
        },
        "PART": {
            "ADV": {}
        },
        "AUX": {
            "INTJ": {},
            "ADV": {}
        },
        "ADV": {
            "INTJ": {}
        },
        "ADP": {
            "INTJ": {}
        }
    },
    "det": {
        "VERB": {
            "DET": {}
        },
        "PROPN": {
            "DET": {}
        },
        "PRON": {
            "PROPN": {}
        },
        "NOUN": {
            "SCONJ": {},
            "NOUN": {},
            "DET": {},
            "ADJ": {}
        },
        "AUX": {
            "DET": {}
        }
    },
    "dep:appos": {
        "PROPN": {
            "PROPN": {}
        },
        "NUM": {
            "PROPN": {}
        }
    },
    "dep": {
        "VERB": {
            "PRON": {},
            "ADP": {},
            "ADJ": {}
        },
        "SCONJ": {
            "AUX": {}
        },
        "PROPN": {
            "SCONJ": {},
            "PROPN": {},
            "PRON": {
                "P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20": {
                    "sentence": "# # we Naija rapper Eva Eva Allordiah // // //",
                    "conlls": {
                        "gael.guibon": "# user_id = Marine\n# elan_id = P_WAZK_07_42 P_WAZK_07_43\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20\n# sent_translation = # our Nigerians rapper, Eva Alocha,\n# text = # we Naija rapper Eva Allordiah //\n# timestamp = 1573131380.750532\n1\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n2\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n3\twe\t_\tPRON\t_\tCase=Nom|endali=170010|Number=Plur|Person=1|PronType=Prs|startali=169837\t4\tdep\t_\t_\n4\tNaija\t_\tPROPN\t_\tendali=170438|startali=170010\t5\tdep\t_\t_\n5\trapper\t_\tNOUN\t_\tendali=170870|startali=170438\t0\troot\t_\t_\n6\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n7\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n8\tAllordiah\t_\tPROPN\t_\tendali=171770|startali=171290\t6\tflat:caus\t_\t_\n9\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct\t_\t_\n10\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct:caus\t_\t_\n11\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t10\tvocative\t_\t_\n"
                    },
                    "matches": {
                        "gael.guibon": {
                            "edges": {
                                "e": {
                                    "source": "4",
                                    "label": "dep",
                                    "target": "3"
                                }
                            },
                            "nodes": {
                                "GOV": "4",
                                "DEP": "3"
                            }
                        }
                    }
                }
            },
            "DET": {},
            "ADP": {},
            "ADJ": {}
        },
        "PRON": {
            "VERB": {},
            "SCONJ": {},
            "PROPN": {},
            "AUX": {},
            "ADP": {}
        },
        "NUM": {
            "NUM": {},
            "NOUN": {}
        },
        "NOUN": {
            "XX": {},
            "VERB": {},
            "SCONJ": {},
            "PROPN": {
                "P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20": {
                    "sentence": "# # we Naija rapper Eva Eva Allordiah // // //",
                    "conlls": {
                        "gael.guibon": "# user_id = Marine\n# elan_id = P_WAZK_07_42 P_WAZK_07_43\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20\n# sent_translation = # our Nigerians rapper, Eva Alocha,\n# text = # we Naija rapper Eva Allordiah //\n# timestamp = 1573131380.750532\n1\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n2\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n3\twe\t_\tPRON\t_\tCase=Nom|endali=170010|Number=Plur|Person=1|PronType=Prs|startali=169837\t4\tdep\t_\t_\n4\tNaija\t_\tPROPN\t_\tendali=170438|startali=170010\t5\tdep\t_\t_\n5\trapper\t_\tNOUN\t_\tendali=170870|startali=170438\t0\troot\t_\t_\n6\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n7\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n8\tAllordiah\t_\tPROPN\t_\tendali=171770|startali=171290\t6\tflat:caus\t_\t_\n9\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct\t_\t_\n10\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct:caus\t_\t_\n11\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t10\tvocative\t_\t_\n"
                    },
                    "matches": {
                        "gael.guibon": {
                            "edges": {
                                "e": {
                                    "source": "5",
                                    "label": "dep",
                                    "target": "4"
                                }
                            },
                            "nodes": {
                                "GOV": "5",
                                "DEP": "4"
                            }
                        }
                    }
                }
            },
            "PRON": {},
            "NUM": {},
            "NOUN": {},
            "DET": {},
            "AUX": {},
            "ADV": {},
            "ADP": {},
            "ADJ": {}
        },
        "ADV": {
            "VERB": {},
            "AUX": {},
            "ADV": {},
            "ADP": {}
        },
        "ADP": {
            "ADP": {}
        },
        "ADJ": {
            "SCONJ": {},
            "ADP": {}
        }
    },
    "conj:dicto": {
        "XX": {
            "PROPN": {},
            "NOUN": {}
        },
        "SCONJ": {
            "SCONJ": {}
        },
        "PUNCT": {
            "SCONJ": {}
        },
        "PROPN": {
            "VERB": {},
            "PROPN": {}
        },
        "PART": {
            "PART": {}
        },
        "NOUN": {
            "XX": {}
        },
        "DET": {
            "DET": {},
            "CCONJ": {}
        },
        "AUX": {
            "VERB": {},
            "AUX": {}
        },
        "ADP": {
            "ADP": {}
        }
    },
    "conj:coord": {
        "VERB": {
            "VERB": {},
            "NOUN": {},
            "AUX": {}
        },
        "SCONJ": {
            "SCONJ": {}
        },
        "PROPN": {
            "PROPN": {}
        },
        "PART": {
            "PART": {}
        },
        "NUM": {
            "NUM": {},
            "NOUN": {}
        },
        "NOUN": {
            "VERB": {},
            "PROPN": {},
            "NUM": {},
            "NOUN": {},
            "ADP": {}
        },
        "AUX": {
            "VERB": {},
            "AUX": {}
        },
        "ADP": {
            "SCONJ": {},
            "AUX": {},
            "ADP": {}
        },
        "ADJ": {
            "ADJ": {}
        },
        "_none_": {
            "AUX": {}
        }
    },
    "conj:appos": {
        "VERB": {
            "PROPN": {}
        },
        "PROPN": {
            "PROPN": {}
        },
        "NUM": {
            "PROPN": {}
        },
        "NOUN": {
            "PROPN": {},
            "NOUN": {}
        },
        "ADJ": {
            "PROPN": {}
        }
    },
    "compound:svc": {
        "VERB": {
            "VERB": {},
            "SCONJ": {},
            "AUX": {},
            "ADJ": {}
        },
        "AUX": {
            "VERB": {}
        }
    },
    "compound:redup": {
        "NOUN": {
            "NOUN": {},
            "ADV": {}
        },
        "ADV": {
            "ADV": {}
        },
        "ADJ": {
            "ADJ": {}
        }
    },
    "compound:prt": {
        "VERB": {
            "ADP": {}
        }
    },
    "compound": {
        "PROPN": {
            "PROPN": {}
        },
        "NUM": {
            "NUM": {},
            "NOUN": {}
        },
        "NOUN": {
            "NOUN": {},
            "ADJ": {}
        }
    },
    "comp:quasi": {
        "VERB": {
            "NOUN": {},
            "ADP": {}
        },
        "AUX": {
            "VERB": {},
            "NOUN": {},
            "ADP": {}
        }
    },
    "comp:pred": {
        "VERB": {
            "VERB": {},
            "SCONJ": {},
            "PROPN": {},
            "PRON": {},
            "NOUN": {},
            "AUX": {},
            "ADP": {},
            "ADJ": {}
        },
        "PART": {
            "SCONJ": {},
            "PROPN": {},
            "PRON": {},
            "NOUN": {},
            "ADV": {},
            "ADP": {}
        },
        "NOUN": {
            "PROPN": {
                "P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20": {
                    "sentence": "# # we Naija rapper Eva Eva Allordiah // // //",
                    "conlls": {
                        "gael.guibon": "# user_id = Marine\n# elan_id = P_WAZK_07_42 P_WAZK_07_43\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20\n# sent_translation = # our Nigerians rapper, Eva Alocha,\n# text = # we Naija rapper Eva Allordiah //\n# timestamp = 1573131380.750532\n1\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n2\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n3\twe\t_\tPRON\t_\tCase=Nom|endali=170010|Number=Plur|Person=1|PronType=Prs|startali=169837\t4\tdep\t_\t_\n4\tNaija\t_\tPROPN\t_\tendali=170438|startali=170010\t5\tdep\t_\t_\n5\trapper\t_\tNOUN\t_\tendali=170870|startali=170438\t0\troot\t_\t_\n6\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n7\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n8\tAllordiah\t_\tPROPN\t_\tendali=171770|startali=171290\t6\tflat:caus\t_\t_\n9\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct\t_\t_\n10\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct:caus\t_\t_\n11\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t10\tvocative\t_\t_\n",
                        "user_id": "# user_id = Marine\n# elan_id = P_WAZK_07_42 P_WAZK_07_43\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_20\n# sent_translation = # our Nigerians rapper, Eva Alocha,\n# text = # we Naija rapper Eva Allordiah //\n# timestamp = 1573131380.750532\n1\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n2\t#\t_\tPUNCT\t_\tendali=169837|startali=169672\t6\tpunct\t_\t_\n3\twe\t_\tPRON\t_\tCase=Nom|endali=170010|Number=Plur|Person=1|PronType=Prs|startali=169837\t4\tdep\t_\t_\n4\tNaija\t_\tPROPN\t_\tendali=170438|startali=170010\t5\tdep\t_\t_\n5\trapper\t_\tNOUN\t_\tendali=170870|startali=170438\t0\troot\t_\t_\n6\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n7\tEva\t_\tPROPN\t_\tendali=171290|startali=170900\t5\tcomp:pred\t_\t_\n8\tAllordiah\t_\tPROPN\t_\tendali=171770|startali=171290\t6\tflat:caus\t_\t_\n9\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct\t_\t_\n10\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t5\tpunct:caus\t_\t_\n11\t//\t_\tPUNCT\t_\tendali=171800|startali=171770\t10\tvocative\t_\t_\n"
                    },
                    "matches": {
                        "gael.guibon": {
                            "edges": {
                                "e": {
                                    "source": "5",
                                    "label": "comp:pred",
                                    "target": "6"
                                }
                            },
                            "nodes": {
                                "GOV": "5",
                                "DEP": "6"
                            }
                        },
                        "user_id": {
                            "edges": {
                                "e": {
                                    "source": "5",
                                    "label": "comp:pred",
                                    "target": "7"
                                }
                            },
                            "nodes": {
                                "GOV": "5",
                                "DEP": "7"
                            }
                        }
                    }
                }
            },
            "ADP": {}
        },
        "AUX": {
            "VERB": {},
            "PROPN": {},
            "PRON": {},
            "NOUN": {},
            "ADP": {},
            "ADJ": {}
        },
        "ADP": {
            "ADP": {}
        },
        "ADJ": {
            "ADP": {}
        },
        "_none_": {
            "PROPN": {}
        }
    },
    "comp:pass": {
        "VERB": {
            "ADP": {}
        }
    },
    "comp:obl": {
        "VERB": {
            "NOUN": {},
            "ADP": {}
        },
        "NOUN": {
            "ADP": {}
        },
        "ADP": {
            "ADP": {}
        },
        "ADJ": {
            "ADP": {}
        }
    },
    "comp:obj": {
        "VERB": {
            "VERB": {},
            "SCONJ": {},
            "PROPN": {},
            "PRON": {},
            "NOUN": {},
            "ADV": {}
        },
        "NOUN": {
            "PRON": {},
            "NOUN": {}
        },
        "ADV": {
            "SCONJ": {}
        },
        "ADP": {
            "NOUN": {}
        },
        "ADJ": {
            "PRON": {}
        }
    },
    "comp:cleft": {
        "VERB": {
            "VERB": {}
        },
        "PRON": {
            "VERB": {},
            "AUX": {}
        },
        "PART": {
            "VERB": {},
            "PART": {},
            "ADV": {}
        },
        "ADV": {
            "VERB": {},
            "AUX": {}
        },
        "_none_": {
            "PRON": {},
            "NOUN": {
                "P_WAZK_07_As-e-dey-Hot-News-Read_PRO_19": {
                    "sentence": "# for jolijoli //",
                    "conlls": {
                        "gael.guibon": "# user_id = Marine\n# elan_id = P_WAZK_07_40 P_WAZK_07_41\n# sent_id = P_WAZK_07_As-e-dey-Hot-News-Read_PRO_19\n# sent_translation = # For Jolly jolly,\n# text = # for jolijoli //\n# timestamp = 1573131380.750527\n1\t#\t_\tPUNCT\t_\tendali=168740|startali=167560\t0\tpunct:caus\t_\t_\n2\tfor\t_\tADP\t_\tendali=168990|startali=168740\t4\tpunct:appos\t_\t_\n3\tjolijoli\t_\tNOUN\t_\tendali=169642|startali=168990\t0\tcomp:cleft\t_\t_\n4\t//\t_\tPART\t_\tendali=169672|startali=169642\t2\tpunct\t_\t_\n"
                    },
                    "matches": {
                        "gael.guibon": {
                            "edges": {
                                "e": {
                                    "source": "ROOT",
                                    "label": "comp:cleft",
                                    "target": "3"
                                }
                            },
                            "nodes": {
                                "GOV": "ROOT",
                                "DEP": "3"
                            }
                        }
                    }
                }
            }
        }
    },
    "comp:aux": {
        "X": {
            "X": {}
        },
        "VERB": {
            "VERB": {},
            "ADJ": {}
        },
        "AUX": {
            "VERB": {},
            "NOUN": {},
            "AUX": {},
            "ADV": {},
            "ADJ": {}
        },
        "ADP": {
            "VERB": {}
        }
    },
    "comp": {
        "VERB": {
            "PROPN": {},
            "NOUN": {},
            "AUX": {}
        },
        "SCONJ": {
            "X": {},
            "VERB": {},
            "PRON": {},
            "PART": {},
            "NOUN": {},
            "AUX": {},
            "ADP": {},
            "ADJ": {}
        },
        "PRON": {
            "VERB": {},
            "AUX": {}
        },
        "DET": {
            "AUX": {}
        },
        "ADV": {
            "VERB": {},
            "AUX": {}
        },
        "ADP": {
            "X": {},
            "VERB": {},
            "PROPN": {},
            "PRON": {},
            "NUM": {},
            "NOUN": {},
            "AUX": {},
            "ADV": {},
            "ADP": {},
            "ADJ": {}
        }
    },
    "cc": {
        "VERB": {
            "SCONJ": {},
            "CCONJ": {}
        },
        "PROPN": {
            "CCONJ": {},
            "ADV": {}
        },
        "PRON": {
            "CCONJ": {}
        },
        "PART": {
            "CCONJ": {}
        },
        "NOUN": {
            "CCONJ": {}
        },
        "AUX": {
            "SCONJ": {},
            "DET": {},
            "CCONJ": {}
        },
        "ADV": {
            "DET": {},
            "CCONJ": {}
        },
        "ADP": {
            "CCONJ": {}
        },
        "ADJ": {
            "CCONJ": {}
        }
    },
    "E:subj": {
        "AUX": {
            "PRON": {}
        }
    },
    "E:punct": {
        "PROPN": {
            "PUNCT": {}
        }
    },
    "E:flat": {
        "PROPN": {
            "PROPN": {}
        }
    },
    "E:comp:aux": {
        "AUX": {
            "VERB": {}
        }
    }
};
    }
}
</script>
