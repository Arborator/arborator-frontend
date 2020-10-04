import { testConllString, conllToJson } from "./Conll.js";
const sentenceJson = conllToJson(testConllString);
console.log(sentenceJson);
