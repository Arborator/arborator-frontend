<template>
    <q-page>
        <div class="q-pa-md row q-gutter-md flex flex-center">
            
            <div v-for="sample in samples" :key="sample[Object.keys(sample)[0]]" :props="sample" :id="sample[Object.keys(sample)[0]]" >
                <q-card  style="max-width:90vw">
                    <q-card-section >
                        <conll-graph :sample="sample"></conll-graph>
                        <!-- <div id='youhou'></div> -->
                        <!-- <conll-graph :props="sample"></conll-graph> -->
                        <!-- {{Object.keys(sample)[0]}} -->
                        <!-- <conll>{{sample.gold}}</conll> -->
                        <!-- <q-tabs v-model="tab" class="text-teal" >
                            <q-tab v-for="user in Object.keys(sample)" :key="user" :props="user" :label="user" :name="user" icon="person" />
                        </q-tabs>
                        <q-separator />

                        <q-tab-panels v-model="tab" animated>
                            <q-tab-panel v-for="user in Object.keys(sample)" :key="user" :props="user" :name="user">
                                {{sample.user}}
                            </q-tab-panel>
                        </q-tab-panels> -->
                        <!-- <div class="q-pa-md">
    <div class="q-gutter-y-md" style="max-width: 600px">
                        <q-tabs v-model="tab" dense class="bg-grey-2 text-teal" >
                            <q-tab dense name="mail" />
                        </q-tabs>
    </div>
                        </div> -->
                    </q-card-section>
                </q-card>
                <q-separator/>
            </div>
        </div>
    </q-page>
</template>

<script>

import Vue from 'vue'
Vue.config.ignoredElements = ['conll'];
import ConllGraph from '../components/ConllGraph'

