<template>
</template>

<script>
export default {
  props: ["sentenceBus"],
  data() {
    return {
      userId: "",
    };
  },
  mounted() {
    this.sentenceBus.$on("export:SVG", ({ userId }) => {
      this.userId = userId;
      this.getSVG();
    });
  },
  beforeDestroy() {
    this.sentenceBus.$off("export:SVG");
  },
  methods: {
    /**
     * Get the SVG by creating it using snap arborator plugin and then replacing the placeholder in the current DOM
     * @todo instead of this long string, read the actual css file and put it there.
     *
     * @returns void
     */
    getSVG() {
      // todo: instead of this long string, read the actual css file and put it there.
      // var svg = this.graphInfo.conllGraph.snap.treedata.s.toString();
      const sentenceSVG = this.sentenceBus[this.userId]
      var svg = sentenceSVG.snapSentence.toString();
      var style = `<style> 
<![CDATA[  
   .curve {
	stroke: black;
	stroke-width: 1;
	fill: none;
}
.dark .curve {
	stroke: rgb(248, 244, 244);
	stroke-width: 1;
	fill: none;	
}
.arrowhead {
	fill: white;
	stroke: black;
	stroke-width: .8;
}
.FORM {
	fill:black;
	text-align: center;
} 
.dark .FORM {
		fill:rgb(255, 255, 255);
		text-align: center;
	}
.LEMMA {
	font: 15px DejaVu Sans;
	fill: black;
	font-family:sans-serif;
	text-align: center;
	font-style: italic;
} 
.dark .LEMMA {
	font: 15px DejaVu Sans;
	fill: rgb(238, 232, 232);
	font-family:sans-serif;
	text-align: center;
	font-style: italic;
} 
.MISC-Gloss {
	font: 15px DejaVu Sans;
	fill: rgb(124, 96, 86);
	font-family:sans-serif;
	text-align: center;
	font-style: italic;
} 
.UPOS {
	font: 11px DejaVu Sans;
	fill: rgb(80, 29, 125);
	text-align: center;
} 
.UPOSselected {
	font: 11px DejaVu Sans;
	fill: #dd137bff;
	font-weight: bold;
	text-align: center;
} 
.DEPREL {
	font: 12px Arial;
	fill: #501d7d;
	font-style: oblique;
	font-family:sans-serif;
	cursor:pointer;
	--funcCurveDist:3; /* distance between the function name and the curves highest point */
} 
.dark .DEPREL {
	font: 12px Arial;
	fill: #aab3ff;
	font-style: oblique;
	font-family:sans-serif;
	cursor:pointer;
	--funcCurveDist:3; /* distance between the function name and the curves highest point */
}
    ]]>  
</style> `;

      svg = svg.replace(
        /<desc>Created with Snap<\/desc>/g,
        "<desc>Created with Snap on Arborator</desc>"
      );
      svg = svg.replace(/>/g, ">\n");
      svg = svg.replace(/(<svg.*>)/, "$1\n" + style);
      const url = window.URL.createObjectURL(
        new Blob([svg], { type: "image/svg+xml" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", sentenceSVG.svgID + ".svg");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // this.table.exporting = false;
      this.$q.notify({ message: `Files downloaded` });
    },
    /**
     * Handle token click event to display the related dialog
     *
     * @param {Event} event
     * @returns void
     */
    ttselect(event) {
      // triggered if some letters of the sentence are selected
      if ("conllGraph" in this.$refs)
        var cg = this.$refs.conllGraph.filter((c) => c.user == this.tab)[0];
      if (cg)
        cg.openTokenDialog(
          // if the user's conllGraph is open:
          event.srcElement.selectionStart,
          event.srcElement.selectionEnd,
          event.srcElement.value.substring(
            event.srcElement.selectionStart,
            event.srcElement.selectionEnd
          )
        );
    },
  },
};
</script>
<style>
</style>