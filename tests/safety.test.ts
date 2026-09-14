import {describe,it,expect} from 'vitest';
function risk(redFlag:boolean,ruleRisk:'low'|'moderate'|'high'|'emergency'){if(redFlag)return 'emergency';return ruleRisk}
describe('risk priority',()=>{it('red flags override normal rule risk',()=>{expect(risk(true,'low')).toBe('emergency')});it('preserves normal risk when no red flag',()=>{expect(risk(false,'moderate')).toBe('moderate')})});
