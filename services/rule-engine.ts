import Rule from '@/models/Rule';
import RedFlag from '@/models/RedFlag';
import type {AnalysisInput,AnalysisResult,RiskLevel,RuleMatch} from '@/types';

const DISCLAIMER='This tool provides general health information and rule-based advisories. It does not diagnose disease and does not replace assessment by a qualified healthcare professional.';

function riskRank(r:RiskLevel){return {low:0,moderate:1,high:2,emergency:3}[r];}

export async function analyzeSymptoms(input:AnalysisInput):Promise<AnalysisResult>{
  const symptomIds=new Set(input.symptoms.flatMap(s=>s.symptomId?[s.symptomId]:[]));
  const custom=input.symptoms.filter(s=>!s.symptomId&&s.customText).map(s=>s.customText!.trim());
  const rules=await Rule.find({status:'active'}).populate('advisoryId').populate('requiredSymptoms optionalSymptoms excludedSymptoms').lean();
  const redFlags=await RedFlag.find({status:'active'}).sort({priority:-1}).populate('symptomIds').lean();
  const detected=redFlags.filter(flag=>{
    const idMatch=(flag.symptomIds??[]).some((s:any)=>symptomIds.has(String(s._id)));
    const textMatch=custom.some(t=>flag.keywords.some(k=>t.toLowerCase().includes(k.toLowerCase())));
    return idMatch||textMatch;
  }).map(flag=>({name:flag.name,message:flag.message,matchedText:custom.find(t=>flag.keywords.some(k=>t.toLowerCase().includes(k.toLowerCase())))||'Selected symptom matched a red-flag rule.'}));

  const matches:RuleMatch[]=[];
  for(const rule of rules){
    const weights=rule.symptomWeights as unknown as Map<string,number>;
    const weightObj=weights instanceof Map?Object.fromEntries(weights):weights||{};
    const excluded=(rule.excludedSymptoms??[]).some((s:any)=>symptomIds.has(String(s._id)));
    if(excluded) continue;
    const allWeighted=Object.entries(weightObj) as [string,number][];
    const maxScore=allWeighted.reduce((a,[,w])=>a+w,0);
    const matched=allWeighted.filter(([id])=>symptomIds.has(id));
    const score=matched.reduce((a,[,w])=>a+w,0);
    const required=(rule.requiredSymptoms??[]).map((s:any)=>String(s._id));
    const missingRequired=required.filter(id=>!symptomIds.has(id));
    if (missingRequired.length > 0) continue;
    if (score < rule.minimumScore) continue;
    const names=(rule.requiredSymptoms??[]).map((s:any)=>({id:String(s._id),name:s.name}));
    const missingNames=names.filter((x:any)=>!symptomIds.has(x.id)).map((x:any)=>x.name);
    const matchedNames=matched.map(([id])=>names.find((n:any)=>n.id===id)?.name||id);
    const advisory=(rule.advisoryId as any)?.body||'Consider discussing persistent or concerning symptoms with a qualified healthcare professional.';
    matches.push({ruleId:String(rule._id),ruleVersion:rule.version,name:rule.name,description:rule.description,score,maxScore,minimumScore:rule.minimumScore,matchedSymptoms:matchedNames,missingSymptoms:missingNames,explanation:`This predefined pattern was matched because ${matchedNames.length} weighted symptom${matchedNames.length===1?' was':'s were'} present and the rule threshold was met.`,advisory});
  }
  matches.sort((a,b)=>b.score-a.score);
  let risk:RiskLevel=detected.length?'emergency':'low';
  for(const match of matches){const r=(rules.find(x=>String(x._id)===match.ruleId)?.riskLevel||'low') as RiskLevel;if(riskRank(r)>riskRank(risk))risk=r;}
  if(!detected.length && risk==='low' && matches.some(m=>m.score>=m.minimumScore*1.5)) risk='moderate';
  const advisory=detected.length?'Urgent professional medical attention may be appropriate because a red-flag symptom was identified.':matches[0]?.advisory||'No sufficiently matching predefined health pattern was found. Consider seeking evaluation from a qualified healthcare professional if symptoms persist, worsen, or concern you.';
  return {riskLevel:risk,redFlags:detected,matches,unknownSymptoms:custom,noMatch:matches.length===0,advisory,disclaimer:DISCLAIMER};
}