export default {
    name: 'sample',
    components: {
        ConllGraph
    },
    data(){
        return {
            svg: '',
            tab: 'gold',
            test:                     "1\tDonc\tdonc\tADV\t_\t_\t4\tmod:periph\t_\t_\n2\teuh\teuh\tINTJ\t_\t_\t4\tdiscourse\t_\t_\n3\tj'\tje\tPRON\t_\t_\t4\tsubj\t_\t_\n4\tai\tavoir\tAUX\t_\t_\t0\troot\t_\t_\n5\tfait\tfaire\tVERB\t_\t_\t4\tcomp:aux\t_\t_\n6\tla\tle\tDET\t_\t_\t7\tdet\t_\t_\n7\tconduite\tconduite\tNOUN\t_\t_\t5\tcomp:obj\t_\t_\n8\taccompagnée\taccompagner\tVERB\t_\t_\t7\tdep\t_\t_\n9\tau\tà+le\tADP\t_\t_\t5\tmod\t_\t_\n10\tlycée\tlycée\tNOUN\t_\t_\t9\tcomp\t_\t_\n11\t.\t_\tPUNCT\t_\t_\t4\tpunct\t_\t_\n"
,
            samples: {
                "1568208961.080147-315190_00001": {
                "gold":
                    "1\tAlors\talors\tADV\t_\t_\t4\tmod\t_\t_\n2\teuh\teuh\tINTJ\t_\t_\t4\tdiscourse\t_\t_\n3\tj'\tje\tPRON\t_\t_\t4\tsubj\t_\t_\n4\tai\tavoir\tAUX\t_\t_\t0\troot\t_\t_\n5\tdécidé\tdécider\tVERB\t_\t_\t4\tcomp:aux\t_\t_\n6\tde\tde\tADP\t_\t_\t5\tcomp:pred\t_\t_\n7\traconter\traconter\tVERB\t_\t_\t6\tcomp\t_\t_\n8\tmes\tson\tDET\t_\t_\t9\tdet\t_\t_\n9\tpéripéties\tpéripétie\tNOUN\t_\t_\t7\tcomp:obj\t_\t_\n10\ten\ten\tADP\t_\t_\t9\tdep\t_\t_\n11\tvoiture\tvoiture\tNOUN\t_\t_\t10\tcomp\t_\t_\n12\t.\t_\tPUNCT\t_\t_\t4\tpunct\t_\t_\n"
                },
                "1568208961.080147-315190_00002": {
                "gold":
                    "1\tDonc\tdonc\tADV\t_\t_\t4\tmod:periph\t_\t_\n2\teuh\teuh\tINTJ\t_\t_\t4\tdiscourse\t_\t_\n3\tj'\tje\tPRON\t_\t_\t4\tsubj\t_\t_\n4\tai\tavoir\tAUX\t_\t_\t0\troot\t_\t_\n5\tfait\tfaire\tVERB\t_\t_\t4\tcomp:aux\t_\t_\n6\tla\tle\tDET\t_\t_\t7\tdet\t_\t_\n7\tconduite\tconduite\tNOUN\t_\t_\t5\tcomp:obj\t_\t_\n8\taccompagnée\taccompagner\tVERB\t_\t_\t7\tdep\t_\t_\n9\tau\tà+le\tADP\t_\t_\t5\tmod\t_\t_\n10\tlycée\tlycée\tNOUN\t_\t_\t9\tcomp\t_\t_\n11\t.\t_\tPUNCT\t_\t_\t4\tpunct\t_\t_\n"
                },
                "1568208961.080147-315190_00003": {
                "gold":
                    "1\tDonc\tdonc\tADV\t_\t_\t5\tdiscourse\t_\t_\n2\tavant\tavant\tSCONJ\t_\t_\t5\tmod\t_\t_\n3\tça\tça\tPRON\t_\t_\t2\tcomp\t_\t_\n4\til\til\tPART\t_\t_\t5\tsubj\t_\t_\n5\tfallait\tfalloir\tVERB\t_\t_\t32\tconj:coord\t_\t_\n6\tque\tque\tSCONJ\t_\t_\t5\tcomp:obj\t_\t_\n7\tje\tje\tPRON\t_\t_\t8\tsubj\t_\t_\n8\tpasse\tpasser\tVERB\t_\t_\t6\tcomp\t_\t_\n9\tle\tle\tDET\t_\t_\t10\tdet\t_\t_\n10\tcode\tcode\tNOUN\t_\t_\t8\tcomp:obj\t_\t_\n11\tet\tet\tCCONJ\t_\t_\t12\tcc\t_\t_\n12\ttout\ttout\tPRON\t_\t_\t8\tdiscourse\t_\t_\n13\t,\t_\tPUNCT\t_\t_\t5\tpunct\t_\t_\n14\tet\tet\tCCONJ\t_\t_\t32\tcc\t_\t_\n15\tdonc\tdonc\tADV\t_\t_\t32\tmod\t_\t_\n16\teuh\teuh\tINTJ\t_\t_\t15\tdiscourse\t_\t_\n17\taprès\taprès\tSCONJ\t_\t_\t32\tmod\t_\t_\n18\tj'\tje\tPRON\t_\t_\t19\tsubj\t_\t_\n19\tai\tavoir\tAUX\t_\t_\t_\t_\t_\t_\n20\t,\t_\tPUNCT\t_\t_\t19\tpunct\t_\t_\n21\tune\tun\tDET\t_\t_\t22\tdet\t_\t_\n22\tfois\tfois\tNOUN\t_\t_\t25\tmod\t_\t_\n23\tque\tque\tSCONJ\t_\t_\t22\tdep\t_\t_\n24\tj'\tje\tPRON\t_\t_\t25\tsubj\t_\t_\n25\tai\tavoir\tAUX\t_\t_\t32\tmod\t_\t_\n26\teu\tavoir\tVERB\t_\t_\t25\tcomp:aux\t_\t_\n27\tmon\tson\tPRON\t_\t_\t28\tdet\t_\t_\n28\tcode\tcode\tNOUN\t_\t_\t26\tcomp:obj\t_\t_\n29\t,\t_\tPUNCT\t_\t_\t32\tpunct\t_\t_\n30\ton\ton\tPRON\t_\t_\t32\tsubj\t_\t_\n31\tm'\tme\tPRON\t_\t_\t33\tcomp:obl\t_\t_\n32\ta\tavoir\tAUX\t_\t_\t19\tconj:dicto\t_\t_\n33\tdonné\tdonner\tVERB\t_\t_\t32\tcomp:aux\t_\t_\n34\tdes\tde+le\tDET\t_\t_\t35\tdet\t_\t_\n35\tleçons\tleçon\tNOUN\t_\t_\t33\tcomp:obj\t_\t_\n36\tde\tde\tADP\t_\t_\t35\tdep\t_\t_\n37\tconduite\tconduite\tNOUN\t_\t_\t36\tcomp\t_\t_\n38\t.\t_\tPUNCT\t_\t_\t5\tpunct\t_\t_\n"
                },
                "1568208961.080147-315190_00004": {
                "gold":
                    "1\tAprès\taprès\tADP\t_\t_\t9\tmod\t_\t_\n2\tces\tce\tPRON\t_\t_\t3\tdet\t_\t_\n3\tleçons\tleçon\tNOUN\t_\t_\t1\tcomp\t_\t_\n4\tde\tde\tADP\t_\t_\t3\tdep\t_\t_\n5\tconduite\tconduite\tNOUN\t_\t_\t4\tcomp\t_\t_\n6\teuh\teuh\tINTJ\t_\t_\t5\tdiscourse\t_\t_\n7\t,\t_\tPUNCT\t_\t_\t9\tpunct\t_\t_\n8\tj'\tje\tPRON\t_\t_\t9\tsubj\t_\t_\n9\tai\tavoir\tAUX\t_\t_\t0\troot\t_\t_\n10\tpu\tpouvoir\tVERB\t_\t_\t9\tcomp:aux\t_\t_\n11\tme\tme\tPRON\t_\t_\t12\tcomp:obj\t_\t_\n12\tlancer\tlancer\tVERB\t_\t_\t9\tcomp:pred\t_\t_\n13\tdans\tdans\tADP\t_\t_\t12\tcomp:obl\t_\t_\n14\tla\tle\tDET\t_\t_\t15\tdet\t_\t_\n15\tconduite\tconduite\tNOUN\t_\t_\t13\tcomp\t_\t_\n16\taccompagnée\taccompagner\tADJ\t_\t_\t15\tdep\t_\t_\n17\tavec\tavec\tADP\t_\t_\t12\tmod\t_\t_\n18\tma\tson\tPRON\t_\t_\t19\tdet\t_\t_\n19\tmère\tmère\tNOUN\t_\t_\t17\tcomp\t_\t_\n20\t,\t_\tPROPN\t_\t_\t23\tpunct\t_\t_\n21\tet\tet\tPUNCT\t_\t_\t23\tcc\t_\t_\n22\tj'\tje\tPRON\t_\t_\t23\tsubj\t_\t_\n23\tavais\tavoir\tAUX\t_\t_\t9\tconj:coord\t_\t_\n24\tdonc\tdonc\tADV\t_\t_\t23\tmod\t_\t_\n25\teuh\teuh\tINTJ\t_\t_\t23\tdiscourse\t_\t_\n26\ttrois\ttrois\tNUM\t_\t_\t28\tdet\t_\t_\n27\tmilles\tmille\tNOUN\t_\t_\t26\tdep\t_\t_\n28\tkilomètres\tkilomètre\tNOUN\t_\t_\t30\tcomp:obj\t_\t_\n29\tà\tà\tADP\t_\t_\t23\tcomp:pred\t_\t_\n30\tfaire\tfaire\tVERB\t_\t_\t29\tcomp\t_\t_\n31\t,\t_\tPUNCT\t_\t_\t33\tpunct\t_\t_\n32\tje\tje\tPRON\t_\t_\t33\tsubj\t_\t_\n33\tcrois\tcroire\tVERB\t_\t_\t36\tparataxis:parenth\t_\t_\n34\t,\t_\tPUNCT\t_\t_\t36\tpunct\t_\t_\n35\tje\tje\tPRON\t_\t_\t36\tsubj\t_\t_\n36\tsuis\têtre\tVERB\t_\t_\t_\t_\t_\t_\n37\tplus\tplus\tADV\t_\t_\t36\tmod\t_\t_\n38\ttrès\ttrès\tADV\t_\t_\t39\tmod\t_\t_\n39\tsûr\tsûr\tADJ\t_\t_\t36\tcomp:pred\t_\t_\n40\t.\t_\tPUNCT\t_\t_\t_\t_\t_\t_\n"
                },
                "1568208961.080147-315190_00005": {
                "gold":
                    "1\tDonc\tdonc\tADV\t_\t_\t_\t_\t_\t_\n2\tc'\tce\tPRON\t_\t_\t3\tsubj\t_\t_\n3\tétait\têtre\tVERB\t_\t_\t0\troot\t_\t_\n4\tsur\tsur\tADP\t_\t_\t3\tcomp:pred\t_\t_\n5\tun\tun\tNUM\t_\t_\t6\tdet\t_\t_\n6\tan\tan\tNOUN\t_\t_\t4\tcomp\t_\t_\n7\tje\tje\tPRON\t_\t_\t8\tsubj\t_\t_\n8\tdevais\tdevoir\tVERB\t_\t_\t3\tconj:coord\t_\t_\n9\tfaire\tfaire\tVERB\t_\t_\t8\tcomp:pred\t_\t_\n10\tla\tle\tDET\t_\t_\t11\tdet\t_\t_\n11\tconduite\tconduite\tNOUN\t_\t_\t9\tcomp:obj\t_\t_\n12\taccompagnée\taccompagner\tVERB\t_\t_\t11\tdep\t_\t_\n13\t.\t_\tPUNCT\t_\t_\t3\tpunct\t_\t_\n"
                },
                "1568208961.080147-315190_00006": {
                "gold":
                    "1\tEuh\teuh\tINTJ\t_\t_\t6\tdiscourse\t_\t_\n2\tma\tson\tPRON\t_\t_\t3\tdet\t_\t_\n3\tmère\tmère\tNOUN\t_\t_\t6\tdislocated\t_\t_\n4\telle\til\tPRON\t_\t_\t6\tsubj\t_\t_\n5\tm'\tme\tPRON\t_\t_\t6\tcomp:obj\t_\t_\n6\ta\tavoir\tAUX\t_\t_\t0\troot\t_\t_\n7\tbeaucoup\tbeaucoup\tADV\t_\t_\t6\tmod\t_\t_\n8\taidé\taider\tVERB\t_\t_\t6\tcomp:aux\t_\t_\n9\tparce\tparce\tSCONJ\t_\t_\t6\tmod\t_\t_\n10\tque\tque\tSCONJ\t_\t_\t9\tfixed\t_\t_\n11\tc'\tce\tPRON\t_\t_\t12\tsubj\t_\t_\n12\test\têtre\tVERB\t_\t_\t10\tcomp\t_\t_\n13\tune\tun\tDET\t_\t_\t15\tdet\t_\t_\n14\tbonne\tbon\tADJ\t_\t_\t15\tdep\t_\t_\n15\tconductrice\tconducteur\tNOUN\t_\t_\t12\tcomp:obj\t_\t_\n16\t,\t_\tPUNCT\t_\t_\t6\tpunct\t_\t_\n17\tet\tet\tCCONJ\t_\t_\t20\tcc\t_\t_\n18\teuh\teuh\tINTJ\t_\t_\t20\tdiscourse\t_\t_\n19\tj'\tje\tPRON\t_\t_\t20\tsubj\t_\t_\n20\tai\tavoir\tAUX\t_\t_\t6\tconj:coord\t_\t_\n21\tfait\tfaire\tVERB\t_\t_\t20\tcomp:aux\t_\t_\n22\tvraiment\tvraiment\tADV\t_\t_\t21\tmod\t_\t_\n23\tbeaucoup\tbeaucoup\tADV\t_\t_\t25\tmod\t_\t_\n24\tde\tde\tADP\t_\t_\t23\tcomp\t_\t_\n25\tchoses\tchose\tNOUN\t_\t_\t21\tcomp:obj\t_\t_\n26\t,\t_\tPUNCT\t_\t_\t30\tpunct\t_\t_\n27\tXX\txx\tX\t_\t_\t_\t_\t_\t_\n28\tde\tde\tADP\t_\t_\t25\tconj:appos\t_\t_\n29\tla\tle\tDET\t_\t_\t30\tdet\t_\t_\n30\tville\tville\tNOUN\t_\t_\t28\tcomp\t_\t_\n31\t,\t_\tPUNCT\t_\t_\t34\tpunct\t_\t_\n32\tde\tde\tADP\t_\t_\t25\tconj:appos\t_\t_\n33\tla\tle\tDET\t_\t_\t34\tdet\t_\t_\n34\troute\troute\tNOUN\t_\t_\t32\tcomp\t_\t_\n35\t,\t_\tPUNCT\t_\t_\t38\tpunct\t_\t_\n36\teuh\teuh\tINTJ\t_\t_\t38\tdiscourse\t_\t_\n37\ton\ton\tPRON\t_\t_\t38\tsubj\t_\t_\n38\ta\tavoir\tAUX\t_\t_\t20\tconj:coord\t_\t_\n39\tfait\tfaire\tVERB\t_\t_\t38\tcomp:aux\t_\t_\n40\tbeaucoup\tbeaucoup\tADV\t_\t_\t42\tmod\t_\t_\n41\tde\tde\tADP\t_\t_\t40\tcomp\t_\t_\n42\ttrajets\ttrajet\tNOUN\t_\t_\t39\tcomp:obj\t_\t_\n43\t,\t_\tPUNCT\t_\t_\t45\tpunct\t_\t_\n44\ton\ton\tPRON\t_\t_\t45\tsubj\t_\t_\n45\test\têtre\tAUX\t_\t_\t38\tconj:appos\t_\t_\n46\tparties\tparty\tVERB\t_\t_\t45\tcomp:aux\t_\t_\n47\ten\ten\tADP\t_\t_\t46\tcomp:obl\t_\t_\n48\tvacances\tvacance\tNOUN\t_\t_\t47\tcomp\t_\t_\n49\t,\t_\tPUNCT\t_\t_\t51\tpunct\t_\t_\n50\ton\ton\tPRON\t_\t_\t51\tsubj\t_\t_\n51\test\têtre\tAUX\t_\t_\t45\tconj:appos\t_\t_\n52\tallées\taller\tVERB\t_\t_\t51\tcomp:aux\t_\t_\n53\tchez\tchez\tADP\t_\t_\t52\tcomp:obl\t_\t_\n54\tmes\tson\tDET\t_\t_\t55\tdet\t_\t_\n55\ttantes\ttant\tNOUN\t_\t_\t53\tcomp\t_\t_\n56\tqui\tqui\tPRON\t_\t_\t57\tsubj\t_\t_\n57\thabitent\thabiter\tVERB\t_\t_\t55\tdep\t_\t_\n58\teuh\teuh\tINTJ\t_\t_\t57\tdiscourse\t_\t_\n59\tsur\tsur\tADP\t_\t_\t57\tcomp:obl\t_\t_\n60\tparis\tParis\tPROPN\t_\t_\t59\tcomp\t_\t_\n61\t.\t_\tPUNCT\t_\t_\t_\t_\t_\t_\n"
                },
                "1568208961.080147-315190_00007": {
                "gold":
                    "1\tDonc\tdonc\tADV\t_\t_\t4\tmod\t_\t_\n2\teuh\teuh\tINTJ\t_\t_\t4\tdiscourse\t_\t_\n3\til\til\tPRON\t_\t_\t4\tsubj\t_\t_\n4\tfallait\tfalloir\tVERB\t_\t_\t0\troot\t_\t_\n5\tpasser\tpasser\tVERB\t_\t_\t4\tcomp:pred\t_\t_\n6\tpar\tpar\tADP\t_\t_\t5\tcomp:obl\t_\t_\n7\tle\tle\tDET\t_\t_\t8\tdet\t_\t_\n8\tpériphe\tpériphe\tNOUN\t_\t_\t6\tcomp\t_\t_\n9\teuh\teuh\tINTJ\t_\t_\t4\tdiscourse\t_\t_\n10\t,\t_\tPUNCT\t_\t_\t4\tpunct\t_\t_\n11\tXX\txx\tX\t_\t_\t_\t_\t_\t_\n12\tj'\tje\tPRON\t_\t_\t13\tsubj\t_\t_\n13\tai\tavoir\tAUX\t_\t_\t4\tconj:coord\t_\t_\n14\tvraiment\tvraiment\tADV\t_\t_\t13\tmod\t_\t_\n15\teu\tavoir\tINTJ\t_\t_\t13\tcomp:aux\t_\t_\n16\tdes\tde+le\tPART\t_\t_\t18\tdet\t_\t_\n17\tbonnes\tbon\tADJ\t_\t_\t18\tdep\t_\t_\n18\texpériences\texpérience\tNOUN\t_\t_\t15\tcomp:obj\t_\t_\n19\tpour\tpour\tADP\t_\t_\t13\tcomp:pred\t_\t_\n20\teuh\teuh\tINTJ\t_\t_\t22\tdiscourse\t_\t_\n21\tm'\tme\tPRON\t_\t_\t22\tcomp:obj\t_\t_\n22\taider\taider\tVERB\t_\t_\t19\tcomp\t_\t_\n23\tà\tà\tADP\t_\t_\t22\tcomp:pred\t_\t_\n24\tapprendre\tapprendre\tVERB\t_\t_\t23\tcomp\t_\t_\n25\tà\tà\tADP\t_\t_\t24\tcomp:pred\t_\t_\n26\tconduire\tconduire\tVERB\t_\t_\t25\tcomp\t_\t_\n27\t,\t_\tPUNCT\t_\t_\t_\t_\t_\t_\n28\tparce\tparce\tSCONJ\t_\t_\t13\tmod\t_\t_\n29\tque\tque\tSCONJ\t_\t_\t28\tfixed\t_\t_\n30\ton\ton\tPRON\t_\t_\t31\tsubj\t_\t_\n31\tapprend\tapprendre\tVERB\t_\t_\t29\tcomp\t_\t_\n32\tavec\tavec\tADP\t_\t_\t31\tcomp:obl\t_\t_\n33\tl'\tle\tDET\t_\t_\t34\tdet\t_\t_\n34\texpérience\texpérience\tNOUN\t_\t_\t32\tcomp\t_\t_\n35\t.\t_\tPUNCT\t_\t_\t_\t_\t_\t_\n"
                },
                "1568208961.080147-315190_00008": {
                "gold":
                    "1\tDonc\tdonc\tADV\t_\t_\t2\tdiscourse\t_\t_\n2\tvoilà\tvoilà\tADP\t_\t_\t0\troot\t_\t_\n3\t.\t_\tPUNCT\t_\t_\t2\tpunct\t_\t_\n"
                },
                "1568208961.080147-315190_00009": {
                "gold":
                    "1\tEuh\teuh\tINTJ\t_\t_\t7\tdiscourse\t_\t_\n2\tpar\tpar\tADP\t_\t_\t24\tmod\t_\t_\n3\tla\tle\tDET\t_\t_\t4\tdet\t_\t_\n4\tsuite\tsuite\tNOUN\t_\t_\t2\tcomp\t_\t_\n5\teuh\teuh\tINTJ\t_\t_\t7\tdiscourse\t_\t_\n6\tj'\tje\tPRON\t_\t_\t7\tsubj\t_\t_\n7\tai\tavoir\tAUX\t_\t_\t24\tconj:dicto\t_\t_\n8\t,\t_\tPUNCT\t_\t_\t_\t_\t_\t_\n9\teuh\teuh\tINTJ\t_\t_\t7\tdiscourse\t_\t_\n10\t,\t_\tPUNCT\t_\t_\t_\t_\t_\t_\n11\teuh\teuh\tINTJ\t_\t_\t7\tdiscourse\t_\t_\n12\tune\tun\tDET\t_\t_\t13\tdet\t_\t_\n13\tfois\tfois\tNOUN\t_\t_\t24\tmod\t_\t_\n14\tque\tque\tSCONJ\t_\t_\t13\tdep\t_\t_\n15\tj'\tje\tPRON\t_\t_\t16\tsubj\t_\t_\n16\tai\tavoir\tAUX\t_\t_\t14\tcomp\t_\t_\n17\teu\tavoir\tVERB\t_\t_\t16\tcomp:aux\t_\t_\n18\tfini\tfinir\tVERB\t_\t_\t17\tcomp:aux\t_\t_\n19\tla\tle\tDET\t_\t_\t20\tdet\t_\t_\n20\tconduite\tconduite\tNOUN\t_\t_\t18\tcomp:obj\t_\t_\n21\taccompagnée\taccompagner\tADJ\t_\t_\t20\tdep\t_\t_\n22\t,\t_\tPUNCT\t_\t_\t24\tpunct\t_\t_\n23\til\til\tPRON\t_\t_\t24\tsubj\t_\t_\n24\ta\tavoir\tAUX\t_\t_\t0\troot\t_\t_\n25\tfallu\tfalloir\tVERB\t_\t_\t24\tcomp:aux\t_\t_\n26\tque\tque\tSCONJ\t_\t_\t25\tcomp:obj\t_\t_\n27\tje\tje\tPRON\t_\t_\t28\tsubj\t_\t_\n28\tpasse\tpasser\tVERB\t_\t_\t26\tcomp\t_\t_\n29\tmon\tson\tPRON\t_\t_\t30\tdet\t_\t_\n30\tpermis\t_\tNOUN\t_\t_\t28\tcomp:obj\t_\t_\n31\tdonc\tdonc\tADV\t_\t_\t28\tmod\t_\t_\n32\t.\t_\tPUNCT\t_\t_\t24\tpunct\t_\t_\n"
                },
                "1568208961.080147-315190_00010": {
                "gold":
                    "1\tMais\tmais\tSCONJ\t_\t_\t7\tcc\t_\t_\n2\tavant\tavant\tADP\t_\t_\t7\tmod\t_\t_\n3\tça\tça\tPRON\t_\t_\t2\tcomp\t_\t_\n4\teuh\teuh\tINTJ\t_\t_\t7\tdiscourse\t_\t_\n5\tils\til\tPRON\t_\t_\t7\tsubj\t_\t_\n6\tm'\tme\tPRON\t_\t_\t8\tcomp:obl\t_\t_\n7\tont\tavoir\tAUX\t_\t_\t0\troot\t_\t_\n8\tredonné\tredonner\tVERB\t_\t_\t7\tcomp:aux\t_\t_\n9\tquelques\tquelque\tDET\t_\t_\t10\tdet\t_\t_\n10\theures\theure\tNOUN\t_\t_\t8\tcomp:obj\t_\t_\n11\tde\tde\tADP\t_\t_\t10\tdep\t_\t_\n12\tconduite\tconduite\tNOUN\t_\t_\t11\tcomp\t_\t_\n13\t,\t_\tPUNCT\t_\t_\t7\tpunct\t_\t_\n14\tpour\tpour\tADP\t_\t_\t7\tmod\t_\t_\n15\tvérifier\tvérifier\tVERB\t_\t_\t14\tcomp\t_\t_\n16\tque\tque\tCCONJ\t_\t_\t15\tcomp:obj\t_\t_\n17\tj'\tje\tPRON\t_\t_\t18\tsubj\t_\t_\n18\tavais\tavoir\tAUX\t_\t_\t16\tcomp\t_\t_\n19\tpas\tpas\tADV\t_\t_\t18\tmod\t_\t_\n20\tperdu\tperdre\tVERB\t_\t_\t18\tcomp:aux\t_\t_\n21\t.\t_\tPUNCT\t_\t_\t7\tpunct\t_\t_\n"
                },
                "1568208961.080147-315190_00011": {
                "gold":
                    "1\tJe\tje\tPRON\t_\t_\t3\tsubj\t_\t_\n2\tme\tme\tPRON\t_\t_\t3\tcomp:obj\t_\t_\n3\tsouviens\tsouvenir\tVERB\t_\t_\t0\troot\t_\t_\n4\tmême\tmême\tADV\t_\t_\t3\tmod\t_\t_\n5\teuh\teuh\tINTJ\t_\t_\t3\tdiscourse\t_\t_\n6\tl'\tle\tDET\t_\t_\t7\tdet\t_\t_\n7\theure\theure\tNOUN\t_\t_\t3\tcomp:obj\t_\t_\n8\tde\tde\tADP\t_\t_\t7\tdep\t_\t_\n9\tconduite\tconduite\tNOUN\t_\t_\t8\tcomp\t_\t_\n10\tque\tque\tSCONJ\t_\t_\t7\tdep\t_\t_\n11\tj'\tje\tPRON\t_\t_\t12\tsubj\t_\t_\n12\tai\tavoir\tAUX\t_\t_\t10\tcomp\t_\t_\n13\teu\tavoir\tVERB\t_\t_\t12\tcomp:aux\t_\t_\n14\tla\tle\tDET\t_\t_\t15\tdet\t_\t_\n15\tveille\tveille\tNOUN\t_\t_\t13\tmod\t_\t_\n16\tde\tde\tADP\t_\t_\t15\tdep\t_\t_\n17\tpasser\tpasser\tVERB\t_\t_\t16\tcomp\t_\t_\n18\tmon\tson\tPRON\t_\t_\t19\tdet\t_\t_\n19\tpermis\t_\tNOUN\t_\t_\t17\tcomp:obj\t_\t_\n20\t,\t_\tPUNCT\t_\t_\t3\tpunct\t_\t_\n21\tje\tje\tPRON\t_\t_\t23\tsubj\t_\t_\n22\tme\tme\tPRON\t_\t_\t23\tcomp:obj\t_\t_\n23\tsuis\têtre\tAUX\t_\t_\t3\tconj:coord\t_\t_\n24\tmise\tmettre\tVERB\t_\t_\t23\tcomp:pass\t_\t_\n25\teuh\teuh\tINTJ\t_\t_\t23\tdiscourse\t_\t_\n26\tsur\tsur\tADP\t_\t_\t24\tcomp:obl\t_\t_\n27\tla\tle\tDET\t_\t_\t28\tdet\t_\t_\n28\tvoie\tvoie\tNOUN\t_\t_\t26\tcomp\t_\t_\n29\tde\tde\tADP\t_\t_\t28\tdep\t_\t_\n30\tgauche\tgauche\tADJ\t_\t_\t29\tcomp\t_\t_\n31\t,\t_\tPUNCT\t_\t_\t23\tpunct\t_\t_\n32\talors\talors\tADV\t_\t_\t23\tmod\t_\t_\n33\tque\tque\tSCONJ\t_\t_\t32\tfixed\t_\t_\n34\tje\tje\tPRON\t_\t_\t35\tsubj\t_\t_\n35\tdevais\tdevoir\tVERB\t_\t_\t33\tcomp\t_\t_\n36\tpas\tpas\tADV\t_\t_\t35\tmod\t_\t_\n37\tdu\tde+le\tADP\t_\t_\t36\tmod\t_\t_\n38\ttout\ttout\tNOUN\t_\t_\t37\tcomp\t_\t_\n39\tme\tme\tPRON\t_\t_\t40\tcomp:obj\t_\t_\n40\tmettre\tmettre\tVERB\t_\t_\t35\tcomp:pred\t_\t_\n41\tsur\tsur\tADP\t_\t_\t40\tcomp:obl\t_\t_\n42\tcette\tce\tPRON\t_\t_\t43\tdet\t_\t_\n43\tvoie\tvoie\tNOUN\t_\t_\t41\tcomp\t_\t_\n44\t.\t_\tPUNCT\t_\t_\t35\tpunct\t_\t_\n"
                },
                "1568208961.080147-315190_00012": {
                "gold":
                    "1\tc'\tce\tPRON\t_\t_\t2\tsubj\t_\t_\n2\test\têtre\tVERB\t_\t_\t0\troot\t_\t_\n3\tparce\tparce\tSCONJ\t_\t_\t2\tmod\t_\t_\n4\tque\tque\tSCONJ\t_\t_\t3\tfixed\t_\t_\n5\tje\tje\tPRON\t_\t_\t6\tsubj\t_\t_\n6\tpensais\tpenser\tVERB\t_\t_\t4\tcomp\t_\t_\n7\tque\tque\tSCONJ\t_\t_\t6\tcomp:obj\t_\t_\n8\tle\tle\tDET\t_\t_\t9\tdet\t_\t_\n9\tstop\tstop\tNOUN\t_\t_\t12\tdislocated\t_\t_\n10\til\til\tPRON\t_\t_\t12\tsubj\t_\t_\n11\ts'\tse\tPRON\t_\t_\t12\tcomp:obj\t_\t_\n12\tétalait\tétaler\tVERB\t_\t_\t7\tcomp\t_\t_\n13\tsur\tsur\tADP\t_\t_\t12\tmod\t_\t_\n14\ttout\ttout\tADV\t_\t_\t15\tmod\t_\t_\n15\tle\tle\tDET\t_\t_\t16\tdet\t_\t_\n16\tlong\tlong\tADJ\t_\t_\t13\tcomp\t_\t_\n17\tde\tde\tADP\t_\t_\t16\tdep\t_\t_\n18\tla\tle\tDET\t_\t_\t19\tdet\t_\t_\n19\troute\troute\tNOUN\t_\t_\t17\tcomp\t_\t_\n20\t,\t_\tPROPN\t_\t_\t12\tpunct\t_\t_\n21\tmais\tmais\tSCONJ\t_\t_\t26\tcc\t_\t_\n22\t,\t_\tPUNCT\t_\t_\t24\tpunct\t_\t_\n23\ten\ten\tPRON\t_\t_\t26\tmod\t_\t_\n24\tfait\tfaire\tVERB\t_\t_\t23\tcomp\t_\t_\n25\t,\t_\tPUNCT\t_\t_\t24\tpunct\t_\t_\n26\tpas\tpas\tADV\t_\t_\t12\tconj:coord\t_\t_\n27\tdu\tde+le\tPART\t_\t_\t26\tmod\t_\t_\n28\ttout\ttout\tNOUN\t_\t_\t27\tcomp\t_\t_\n29\t.\t_\tPUNCT\t_\t_\t2\tpunct\t_\t_\n"
                }
            }
        }
    },
    mounted(){
        // this.start('#youhou')
        
        
    },
    methods: {
        start(id){
            var draft = new ArboratorDraft();
            var svg = draft.getSvg(this.test, id);
        }
    }
}
</script>